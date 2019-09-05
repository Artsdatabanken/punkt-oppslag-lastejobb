Read GeoTIFF files, create a static quadtile index tree in the file system.

Data is consumed by https://github.com/Artsdatabanken/punkt-oppslag-lastejobb

## Usage

```bash
Usage: npx punkt-oppslag-lastejobb <dataDirectory> <datasetName>
```

### Example

```bash
node index.js example/ssb-bbox telemark
```

### Example of rasterizing a GeoJSON

```bash
wget https://data.artsdatabanken.no/Fylke/Telemark/polygon.32633.geojson
gdal_rasterize -co alpha=no -ot Byte -burn 255 -tap -ts 256 256 polygon.32633.geojson telemark.tif
```

#### Kommune

```
wget https://github.com/Artsdatabanken/kommune-kart/blob/master/kommune_25833.geojson
gdal_rasterize -co alpha=no -ot Int16 -a autorkode -tap -tr 100 100 kommune_25833.geojson kommune.tif
```

### Landskapstyper

gdal_rasterize -co alpha=no -ot Int16 -a index -tap -tr 100 100 NN-LA-TI.geojson NN-LA-TI.tif
