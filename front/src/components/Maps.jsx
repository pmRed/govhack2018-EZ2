
import React, {Component} from 'react'
import 'leaflet/dist/leaflet.css'
import {Select} from 'semantic-ui-react'
import mlMap from '../stores/ml'

let L,E,chroma
L = require('leaflet')
E = require('esri-leaflet')
chroma = require('chroma-js')

var config = {}
config.params = {
    // maxBounds: new L.LatLngBounds(
    //     new L.LatLng(-35.309-0.2, 149.13-0.2), 
    //     new L.LatLng(-35.309+0.2, 149.13+0.2)
    // ),
    center: [-35.309,149.13],
    zoomControl: false,
    zoom: 11,
    scrollwheel: false,
    legends: true,
    infoControl: false,
    attributionControl: true
}
config.tileLayer = {
    uri: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    params: {
        zoom: 5,
        minZoom: 8, //Limited for performance reasons
        id: '',
        accessToken: ''
    }
}

// var colorScale = chroma.scale()
var colorScale = chroma.scale(['red', 'white','blue']).domain([-10,10])
class Map extends Component {
    constructor(props) {
        super(props)
        this.state = {
            map: null,
            tileLayer: null,
        }
    }

    init(id) {
        if (this.state.map) return
        let map = L.map(id, config.params)
        L.control.zoom({ position: 'bottomleft'}).addTo(map)
        L.control.scale({ position: 'bottomright'}).addTo(map)
        L.tileLayer(config.tileLayer.uri, config.tileLayer.params).addTo(map)

        var SA3Zones = E.featureLayer({
            url: 'https://geo.abs.gov.au/arcgis/rest/services/ASGS2016/POA/MapServer/0',
            style: function (e) {
                try {
                    var value=mlMap[e.properties.POA_CODE_2016]['deltaPeoplePC']
                }
                catch(err){
                    value = 0
                }
                return {color: colorScale(value)}
            }
        }).addTo(map)

        var popupTemplate = '<h3>{POA}</h3>{deltaPeople}<br/>{deltaPeoplePC}'

        SA3Zones.bindPopup(function(e){
            var value = e.feature.properties.POA_NAME_2016
            return L.Util.template(popupTemplate,
                {POA : value,
                    deltaPeople: mlMap[value]['deltaPeople'],
                    deltaPeoplePC: mlMap[value]['deltaPeoplePC']}
            )
        })
        this.setState({map: map})
    }

    componentDidMount() {
        if (!this.state.map) this.init(this._mapNode)
    }

    render() {
        return (
            <div ref={(node) => this._mapNode = node} id="map"/>
        )
    }
}

export default Map