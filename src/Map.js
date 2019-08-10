import React, { Component } from "react";
import OlMap from "ol/Map";
import OlView from "ol/View";
import OlLayerTile from "ol/layer/Tile";
import OlSourceOSM from "ol/source/OSM";
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Overlay from 'ol/Overlay';
import Proj4 from 'proj4';
import 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import axios from 'axios';
import { PopupboxManager,PopupboxContainer} from 'react-popupbox';
import './react-popupbox.css';


class Map extends Component {
  constructor(props) {
    super(props);

    this.state = { center: [-12695120.279772, 6628236.907749], zoom: 10, olmap: new OlMap, popupboxConfig:null, jsnres: {}};
      this.olmap=new OlMap({
      target: null,
      projection: 'EPSG:3875',
      layers: [
        new OlLayerTile({
          source: new OlSourceOSM()
        }),
      ],
      view: new OlView({
        center: this.state.center,
        zoom: this.state.zoom,
      })
    });

    this.state.olmap=this.olmap;
    
  }

  updateMap() {
    
    this.olmap.getView().setCenter(this.state.center);
    this.olmap.getView().setZoom(this.state.zoom);
   var st=this.state;
    var image = new CircleStyle({
      radius: 5,
      fill: null,
      stroke: new Stroke({color: 'red', width: 1})
    });
    
    var geoJsonFeatures2={
    "type":"FeatureCollection",
    'crs': {
      'type': 'name',
      'properties': {
        'name': 'EPSG:4326'
      }
    },
    "features":[{
        "type":"Feature",
        "geometry":{
            "type":"Point",
            "coordinates":[]
        },
        "properties":null
    }]};
var url='https://toronto-bike-snapshot.sensorup.com/v1.0/Locations';
    axios.get(this.props.url).then(function(success) {

 var count=success.data.value.length;
 var i;
 for(i=0;i<count;i++)
 {
  geoJsonFeatures2.features[i]={"type":"Feature",
  "geometry":{
      "type":"Point",
      "coordinates":[]
  },
  "properties":null};
 geoJsonFeatures2.features[i].geometry=success.data.value[i].location;
 geoJsonFeatures2.features[i].properties=success.data.value[i].name+"*"+success.data.value[i].description;
 //console.log(success.data.value[i].location);
 }
 var geoJsonFeatures=geoJsonFeatures2;
  console.log(geoJsonFeatures);
  var styles = {
    'Point': new Style({
      image: image
    }),}
    var styleFunction = function(feature) {
      return styles[feature.getGeometry().getType()];
    };
    var vectorSource = new VectorSource({
      features: (new GeoJSON()).readFeatures(geoJsonFeatures,{ defaultDataProjection: 'EPSG:4326',featureProjection:'EPSG:3857' })
    });
    
    var vectorLayer = new VectorLayer({
      source: vectorSource,
      style: styleFunction,
    });
    st.olmap.addLayer(vectorLayer);
    });

 
    st.olmap.on('click', function(evt){
      var feature = st.olmap.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
          return feature;
        },{
          hitTolerance: 5
        });
      if (feature) {
          var geometry = feature.getGeometry();
          var coord = geometry.getCoordinates();
          var propert=feature.getProperties();
          var showval="";
          var i;
          for(i in propert)
          {
            if(!(typeof propert[i]==='object' || propert[i]==='undefined'))
            showval+=propert[i];
          }
          var strpop=[];
          strpop= showval.split("*",2);
          var headerpop=strpop[0];
          var bodypop=strpop[1];
          console.log(bodypop);
          var content = (
            <div>
              <h1>{headerpop}</h1>
              <h5>{bodypop}</h5>
             
            </div>
          )
          PopupboxManager.open({ content })
          st.popupboxConfig = {
            titleBar: {
              enable: true,
              text: 'Popupbox Demo'
            },
            fadeIn: true,
            fadeInSpeed: 500
          }
          
          console.log(showval);
          //alert(feature.getProperties().value);
      }
  }); 
  return this.state.jsnres;
  }

  componentDidMount() {
    
    this.olmap.setTarget("map");

    // Listen to map changes
    this.olmap.on("moveend", () => {
      let center = this.olmap.getView().getCenter();
      let zoom = this.olmap.getView().getZoom();
      this.setState({ center, zoom });
    });
  
  }

  shouldComponentUpdate(nextProps, nextState) {
    
    let center = this.olmap.getView().getCenter();
    let zoom = this.olmap.getView().getZoom();
    if (center === nextState.center && zoom === nextState.zoom) return false;
    return true;
    
  }

  userAction() {
    this.setState({ center: [-12695120.279772, 6628236.907749], zoom: 15 });
  }

  render() {
    this.updateMap();
     // Update map on render?
     var popupboxConfig=this.state.popupboxConfig;
    return (
    /*  <div id="map" style={{ width: "100%", height: "360px" }}>
        <button onClick={e => this.userAction()}>setState on click</button>
      </div>*/
      <div id="map" className="map" style={{ width: "100%", height: "50%" }}>
     <PopupboxContainer { ... this.state.popupboxConfig }/>    
      </div>
    );
  }
}

export default Map;
