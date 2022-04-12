import React, { useState, useEffect } from "react";
import "./App.css";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";

const Map = () => {
  const [Longitude, setLng] = useState(102.8357);
  const [Latitude, setLat] = useState(16.4542);
  const [Zoom, setZoom] = useState(11);
  const osm = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  useEffect(() => {
    const map = new maplibregl.Map({
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
        [102.4320, 16.2374], // Southwest coordinates
        [103.2539, 16.6576], // Northeast coordinates
      ],
      minZoom: Zoom,
      doubleClickZoom: false,
    });

    const geolocate = new maplibregl.GeolocateControl({
      showAccuracyCircle: false,
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map
      .addControl(new maplibregl.NavigationControl({}))
      .addControl(new maplibregl.ScaleControl({}))
      .addControl(
        new maplibregl.AttributionControl({
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
          data: `/point`,
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

    var locate;
    var point;
    var NodeFrom;
    var NodeTo;
    var Routepath;

    const Popup = new maplibregl.Popup({ closeButton: false });
    map.on("mouseenter", "pointServices", (e) => {
      map.getCanvas().style.cursor = "pointer";
      let prop = e.features[0].properties;
      point = {
        lat: e.features[0].geometry.coordinates[1],
        lng: e.features[0].geometry.coordinates[0],
      };
      getNodeTo(point.lat, point.lng);
      Popup.setLngLat(point)
        .setHTML(
          `<div class="point-det">
            <b>Name :</b> ${prop.name} <br/>
            <img src="/img/${prop.name}.jpg"  width="100%" height="100%" alt="${prop.name}"><br/>
            <b>Tel :</b> <a href="tel:${prop.tel}" style="color: black">${prop.tel}</a><br/>
            <b>Payment :</b>  ${prop.pay}
            </div>`
        )
        .addTo(map);
    });
    map.on("mouseleave", "pointServices", () => {
      map.getCanvas().style.cursor = "";
      Popup.remove();
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

    const getNodeFrom = async (lat, lng) => {
      await axios.get(`/node/${lng}&${lat}`).then((res) => {
        return (NodeFrom = res.data.features[0].properties.id);
      });
    };
    const getNodeTo = async (lat, lng) => {
      await axios.get(`/node/${lng}&${lat}`).then((res) => {
        return (NodeTo = res.data.features[0].properties.id);
      });
    };
    const getRoute = async (from, to) => {
      await axios.get(`/route/${from}&${to}`).then((res) => {
        return (Routepath = res.data);
      });
    };

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
