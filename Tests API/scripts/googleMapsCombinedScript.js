// Load the Visualization API and the columnchart package.
google.load('visualization', '1', {packages: ['columnchart']});

var poly;

var path;

var map;

var elevator;

var chartDiv;

function initMap() {
    chartDiv = document.getElementById('elevation_chart');
    alert("Chartdiv : " + chartDiv);
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: {lat: 41.879, lng: -87.624}  // Center the map on Chicago, USA.
    });

    poly = new google.maps.Polyline({
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        strokeWeight: 3
    });
    poly.setMap(map);

    // Add a listener for the click event
    map.addListener('click', addLatLng);

    // Create an ElevationService.
    elevator = new google.maps.ElevationService;

    path = [];  // Lone Pine
}

// Handles click events on a map, and adds a new point to the Polyline.
function addLatLng(event) {
    var chemin = poly.getPath();
    chemin.push(event.latLng);

    // Because path is an MVCArray, we can simply append a new coordinate
    // and it will automatically appear.
    path.push({lat : event.latLng.lat(), lng : event.latLng.lng()});

    // Add a new marker at the new plotted point on the polyline.
    var marker = new google.maps.Marker({
        position: event.latLng,
        title: '#' + chemin.getLength(),
        map: map
    });

    if (path.length>=2){
        displayPathElevation(path, elevator, map);
    }
}

function displayPathElevation(path, elevator, map) {

    // Create a PathElevationRequest object using this array.
    // Ask for 256 samples along that path.
    // Initiate the path request.

    elevator.getElevationAlongPath({
        'path': path,
        'samples': 256
    }, plotElevation);
}

// Takes an array of ElevationResult objects, draws the path on the map
// and plots the elevation profile on a Visualization API ColumnChart.
function plotElevation(elevations, status) {
    if (status !== google.maps.ElevationStatus.OK) {
        // Show the error code inside the chartDiv.
        chartDiv.innerHTML = 'Cannot show elevation: request failed because ' +
            status;
        return;
    }
    // Create a new chart in the elevation_chart DIV.
    var chart = new google.visualization.ColumnChart(chartDiv);

    // Extract the data from which to populate the chart.
    // Because the samples are equidistant, the 'Sample'
    // column here does double duty as distance along the
    // X axis.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Sample');
    data.addColumn('number', 'Elevation');
    for (var i = 0; i < elevations.length; i++) {
        data.addRow(['', elevations[i].elevation]);
    }

    // Draw the chart using the data within its DIV.
    chart.draw(data, {
        height: 150,
        legend: 'none',
        titleY: 'Elevation (m)'
    });
}