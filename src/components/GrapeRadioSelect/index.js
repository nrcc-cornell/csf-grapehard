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

import '../../styles/GrapeRadioSelect.css';

@inject("store") @observer
class GrapeRadioSelect extends Component {

  labelCabernetFranc = () => {
      return this.props.store.app.cabfrancIsAvailable ? "Cabernet Franc" : "Cabernet Franc *"
  }

  labelConcord = () => {
      return this.props.store.app.concordIsAvailable ? "Concord" : "Concord *"
  }

  labelRiesling = () => {
      return this.props.store.app.rieslingIsAvailable ? "Riesling" : "Riesling *"
  }

  radioMessageClass = () => {
      if (this.props.store.app.getChartData === null) { return "radio-disabled-message" }
      return Object.keys(this.props.store.app.getChartData).length < 3 ? "radio-disabled-message" : "radio-disabled-message-display-none"
  }

  render() {
        return (
            <div className='radio-input-div'>
            <div className='radio-input-label'>
                <label><b>Grape Variety</b></label>
            </div>
            <div className='radio-div'>
                  <form>
                    <div className="radio">
                      <input type="radio" value="cab_franc" id="cab_franc"
                            disabled={!this.props.store.app.cabfrancIsAvailable}
                            checked={this.props.store.app.getGrapeVariety === 'cab_franc'} 
                            onChange={this.props.store.app.updateGrapeVariety} />
                      <label for="cab_franc">
                        {this.labelCabernetFranc()}
                      </label>
                    </div>
                    <div className="radio">
                      <input type="radio" value="concord" id="concord"
                            disabled={!this.props.store.app.concordIsAvailable}
                            checked={this.props.store.app.getGrapeVariety === 'concord'} 
                            onChange={this.props.store.app.updateGrapeVariety} />
                      <label for="concord">
                        {this.labelConcord()}
                      </label>
                    </div>
                    <div className="radio">
                      <input type="radio" value="riesling" id="riesling"
                            disabled={!this.props.store.app.rieslingIsAvailable}
                            checked={this.props.store.app.getGrapeVariety === 'riesling'} 
                            onChange={this.props.store.app.updateGrapeVariety} />
                      <label for="riesling">
                        {this.labelRiesling()}
                      </label>
                    </div>
                    <div className={this.radioMessageClass()}>
                      * variety currently unavailable
                    </div>
                  </form>
            </div>
            </div>
        )
  }

};

export default GrapeRadioSelect;
