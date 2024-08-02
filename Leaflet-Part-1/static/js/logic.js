// URL to fetch earthquake data
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch the data and call createFeatures with the data
d3.json(url).then(function(data) {
  createFeatures(data.features);
});

// Function to create features (markers and popups) for the map
function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
  }

  function markerSize(magnitude) {
    return magnitude * 4;
  }

  function markerColor(depth) {
    return depth > 90 ? "#FF3333" :
           depth > 70 ? "#FF6633" :
           depth > 50 ? "#FF9933" :
           depth > 30 ? "#FFCC33" :
           depth > 10 ? "#FFFF33" :
                        "#CCFF33";
  }

  const earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        fillColor: markerColor(feature.geometry.coordinates[2]),
        color: "#000",
        weight: 0.5,
        fillOpacity: 0.7
      });
    },
    onEachFeature: onEachFeature
  });

  createMap(earthquakes);
}

// Function to create the map
function createMap(earthquakes) {
  const streetmap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "© OpenStreetMap contributors"
  });

  const baseMaps = {
    "Street Map": streetmap
  };

  const overlayMaps = {
    Earthquakes: earthquakes
  };

  const myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  const legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend"),
      depths = [0, 10, 30, 50, 70, 90],
      labels = [];

    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        '<i style="background:' + markerColor(depths[i] + 1) + '"></i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(myMap);
}