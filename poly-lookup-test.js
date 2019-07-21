var PolygonLookup = require("polygon-lookup");
var fs = require("fs");

const geo = JSON.parse(fs.readFileSync("data/polygon.32633.geojson"));

var featureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: "bar" },
      geometry: {
        type: "Polygon",
        coordinates: [[[0, 1], [2, 1], [3, 4], [1, 5]]]
      }
    }
  ]
};
var lookup = new PolygonLookup(geo);
var poly = null;
for (var i = 0; i < 100000; i++)
  poly = lookup.search(-33999.962185472017154, 6744999.85263360477984);
console.log(poly.properties);
