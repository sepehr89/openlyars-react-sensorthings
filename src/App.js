import React from 'react';
import './App.css';
import 'react-widgets/dist/css/react-widgets.css';
import 'bootstrap/dist/css/bootstrap.css';
import Combobox from 'react-widgets/lib/Combobox';
import { Component } from 'react';
import 'react-table/react-table.css';
import MaterialTable from 'material-table';
import axios from "axios";
import Map from './Map';
import DatetimeRangePicker from 'react-datetime-range-picker';
import 'react-datetime-range-picker/lib/style.css';

//import CalendarInput from '@lls/react-light-calendar';
//import '@lls/react-light-calendar/dist/index.css';
class App extends Component {
  constructor(props) {
    super(props);
  //set state values to access from DOM
  const date = new Date();
    const startDate = date.getTime();
    this.state = { value_age: 'Age', value_gender: 'Gender', vakue_data: 'data1',startDate, endDate: new Date(startDate).setDate(date.getDate() + 6) };
    this._child = React.createRef();
  }
  onChange = (startDate, endDate) => this.setState({ startDate, endDate })
  async subm() {
    var arraydata = [];
	//run get query by axios based on to other comboboxes values
    await axios.get(encodeURI("http://localhost:3000/recommendFood?ages=" + this.state.value_age + "&gender=" + this.state.value_gender))
      .then(result => {
		  // convert JSON to striong to prepare for building message sentences.
        var ages = JSON.stringify(result.data);
        var jsarr = [];
        jsarr = eval('(' + ages + ')');

        var i;
        var itm = [];
        for (i = 0; i < jsarr.length; i++) {
			//build message sentences based on JSON string keys and vlues
          var vals = 'Please serve ' + jsarr[i].servings + ' time ' + jsarr[i].srvg_sz + ' of ' + jsarr[i].food + ' in the ' + jsarr[i].foodgroup + ' group ' + ' based on following instruction:\n'
            + jsarr[i].directional;
          var record = {};
          record['agehead'] = vals;
          var placeholder = [];
		  // push and merge to arraydata to provide data for the table
          placeholder.push(record);
          arraydata = [...arraydata, ...placeholder];

        }
      }, error => {
        console.error(error);
      });
	 //provide data values for the defined state
    this.setState({ data1: arraydata })
  }
  render() {
	  //define constant values of the table and comboboxes
    let gender = ['Sensor', 'Female'];
    let ages = ['2 to 3',
      '4 to 8',
      '9 to 13',
      '14 to 18',
      '19 to 30',
      '31 to 50',
      '51 to 70',
      '71+'];
    const columns = [{
      title: 'type',
      field: 'type',
    },
    {
      title: 'geometry',
      field: 'geometry',
    }
    ,{
      title: 'properties',
      field: 'properties',
    }
    ];
    var leftcombdiv = {
      position: 'absolute',
  left: '10px',
  width:'40%',
    };
    var centcombdiv = {
      position: 'absolute',
     
      width:'40%',
    };
    return (
      
      <div className="App" style={{overflow:"hidden"}}>
        <div class="container-fluid" style={{width:"100%",marginBottom:"20px"}}>
          <div class="row" style={{width:"100%",marginBottom:"5px",marginTop:"5px"}}>
        <div class="col-lg-4">
          <Combobox 
            data={gender}
            defaultValue={"Things"}
            value_gender={this.state.value_gender}
            onChange={(value_gender) => { this.setState({ value_gender }) }}
          />
        </div>
        <div class="col-lg-4">
        <DatetimeRangePicker onChange={this.handler}
          />
        </div>
      <div class="col-lg-3">
          <button className="Button-Submit" style={{width:"50%",marginTop:"10px"}} onClick={this.subm.bind(this)}>
            Query
      </button>
        </div>
        </div>
        
        
        
          <div class="row" style={{marginBottom:"5px",marginTop:"5px"}}>
         <Map url='https://toronto-bike-snapshot.sensorup.com/v1.0/Locations' ref={this._child}></Map>
        </div>
        <div class="row" >
          <MaterialTable style={{width:"100%",}}
            data={this.state.data1} //{this._child.current.update()}
            columns={columns}
            title="Query results"
          />
        </div>
       
        </div>
      </div>
    );
  }
}
export default App;