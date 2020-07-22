// Create variable for URL and link to earthquake data

var url = '/earthquake';
// console.log(url);
// var url = '../database/earthquakes_data_json.geojson';
// Create variable to adjust circle size when zooming in and out
var zoomMap = 1.8;
var temp = true;
// Create circles for earthquake data

function createCircles(feature, latlong) {
	// console.log(latlong)

	let options = {
		radius: feature.properties.mag * zoomMap,
		fillColor: getColor(feature.properties.mag),
		// color: 'gray',
		weight: 1,
		opacity: 0.5,
		fillOpacity: 0.5
		// zIndexOffset: 1000
	};

	if (temp == true) {
		// console.log(L.circleMarker(latlong, options));
		temp = false;
	}
	return L.circleMarker(latlong, options);
}

//  Load json data
d3.json(url, function(data) {
	console.log(data);
	var geoData = {
		type: 'FeatureCollection'
	};

	var featureList = [];
	data.forEach((d) => {
		var perObject = {
			type: 'Feature',
			properties: {
				date: d.date,
				depth: d.depth,
				mag: d.mag,
				place: d.place
			},
			geometry: {
				type: 'Point',
				coordinates: [ d.longitude, d.latitude ]
			}
		};
		featureList.push(perObject);
	});
	console.log('featureLIst', featureList);
	geoData['features'] = featureList;

	// Create popups to display earthquake info
	var earthQuakes = L.geoJSON(geoData, {
		onEachFeature: function(feature, layer) {
			layer.bindPopup(
				'Place:' +
					feature.properties.place +
					'<br> Magnitude: ' +
					feature.properties.mag +
					'<br> Date: ' +
					feature.properties.date
			);
		},
		pointToLayer: createCircles
	});

	createMap(earthQuakes);
});

