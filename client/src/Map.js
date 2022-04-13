import React, { useState, useEffect } from "react";
import "./App.css";
import mapbox from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
import { HOST } from "./conn";

const Map = () => {
  const [Longitude, setLng] = useState(102.8357);
  const [Latitude, setLat] = useState(16.4542);
  const [Zoom, setZoom] = useState(11);
  const osm = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  var locate;
  var point;
  var NodeFrom;
  var NodeTo;
  var Routepath;

  const getNodeFrom = async (lat, lng) => {
    await axios.get(`${HOST}/node/${lng}&${lat}`).then((res) => {
      return (NodeFrom = res.data.features[0].properties.id);
    });
  };
  const getNodeTo = async (lat, lng) => {
    await axios.get(`${HOST}/node/${lng}&${lat}`).then((res) => {
      return (NodeTo = res.data.features[0].properties.id);
    });
  };
  const getRoute = async (from, to) => {
    await axios.get(`${HOST}/route/${from}&${to}`).then((res) => {
      return (Routepath = res.data);
    });
  };

  useEffect(() => {
    const map = new mapbox.Map({
      container: "map",
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [osm],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: [Longitude, Latitude],
      zoom: Zoom,
      maxBounds: [
        [102.432, 16.2374], // Southwest coordinates
        [103.2539, 16.6576], // Northeast coordinates
      ],
      minZoom: Zoom,
      doubleClickZoom: false,
    });

    const geolocate = new mapbox.GeolocateControl({
      showAccuracyCircle: false,
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map
      .addControl(new mapbox.NavigationControl({}))
      .addControl(new mapbox.ScaleControl({}))
      .addControl(
        new mapbox.AttributionControl({
          compact: true,
          customAttribution: `© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`,
        })
      )
      .addControl(geolocate);

    map.on("move", () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(0));
    });

    // Begins Function //
    map.on("load", (e) => {
      map.addLayer({
        id: "pointServices",
        type: "circle",
        source: {
          type: "geojson",
          data: `${HOST}/point`,
        },
        paint: {
          "circle-color": "red",
          "circle-radius": 6,
          "circle-stroke-width": 2,
          "circle-stroke-color": "white",
        },
        minzoom: Zoom,
      });
    });

    const Popup = new mapbox.Popup({ closeButton: true });
    map.on("mouseenter", "pointServices", (e) => {
      map.getCanvas().style.cursor = "pointer";
      point = {
        lat: e.features[0].geometry.coordinates[1],
        lng: e.features[0].geometry.coordinates[0],
      };
      getNodeTo(point.lat, point.lng);
    });

    map.on("click", "pointServices", (e) => {
      let prop = e.features[0].properties;
      Popup.setLngLat(point)
        // <img src="/img/${prop.name}.jpg"  width="100%" height="100%" alt="${prop.name}"><br/>
        .setHTML(
          `<div class="point-det">
            <b>Name :</b> ${prop.name} <br/>
            <b>Tel :</b> <a href="tel:${prop.tel}" style="color: black">${prop.tel}</a><br/>
            <b>Payment :</b>  ${prop.pay}
            </div>`
        )
        .addTo(map);
    });

    geolocate.on("geolocate", (e) => {
      map.on("click", "pointServices", () => {
        getRoute(NodeFrom, NodeTo);
      });
      map.on("dblclick", "pointServices", () => {
        if (map.getLayer("routepath")) {
          map.removeLayer("routepath");
          map.removeSource("routepath");
        }
        map.addLayer({
          id: "routepath",
          type: "line",
          source: {
            type: "geojson",
            data: Routepath,
          },
          paint: {
            "line-color": "black",
            "line-width": 3,
          },
        });
      });
      locate = {
        lat: e.coords.latitude,
        lng: e.coords.longitude,
      };
      getNodeFrom(locate.lat, locate.lng);
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div>
      <div className="sidebar">
        Longitude: {Longitude} | Latitude: {Latitude} | Zoom: {Zoom}
      </div>
      <div id="map" style={{ width: "100vw", height: "100vh" }}></div>
    </div>
  );
};

export default Map;
