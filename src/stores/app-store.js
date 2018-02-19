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

import React from 'react';
import { observable, computed, action, toJS } from 'mobx';
import jsonp from 'jsonp';
import jQuery from 'jquery';
import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/button.css';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/button';
import moment from 'moment';

export class AppStore {
    // -----------------------------------------------------------------------------------------
    // Display status of 30-Day Trend ----------------------------------------------------------
    // For Components: TrendButton, DisplayTrend -----------------------------------------------
    // -----------------------------------------------------------------------------------------
    @observable trend_status=true;
    @action updateTrendStatus = (b) => { this.trend_status = b };
    @computed get trendStatus() { return this.trend_status };

    // -----------------------------------------------------------------------------------------
    // Display status for Full Season ----------------------------------------------------------
    // For Components: SeasonButton, DisplaySeason - -------------------------------------------
    // -----------------------------------------------------------------------------------------
    @observable season_status=false;
    @action updateSeasonStatus = (b) => { this.season_status = b };
    @computed get seasonStatus() { return this.season_status };

    // -----------------------------------------------------------------------------------------
    // Display status for climate change results -----------------------------------------------
    // For Components: ClimateChangeButton -----------------------------------------------------
    // -----------------------------------------------------------------------------------------
    @observable climate_change_status=false;
    @action updateClimateChangeStatus = (b) => {
        this.climate_change_status = b
    };
    @computed get climateChangeStatus() { return this.climate_change_status };
    cc_placeholder_content=
        <div>
        <b>Coming Soon:</b> Over the next several months, our programming team will be incorporating data from downscaled climate change projections into each tool, covering the Northeastern United States. The climate change projections are determined from the <a href="http://cmip-pcmdi.llnl.gov/cmip5/" target="_blank" rel="noopener noreferrer">CMIP5 climate models</a>, maintained by the Northeast Regional Climate Center (<a href="http://www.nrcc.cornell.edu" target="_blank" rel="noopener noreferrer">NRCC</a>) at Cornell. This data will provide the long-term context for the data shown in each Climate Smart Farming Tool – for example, in this tool, the climate projections data will provide context for how climate change will affect potential damage to grape production in the future. This type of information will help farmers and decision makers understand how climate change will likely affect them over the coming decades. For more information, please contact us at <a href="mailto:cicss@cornell.edu?subject=CSF water deficit tool info">cicss@cornell.edu</a>.
        </div>;

    // -----------------------------------------------------------------------------------------
    // Display status for Data Sources and References ------------------------------------------
    // For Components: InfoButton & InfoWindow -------------------------------------------------
    // -----------------------------------------------------------------------------------------
    @observable info_status=false;
    @action updatePopupStatus = () => { this.info_status = !this.info_status };
    @computed get popupStatus() { return this.info_status };
    info_content = 
        <div>
               <h2>Data sources and methods</h2>
               <h4><br/>&bull; GRAPE BUD HARDINESS TEMPERATURE</h4>
               <p>
               Hardiness temperatures are calculated based on the methodology outlined in Ferguson et al. (2013).  Daily mean air temperature (Tmean) is used to calculate changes in acclimation and deacclimation allowing a daily cold hardiness temperature to be specified. 
               </p>
               <p>
               Ferguson, J.C., Moyer, M.M., Mills, L.J., Hoogenboom, G. and Keller, M., 2013. Modeling dormant bud cold hardiness and budbreak in 23 Vitis genotypes reveals variation by region of origin. American Journal of Enology and Viticulture, pp.ajev-2013.
               </p>
               <h4>&bull; AIR TEMPERATURE DATA</h4>
               <p>
               The 2.5 x 2.5 mile gridded dataset of maximum and minimum air temperatures is produced daily for the Northeast United States by the <a href="http://www.nrcc.cornell.edu" target="_blank" rel="noopener noreferrer">Northeast Regional Climate Center</a>, using methods described in Degaetano and Belcher (2007). These data are available for use through the Applied Climate Information System (<a href="http://www.rcc-acis.org" target="_blank" rel="noopener noreferrer">ACIS</a>) web service.
               </p>
               <p>
               Degaetano, A.T. and B.N. Belcher. (2007). Spatial Interpolation of Daily Maximum and Minimum Air Temperature Based on Meteorological Model Analyses and Independent Observations. Journal of Applied Meteorology and Climatology. 46.
               </p>
        </div>;

