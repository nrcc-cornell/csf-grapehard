///////////////////////////////////////////////////////////////////////////////
//
// Climate Smart Farming Grape Hardiness and Freeze Risk Tool
// Copyright (c) 2018 Cornell Institute for Climate Smart Solutions
// All Rights Reserved
//
// This software is published under the provisions of the GNU General Public
// License <http://www.gnu.org/licenses/>. A text copy of the license can be
// found in the file 'LICENSE' included with this software.
//
// A text copy of the copyright notice, licensing conditions and disclaimers
// is available in the file 'COPYRIGHT' included with this software.
//
///////////////////////////////////////////////////////////////////////////////

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Loader from 'react-loader-advanced';
import Highcharts from 'highcharts';
import ReactHighcharts from 'react-highcharts';
import moment from 'moment';

import '../../styles/DisplayTrend.css';
import '../../styles/loader.css';

const spinner = <div className="loader"></div>

@inject("store") @observer
class DisplayTrend extends Component {

  render() {

        if ( (this.props.store.app.trendStatus) && (this.props.store.app.getChartData) ) {

            var data = this.props.store.app.getChartData
            var variety = this.props.store.app.getGrapeVariety

            // assign important dates that we will refer to frequently
            let firstYearOfSeason = this.props.store.app.getSeason[0]
            let firstDayOfSeason = moment.utc(firstYearOfSeason+'-09-15', 'YYYY-MM-DD')
            let secondYearOfSeason = this.props.store.app.getSeason[1]
            let lastDayOfSeason = moment.utc(secondYearOfSeason+'-06-30', 'YYYY-MM-DD')
            let idxFirstFcst = data[variety]['mint'].length
            let firstFcstDate = null
            //let lastObsDate = null
            if (data[variety]['firstFcstDate']==="") {
                idxFirstFcst = data[variety]['mint'].length
                firstFcstDate = null
                //lastObsDate = null
            } else {
                firstFcstDate = moment.utc(data[variety]['firstFcstDate'],'YYYY-MM-DD')
                //lastObsDate = moment.utc(data[variety]['firstFcstDate'],'YYYY-MM-DD').subtract(1,'days')
                idxFirstFcst = firstFcstDate.diff(firstDayOfSeason,'days')
            }

            let grape_labels = {
                'cab_franc': 'Cabernet Franc',
                'concord': 'Concord',
                'riesling': 'Riesling',
            }

            function daysUntilToday(d) {
                let today = moment.utc()
                return today.diff(d, 'days')
            }

            const getXaxisMin = () => {
                // xMin will be set to 30 days prior to xMax - the viewable time period on chart will be 30 days
                let xMin = getXaxisMax();
                xMin = xMin.subtract(30,'days');
                // if xMin is set prior to first day of season, reset it to the first day of season
                if (xMin < firstDayOfSeason) {
                    xMin = moment.utc().set({'year': firstDayOfSeason.year(), 'month': firstDayOfSeason.month(), 'date': firstDayOfSeason.date()})
                }
                return xMin
            }

            const getXaxisMax = () => {
                let dateActive = this.props.store.app.getInterestDate;
                let xMax = null;
                let daysBack = daysUntilToday(dateActive);
                if (daysBack < 15) {
                    // set xMax to the last forecast day
                    xMax = moment.utc(firstYearOfSeason+'-09-15', 'YYYY-MM-DD').add(data[variety]['mint'].length,'days')
                } else {
                    // set xMax to 15 days after the selected date
                    xMax = moment.utc().set({'year': dateActive.year(), 'month': dateActive.month(), 'date': dateActive.date()}).add(15,'days')
                }
                if (xMax > lastDayOfSeason) {
                    // if xMax is set to after the last day of the season, reset it to the last day of season
                    xMax = moment.utc().set({'year': lastDayOfSeason.year(), 'month': lastDayOfSeason.month(), 'date': lastDayOfSeason.date()})
                }
                return xMax
            }

            // determine if 50% damage potential exists during the growing season
            const freezePotentialExists = () => {
                let idx;
                let idxEnd = (data[variety]['hardtemp'].length < data[variety]['mint'].length) ? data[variety]['hardtemp'].length : data[variety]['mint'].length;
                for (idx=0; idx<idxEnd; idx++) {
                    if (data[variety]['mint'][idx] < data[variety]['hardtemp'][idx]) { return true }
                }
                return false
            }

            // determine if the forecasts are viewable in the currently displayed chart
            const fcstInView = () => {
                if (firstFcstDate === null) { return false }
                if (firstFcstDate > lastDayOfSeason) { return false }
                if (firstFcstDate > getXaxisMax()) { return false }
                return true
            }

            /////////////////////////
            // The following two functions are for including shading when minimum temperatures fall below damage threshold temperature
            // (there is no simple way in highcharts when lines cross, and you want to shade a limited area between lines)
            // From discussion : https://stackoverflow.com/questions/18986583/cant-add-nice-shading-to-highcharts
            // and fiddle : http://jsfiddle.net/SpaceDog/Twdft/
            /////////////////////////
            function getIntersection(p1, p2, p3, p4) { 
              // Intersection of lines from Wikipedia: http://en.wikipedia.org/wiki/Line-line_intersection

              let denom = ((p1.plotX - p2.plotX)*(p3.plotY - p4.plotY) - (p1.plotY - p2.plotY)*(p3.plotX - p4.plotX)); 
              let px = ((( (p1.plotX)*(p2.plotY) - (p1.plotY)*(p2.plotX) )*(p3.plotX - p4.plotX)) -
                  ((p1.plotX - p2.plotX)*(p3.plotX*p4.plotY - p3.plotY*p4.plotX))
                  )/denom;
              let py = ((( (p1.plotX)*(p2.plotY) - (p1.plotY)*(p2.plotX) )*(p3.plotY - p4.plotY)) -
                  ((p1.plotY - p2.plotY)*(p3.plotX*p4.plotY - p3.plotY*p4.plotX))
                  )/denom;
              return { plotX: px, plotY: py }; 
            }

            var under_path = null;
            function updateChart(chart) {

                // Get the data from the chart
                // series 3 & 4 are hardiness temps and fcsts
                // series 1 & 2 are minimum temps and fcsts
                let aPts = chart.series[3].points;
                let aPts_more = chart.series[4].points;
                let bPts = chart.series[1].points;
                let bPts_more = chart.series[2].points;
                aPts = aPts.concat(aPts_more)
                bPts = bPts.concat(bPts_more)

                // If one of the series has no length, return without updating
                if (aPts.length === 0 || bPts.length === 0) { return }

                // make sure length of arrays are the same
                // - we can only draw shading up to the date of equivalent length
                if (aPts.length > bPts.length) {
                    aPts = aPts.slice(0,bPts.length)
                } else if (aPts.length < bPts.length) {
                    bPts = bPts.slice(0,aPts.length)
                } else {
                }

                // Create the paths on the first call ...
                if (!under_path) {        
                    under_path = chart.renderer.path();
                    under_path.attr({fill: '#eebbbb'}).add();     
                }
    
                var i; 
                var underPts = [];    // SVG path instructions
                var mX = chart.plotLeft;  // Offset for each point
                var mY = chart.plotTop;
                var iPt;                  // For the intersection points

                // Draw the path along line B, than back along A/B 
                // to complete a closed space. First go along B

                underPts[0] = 'M'; // Move to start
                underPts[1] = bPts[0].plotX + mX;
                underPts[2] = bPts[0].plotY + mY;
                underPts[3] = 'L'; // Draw from here
                for (i=1; i<aPts.length; i++) { 
                    underPts[underPts.length] = bPts[i].plotX + mX;
                    underPts[underPts.length] = bPts[i].plotY + mY;
                }

                // Now go backwards along A looking for the cross-overs ...    
                var dir = 0;    
                var newDir = 0;
                for (i=(aPts.length - 1); i>=0; i--) { 
                    var A = aPts[i].plotY + mY;
                    var B = bPts[i].plotY + mY;

                    newDir = (A>B)?1:((A<B)?-1:0);
                    if (dir && (dir !== newDir)) {
                        // Change direction, add intersect point
                        iPt = getIntersection(aPts[i], aPts[i+1], bPts[i], bPts[i+1]);
                        underPts[underPts.length] =iPt.plotX + mX;
                        underPts[underPts.length] = iPt.plotY + mY
                    }
                    dir = newDir;

                    // Add matching data point 
                    underPts[underPts.length] = aPts[i].plotX + mX;
                    if (A > B) { 
                        underPts[underPts.length] = A;
                    } else { 
                        underPts[underPts.length] = B;
                    }        
                }        

                // Update new path
                under_path.attr({'d': underPts});

            }

            function tooltipFormatter() {
                var i, item;
                var header = '<span style="font-size:14px;font-weight:bold;text-align:center">' + Highcharts.dateFormat('%b %d, %Y', this.x) + '</span>';
                var tips = "";
                for (i=0; i<this.points.length; i++) {
                    item = this.points[i];
                    if (item.series.type === "line") {
                        if (item.series.name === "Hardiness Temp") {
                            tips += '<br/>' + item.y.toFixed(1) + ' : <span style="color:'+item.color+';font-size:12px;font-weight:bold">' +  item.series.name + '</span>';
                        }
                        if (item.series.name === "Hardiness Forecast") {
                            tips += '<br/>' + item.y.toFixed(1) + ' : <span style="color:'+item.color+';font-size:12px;font-weight:bold">' +  item.series.name + '</span>';
                        }
                        if (item.series.name === "Min Temperature") {
                            tips += '<br/>' + item.y + ' : <span style="color:'+item.color+';font-size:12px;font-weight:bold">' +  item.series.name + '</span>';
                        }
                        if (item.series.name === "Min Temp Forecast") {
                            tips += '<br/>' + item.y + ' : <span style="color:'+item.color+';font-size:12px;font-weight:bold">' +  item.series.name + '</span>';
                        }
                    }
                }
                return header + tips;
            }

            const afterRender = (chart) => { chart.renderer.text('30-Day Results', 325, 85).css({ color:"#000000", fontSize:"16px"}).add() };

            var chartConfig = {
                 plotOptions: {
                     line: {
                         animation: true,
                     },
                     series: {
                         dataGrouping: {
                             enable: false,
                             //units: [
                             //    ['day', [1,2,3,4,5,6,7]]],
                             groupPixelWidth: 10
                         },
                         type: 'line',
                         step: true,
                         //pointStart: Date.UTC(firstYearOfSeason,8,15),
                         pointStart: firstDayOfSeason,
                         pointInterval: 24*3600*1000,
                         animation: { duration: 800 },
                         lineWidth: 4,
                         marker: {
                             symbol: 'circle',
                         },
                     }
                 },
                 //chart: { height: 460, width: 724, marginTop: 60, backgroundColor: null },
                 chart: { height: 460, width: 700, marginTop: 60, marginRight: 14, backgroundColor: null,
                     events: { 
                        load: function(e) { 
                            this.redraw();
                        },
                        redraw: function(e) { 
                            updateChart(this);
                            return
                        }
                    }
                 },
                 title: {
                     text: grape_labels[this.props.store.app.getGrapeVariety] + ' T50 Hardiness Temperature'
                 },
                 subtitle: {
                     text: '@ ' + this.props.store.app.getAddress,
                     style:{"font-size":"14px",color:"#000000"},
                 },
                 exporting: {
                   chartOptions: {
                     chart: {
                       backgroundColor: '#ffffff'
                     }
                   }
                 },
                 tooltip: { useHtml:true, shared:true, borderColor:"#000000", borderWidth:2, borderRadius:8, shadow:false, backgroundColor:"#ffffff",
                   style:{width:165,}, xDateFormat:"%b %d, %Y", positioner:function(){return {x:70, y:60}}, shape: 'rect',
                   crosshairs: { width:1, color:"#ff0000", snap:true, zIndex:10 }, formatter:tooltipFormatter },
                 credits: { text:"Powered by NRCC", href:"http://www.nrcc.cornell.edu/", color:"#000000" },
                 legend: { align: 'left', floating: true, borderColor:'#000000', borderWidth:1, borderRadius:8,  backgroundColor:'#ffffff', verticalAlign: 'top', layout: 'vertical', x: 60, y: 50 },
                 xAxis: { type: 'datetime', startOnTick: true, endOnTick: false, min: getXaxisMin(), max: getXaxisMax(), labels: { align: 'center', x: 0, y: 20 },
                     dateTimeLabelFormats:{ day:'%d %b', week:'%d %b', month:'%b<br/>%Y', year:'%Y' },
                 },
                 yAxis: { title:{ text:'Temperature (°F)', style:{"font-size":"14px", color:"#000000"}}, gridZIndex:4, labels:{style:{color:"#000000"}}},
                 series: [{
                     name: "50% Damage Potential", data: {}, color: '#eebbbb', lineWidth: 0, marker : {symbol: 'square', radius: 12 }, showInLegend: freezePotentialExists() },{
                     name: 'Hardiness Temp', data: data[variety]['hardtemp'].slice(0,idxFirstFcst), color: '#00bb00', lineWidth: 2, zIndex: 18 },{
                     name: 'Hardiness Forecast', pointStart: firstFcstDate, data: data[variety]['hardtemp'].slice(idxFirstFcst), dashStyle: 'dot', color: '#00bb00', lineWidth: 2, marker: { enabled: true }, showInLegend: fcstInView() },{
                     name: 'Min Temperature', data: data[variety]['mint'].slice(0,idxFirstFcst),  color: '#0000FF', step: false, lineWidth: 2, marker: { enabled: false }, zIndex: 20 },{
                     name: 'Min Temp Forecast', pointStart: firstFcstDate, data: data[variety]['mint'].slice(idxFirstFcst),  dashStyle: 'dot', color: '#0000FF', step: false, lineWidth: 2, marker: { enabled: true }, showInLegend: fcstInView() }
                 ]
            };

            return (
                <div className='trend-display-active'>
                  <Loader message={spinner} show={this.props.store.app.getLoaderData} priority={10} backgroundStyle={{backgroundColor: null}} hideContentOnLoad={true}>
                    <div className="trend-display-content">
                      <ReactHighcharts config={ chartConfig } callback={afterRender} isPureConfig />
                    </div>
                  </Loader>
                </div>
            )

        } else {
            return(false)
        }
  }

};

export default DisplayTrend;
