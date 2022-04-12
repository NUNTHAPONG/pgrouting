const express = require("express");
const router = express.Router();

const db = require("../db")

router.get('/', async(req, res) => {
    res.send("Node API");
})
router.get('/:lat&:lng', async(req, res) => {
    let coords = req.params
        await db.query(
        `SELECT v.id,ST_AsGeoJSON(v.the_geom) as geojson 
        FROM kkroad_node AS v, kkroad_edge AS e 
        WHERE v.id = (
          SELECT id 
          FROM kkroad_node ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint(${coords.lat},${coords.lng}), 4326) LIMIT 1) 
          AND (e.source = v.id OR e.target = v.id) 
        GROUP BY v.id;`,
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