    // -----------------------------------------------------------------------------------
    // Interest Date Picker --------------------------------------------------------------
    // For Components: InterestDatePicker ------------------------------------------------
    // -----------------------------------------------------------------------------------
    @observable interest_date = moment();
    @action initInterestDate = () => {
        let validMonths = [1,2,3,4,5,6,9,10,11,12];
        let currentMonth = moment().month() + 1;
        let currentYear = moment().year();
        if (validMonths.includes(currentMonth)) {
            this.interest_date = moment()
            //this.updateInterestDate( moment() )
        } else {
            this.interest_date = moment('03/15/'+currentYear.toString(),'MM/DD/YYYY');
            //this.updateInterestDate( moment('03/15/'+currentYear.toString(),'MM/DD/YYYY') );
        }
        this.initSeason(this.getInterestDate)
    };
    @action updateInterestDate = (v) => {
      console.log('INSIDE updateInterestDate')
      this.interest_date = v
      this.updateSeason(v)
    };
    @computed get getInterestDate() {
      return this.interest_date
    };

    @observable season = [];
    @action initSeason = (d) => {
        let validMonthsEarlySeason = [9,10,11,12];
        let validMonthsLateSeason = [1,2,3,4,5,6];
        let month = moment(d).month() + 1;
        let year = moment(d).year();
        let seasonArray = [];
        if (validMonthsEarlySeason.includes(month)) {
            seasonArray = [year,year+1]
        } else if (validMonthsLateSeason.includes(month)) {
            seasonArray = [year-1,year]
        } else {
            seasonArray = [year-1,year]
        }
        this.season = seasonArray
    }
    @action updateSeason = (d) => {
        let validMonthsEarlySeason = [9,10,11,12];
        let validMonthsLateSeason = [1,2,3,4,5,6];
        let month = moment(d).month() + 1;
        let year = moment(d).year();
        let seasonArray = [];
        if (validMonthsEarlySeason.includes(month)) {
            seasonArray = [year,year+1]
        } else if (validMonthsLateSeason.includes(month)) {
            seasonArray = [year-1,year]
        } else {
        }
        if (this.getSeason[1] !== seasonArray[1]) {
            console.log('INSIDE updateSeason : season changed')
            this.season = seasonArray
            this.downloadData()
        }
    }
    @computed get getSeason() {
      return this.season
    };

    // -----------------------------------------------------------------------------------
    // Grape variety selection -----------------------------------------------------------
    // For Components: GrapeRadioSelect --------------------------------------------------
    // -----------------------------------------------------------------------------------
    //@observable grape_variety='cab_franc';
    @observable grape_variety='riesling';
    @action updateGrapeVariety = (changeEvent) => {
            this.grape_variety = changeEvent.target.value
        }
    @action updateGrapeVarietyFromText = (v) => {
            this.grape_variety = v
        }
    @computed get getGrapeVariety() {
        return this.grape_variety
    }

    // -----------------------------------------------------------------------------------
    // Location Picker -------------------------------------------------------------------
    // For Components: LocationPicker ----------------------------------------------------
    // -----------------------------------------------------------------------------------
    map_dialog=null;
    manage_local_storage=null;

    // Location ID -------------------------------------------
    @observable location_id='default';
    @action updateLocationId = (i) => {
            this.location_id = i;
        }
    @computed get getLocationId() {
            return this.location_id
        }

    // Location coordinates ----------------------------------
    @observable lat='42.50';
    @observable lon='-76.50';
    @action updateLocation = (lt,ln) => {
            if ((this.getLat !== lt) || (this.getLon!==ln)) {
                console.log('INSIDE updateLocation : location changed')
                this.lat = lt;
                this.lon = ln;
                this.downloadData()
            }
        }
    @computed get getLat() {
            return this.lat
        }
    @computed get getLon() {
            return this.lon
        }

    // Location address --------------------------------------
    @observable address='Cornell University, Ithaca, NY';
    @action updateAddress = (a) => {
            this.address = a;
        }
    @computed get getAddress() {
            return this.address
        }


    // Location default --------------------------------------
    @observable default_location;
    @action updateDefaultLocation = () => {
            this.default_location = {address:this.getAddress, lat:parseFloat(this.getLat), lng:parseFloat(this.getLon), id:this.getLocationId};
        }
    @computed get getDefaultLocation() {
            return this.default_location
        }


    // Initialize the local storage manager
    @action initStorageManager = (namespace) => {
        //console.log('initStorageManager');
        let storage_options = {
            namespace: namespace,
            expireDays: 3650
        }
        jQuery().CsfToolManageLocalStorage(storage_options);
        this.manage_local_storage = jQuery().CsfToolManageLocalStorage();
        this.manage_local_storage("init");
    }

