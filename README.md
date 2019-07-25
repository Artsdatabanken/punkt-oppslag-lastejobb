Read GeoTIFF files, create a static quadtile index tree in the file system.

## Usage

```bash
Usage: npx punkt-oppslag-lastejobb <dataDirectory> <datasetName>
```

### Example

```bash
node index.js example/ssb-bbox telemark
```

### Example of rasterizing a geojson

```bash
wget https://data.artsdatabanken.no/Fylke/Telemark/polygon.32633.geojson
gdal_rasterize -co alpha=no -ot Byte -burn 255 -ts 256 256 polygon.32633.geojson telemark.tif
```
