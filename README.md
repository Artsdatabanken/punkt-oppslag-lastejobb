Read GeoTIFF files, create a static quadtile index tree in the file system.

```
 node index.js example/ssb-bbox
```

### Example of rasterizing a geojson

```
wget https://data.artsdatabanken.no/Fylke/Telemark/polygon.32633.geojson
gdal_rasterize -ot Byte -burn 255 -burn 255 -burn 255 -burn 255 -ts 512 512 polygon.32633.geojson telemark.tif
```