    // Initialize the location state
    @action initLocationState = () => {
        //console.log('initLocationState');
        let selected_id = this.manage_local_storage("read","selected");
        let locations = this.manage_local_storage("read","locations");
        let loc_obj = null;
        if (locations !== undefined) {
            loc_obj = locations[selected_id]
        } else {
            loc_obj = null
        }
        this.updateDefaultLocation();
        if (loc_obj) {
            this.updateLocationId(loc_obj.id);
            this.updateAddress(loc_obj.address);
            this.updateLocation(loc_obj.lat.toString(),loc_obj.lng.toString());
        } else {
            this.updateLocationId(this.default_location.id);
            this.updateAddress(this.default_location.address);
            this.updateLocation(this.default_location.lat.toString(),this.default_location.lng.toString());
            // WRITE DEFAULT LOCATION IF NO LOCATIONS EXIST
            this.manage_local_storage("write","locations",{default: this.default_location});
            this.manage_local_storage("write","selected",this.default_location.id);
        }
    }

    // Initialize the map dialog
    @action initMapDialog = () => {
            //console.log('initMapDialog');
            //var default_location = this.getDefaultLocation
            var default_location = {address:this.getAddress, lat:parseFloat(this.getLat), lng:parseFloat(this.getLon), id:"default"};
            //var options = { width:600, height:500, google:google, default:default_location };
            var options = { width:600, height:500, google:window.google, default:default_location };
            jQuery(".csftool-location-dialog").CsfToolLocationDialog(options);
            this.map_dialog = jQuery(".csftool-location-dialog").CsfToolLocationDialog();
            this.map_dialog("bind", "close", (ev, context) => {
                let loc_obj = context.selected_location;
                this.updateLocationId(loc_obj.id);
                this.updateAddress(loc_obj.address);
                this.updateLocation(loc_obj.lat.toString(),loc_obj.lng.toString());

                // WRITE LOCATIONS THE USER HAS SAVED
                this.manage_local_storage("write","locations",context.all_locations);
                this.manage_local_storage("write","selected",this.getLocationId);

                // REMOVE LOCATIONS THE USER HAS DELETED
                var idsToDelete = this.manage_local_storage("getExtraKeys", "locations", context.all_locations);
                this.manage_local_storage("delete", "locations", idsToDelete);
            });
        }

    // Open map with all saved locations
    @action openMap = () => {
            let locations = this.manage_local_storage("read","locations");
            let selected_id = this.manage_local_storage("read","selected");
            this.map_dialog("locations", locations);
            this.map_dialog("open", selected_id);
        }


    // -----------------------------------------------------------------------------------
    // Control Loaders (Spinners) --------------------------------------------------------
    // -----------------------------------------------------------------------------------
    // Logic for displaying spinner
    @observable loader_data=false;
    @action updateLoaderData = (l) => {
            this.loader_data = l;
        }
    @computed get getLoaderData() {
            return this.loader_data
        }


    // -----------------------------------------------------------------------------------
    // API -------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------

    // store downloaded data
    @observable chart_data = null;
    @action updateChartData = (d) => {
            if (this.getChartData) { this.chart_data = null }
            this.chart_data = d;
        }
    @computed get getChartData() {
            return this.chart_data
        }

    // check variety availability
    @computed get cabfrancIsAvailable() {
            if (this.getChartData !== null) {
                return 'cab_franc' in toJS(this.getChartData);
            } else {
                return false
            }
        }
    @computed get concordIsAvailable() {
            if (this.getChartData !== null) {
                return 'concord' in toJS(this.getChartData);
            } else {
                return false;
            }
        }
    @computed get rieslingIsAvailable() {
            if (this.getChartData !== null) {
                return 'riesling' in toJS(this.getChartData);
            } else {
                return false
            }
        }

    @action downloadData = () => {
            if (this.getLoaderData === false) { this.updateLoaderData(true); }
            const url = 'http://tools.climatesmartfarming.org/tstbtool/data/?lat='+this.getLat+'&lon='+this.getLon+'&year='+this.getSeason[1]
            jsonp(url, null, (err,data) => {
                if (err) {
                    console.error(err.message);
                    return
                } else {
                    //console.log('DOWNLOADED DATA COMPLETE');
                    // test missing key
                    //if (this.getSeason[1]===2018) {delete data['cab_franc']}
                    //if (this.getSeason[1]===2018) {delete data['concord']}
                    //if (this.getSeason[1]===2018) {delete data['riesling']}
                    if (Object.keys(data).length > 0) {
                        // update grape variety if currently selected is missing
                        if (!(this.getGrapeVariety in data)) { this.updateGrapeVarietyFromText(Object.keys(data)[0]) };
                        // update chart data
                        this.updateChartData(data);
                    } else {
                        this.updateChartData(null);
                    }
                    if (this.getLoaderData === true) { this.updateLoaderData(false); }
                    return
                }
            });
        }

}