function createMap(earthQuakes) {
	// Add layer for map
	var lightMap = L.tileLayer(
		'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
		{
			attribution:
				'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
			maxZoom: 8,
			minZoom: 1,
			id: 'mapbox.light',
			accessToken: API_KEY
		}
	);

	var satellite = L.tileLayer(
		'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
		{
			attribution:
				'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
			maxZoom: 8,
			minZoom: 1,
			id: 'mapbox.satellite',
			accessToken: API_KEY
		}
	);

	// Create variable and define map
	var myMap = L.map('map', {
		center: [ 25, 20 ],
		zoom: zoomMap,
		layers: [ lightMap, earthQuakes ]
	});

	var overlayMaps = {
		Earthquakes: earthQuakes
	};

	var baseMaps = {
		LightMap: lightMap,
		Satellite: satellite
	};

	L.control.layers(baseMaps, overlayMaps).addTo(myMap);

	function handleSubmit(event) {
		// Prevent the page from refreshing
		event.preventDefault();

		// Select the input value from the form
		var latitude = d3.select('#latInput').node().value;
		var longitude = d3.select('#longInput').node().value;
		var dist = d3.select('#radiusInput').node().value;
		console.log(latitude, longitude, dist);

		// // clear the input value
		d3.select('#latInput').node().value = '';
		d3.select('#longInput').node().value = '';
		d3.select('#radiusInput').node().value = '';
		buttonClick(latitude, longitude, dist);
	}

	function buttonClick(latitude, longitude, dist) {
		// console.log('it run the function');
		// console.log(dist);
		// var dist = 50;
		var theRadius = parseInt(dist) * 1609.34; //1609.34 meters in a mile
		var circleCenter = [ latitude, longitude ];
		var circleOptions = {
			color: 'red',
			fillColor: 'white',
			fillOpacity: 0
			// zIndexOffset: -1000
		};
		// Creating variables for radius circle and user input lat and long marker
		var latlongMarker = L.marker([ latitude, longitude ]).bindPopup(
			'Lat: ' + latitude + '</br>' + 'Long: ' + longitude
		);
		var latlongRadius = L.circle(circleCenter, theRadius, circleOptions).bindPopup(dist + ' miles');

		myMap.removeLayer(earthQuakes);

		myMap.flyTo([ latitude, longitude ], 5, {
			animate: true,
			duration: 3 // in seconds
		});
		latlongMarker.addTo(myMap);
		latlongRadius.addTo(myMap).bringToBack();

		var url2 = '/output';
		console.log(url2);
		d3.json(url2, function(data) {
			// console.log(data);
			console.log('URL 2', data);

			// Create popups to display earthquake info
			var earthQuakes2 = L.geoJSON(data, {
				onEachFeature: function(feature, layer) {
					layer.bindPopup(
						'Place:' +
							feature.properties.place +
							'<br> Magnitude: ' +
							feature.properties.mag +
							'<br> Time: ' +
							new Date(feature.properties.date)
					);
				},

				pointToLayer: createCircles
			});

			console.log(earthQuakes2);
			// createMap(earthQuakes2);
			earthQuakes2.addTo(myMap);
			// earthQuakes.addTo(myMap);
		});
	}

	document.getElementById('submitBtn').addEventListener('click', handleSubmit);

	L.Control.MousePosition = L.Control.extend({
		options: {
			position: 'bottomleft',
			separator: ' : ',
			emptyString: 'Unavailable',
			lngFirst: false,
			numDigits: 5,
			lngFormatter: undefined,
			latFormatter: undefined,
			prefix: ''
		},

		onAdd: function(map) {
			this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
			L.DomEvent.disableClickPropagation(this._container);
			map.on('mousemove', this._onMouseMove, this);
			this._container.innerHTML = this.options.emptyString;
			return this._container;
		},

		onRemove: function(map) {
			map.off('mousemove', this._onMouseMove);
		},

		_onMouseMove: function(e) {
			var lng = this.options.lngFormatter
				? this.options.lngFormatter(e.latlng.lng)
				: L.Util.formatNum(e.latlng.lng, this.options.numDigits);
			var lat = this.options.latFormatter
				? this.options.latFormatter(e.latlng.lat)
				: L.Util.formatNum(e.latlng.lat, this.options.numDigits);
			var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
			var prefixAndValue = this.options.prefix + ' ' + value;
			this._container.innerHTML = prefixAndValue;
		}
	});

	L.Map.mergeOptions({
		positionControl: false
	});

	L.Map.addInitHook(function() {
		if (this.options.positionControl) {
			this.positionControl = new L.Control.MousePosition();
			this.addControl(this.positionControl);
		}
	});

	L.control.mousePosition = function(options) {
		return new L.Control.MousePosition(options);
	};

	L.control.mousePosition().addTo(myMap);

	var legend = L.control({ position: 'bottomleft' });

	legend.onAdd = function(map) {
		var div = L.DomUtil.create('div', 'legend'),
			mags = [ '5 to 5.5', '5.5 - 6', '6-7', '7-8', '8-9', '+9' ];
		colors = [ 'purple', 'blue', 'green', 'yellow', 'orange', 'red' ];
		div.id = 'legend';
		div.innerHTML = '<strong>Magnitude Colors</strong><br><br>';
		// loop through our density intervals and generate a label with a colored square for each interval
		for (var i = 0; i < mags.length; i++) {
			div.innerHTML +=
				"<div class='color-" +
				colors[i] +
				"'></div>" +
				"<div class='info'>&nbsp;&nbsp;" +
				mags[i] +
				'</div><br>';
		}

		return div;
	};

	legend.addTo(myMap);
}
// Create function to set the color dependent on magnitude
function getColor(mag) {
	if (mag >= 9) {
		return 'red';
	} else if (mag >= 8) {
		return 'orange';
	} else if (mag >= 7) {
		return 'yellow';
	} else if (mag >= 6) {
		return 'green';
	} else if (mag >= 5.5) {
		return 'blue';
	} else {
		return 'purple';
	}
}
