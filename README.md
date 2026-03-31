Read GeoTIFF files, create a static quadtile index tree in the file system.

Data is consumed by https://github.com/Artsdatabanken/punkt-oppslag-api

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

## Build on WSL

Ubuntu 20.04 sjekket.

```bash
sudo apt-get install build-essential
```

### 23.05.24
1. Installer python(om du mangler dette)
2. npm install -g npm-check-updates
3. npm-check-updates -u
4. npm install
geotiffjs/geotiff har en breaking change i versjon 2.0.5
https://github.com/geotiffjs/geotiff.js/issues/301
