const express = require("express");
const router = express.Router();

const db = require("../db")

router.get('/', async(req, res) => {
    res.send("Route API");
})
router.get('/:from&:to', async(req, res) => {
    let node = req.params
        await db.query(
        `SELECT SUM(e.distance) AS distance, 
        ST_AsGeoJSON(ST_Collect(e.the_geom)) AS geojson 
        FROM pgr_dijkstra(
        'SELECT id,source,target,distance AS cost 
        FROM kkroad_edge',${node.from},${node.to},false) AS r ,kkroad_edge AS e 
        WHERE r.edge = e.id GROUP BY e.old_id`,
        (err, result) => {
          let collection = {
            type: "FeatureCollection",
            features: [],
          };
          for (let i of result.rows) {
            let feature = {
              type: "Feature",
              geometry: JSON.parse(i.geojson),
              properties: {},
            };
            delete i.geojson
            delete i.geom
            feature.properties = i
            collection.features.push(feature);
          }
          res.send(collection)
        }
      )
})
module.exports = router ;