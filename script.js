function initMap() {
    // Customize the map style
    var customMapStyle = [
        { elementType: 'labels', stylers: [{ visibility: 'off' }] } // Hide all labels
    ];

    // Create a new map with custom style
    var map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 33.88238623656365, lng: -117.88510254859351 },
        zoom: 15,
        styles: customMapStyle // Apply custom map style
    });

    // Fetch building data from external JSON file
    fetch('buildings.json')
        .then(response => response.json())
        .then(data => {
            // Loop through each building data
            data.forEach(function(building) {
                var marker = new google.maps.Marker({
                    position: { lat: building.coordinates.latitude, lng: building.coordinates.longitude },
                    map: map,
                    label: building.node_id.toString(), // Set label as node_id
                    title: building.name // Set title as name
                });

                // Create an info window to display the building name when marker is clicked
                var infoWindow = new google.maps.InfoWindow({
                    content: "<b>" + building.name + "</b>" // Building name
                });

                // Event listener to open the info window when marker is clicked
                marker.addListener('click', function() {
                    infoWindow.open(map, marker);
                });

            });

            // Load the edges and draw polylines
            //loadEdgesAndDrawPolylines(map);

            // Render buildings list
            populateSidebar(data); // Call the populateSidebar function here
        })
        .catch(error => console.error('Error fetching building data:', error));


    // Define a global variable to store the reference to the polyline
    var pathPolyline;

    // Function to load path data, draw polylines, and zoom onto marker
    function loadPathAndDrawPolylines(map, path) {
        // Clear existing polyline if it exists
        if (pathPolyline) {
            pathPolyline.setMap(null); // Remove polyline from the map
        }

        // Define an array to store LatLng objects representing the path
        var pathCoordinates = [];

        // Load the buildings.JSON file
        fetch('buildings.json')
            .then(response => response.json())
            .then(data => {
                // Iterate over the path array and get the coordinates of each node
                path.forEach(nodeId => {
                    // Find the node in the data
                    const node = data.find(item => item.node_id === nodeId);
                    if (node) {
                        // Create a LatLng object using the node's coordinates
                        var latLng = new google.maps.LatLng(node.coordinates.latitude, node.coordinates.longitude);
                        // Add the LatLng object to the pathCoordinates array
                        pathCoordinates.push(latLng);

                        // Zoom onto marker corresponding to the start node
                        if (nodeId === path[0]) {
                            zoomToMarker(nodeId, node.coordinates.latitude, node.coordinates.longitude);
                        }
                    } else {
                        console.error(`Node with ID ${nodeId} not found.`);
                    }
                });

                // Draw polyline representing the path
                pathPolyline = new google.maps.Polyline({
                    path: pathCoordinates,
                    geodesic: true,
                    strokeColor: '#0000FF', // Blue color
                    strokeOpacity: 1.0,
                    strokeWeight: 3, // Set the weight as needed
                    map: map // Your Google Maps map object
                });

            })
            .catch(error => console.error('Error fetching buildings.JSON:', error));
    }



    // Function to retrieve coordinates of a node by its ID
    function getNodeCoordinates(nodeId) {
        // Load the buildings.JSON file and find the node by its ID
        return fetch('buildings.json')
            .then(response => response.json())
            .then(data => {
                // Find the node with the given ID
                const node = data.find(item => item.node_id === nodeId);

                // If node is found, return its coordinates as a LatLng object
                if (node) {
                    return new google.maps.LatLng(node.coordinates.latitude, node.coordinates.longitude);
                } else {
                    console.error(`Node with ID ${nodeId} not found.`);
                    return null;
                }
            })
            .catch(error => console.error('Error fetching buildings.JSON:', error));
    }

    // Function to render the list of buildings in the sidebar
    function populateSidebar(buildings) {
        var buildingListDiv = document.getElementById('building-list');
        buildingListDiv.innerHTML = ''; // Clear previous content

        // Modify the forEach loop to store the coordinates along with the building data
        buildings.forEach(function(building) {
            if (!building.name.startsWith('Intermediary Node')) {
                buildingListDiv.innerHTML += `<p class="building-item" data-node-id="${building.node_id}" data-lat="${building.coordinates.latitude}" data-lng="${building.coordinates.longitude}">${building.node_id}. ${building.name}</p>`;
            }
        });

        // Add event listener to building items
        var buildingItems = document.querySelectorAll('.building-item');
        buildingItems.forEach(function(item) {
            item.addEventListener('click', function() {
                var nodeId = this.getAttribute('data-node-id');
                var lat = parseFloat(this.getAttribute('data-lat')); // Parse latitude string to float
                var lng = parseFloat(this.getAttribute('data-lng')); // Parse longitude string to float
                console.log('Clicked on building item with node ID:', nodeId);
                zoomToMarker(nodeId, lat, lng); // Pass the coordinates to the zoomToMarker function
            });
        });
    }

    // Modify the zoomToMarker function to accept the coordinates directly
    function zoomToMarker(nodeId, lat, lng) {
        // Create a LatLng object using the provided coordinates
        var latLng = new google.maps.LatLng(lat, lng);

        // Pan the map to the LatLng position and set zoom level
        map.panTo(latLng);
        map.setZoom(18);
    }

    // Call the runPathfinding function when the "Run" button is clicked
    document.querySelector('button[type="button"]').addEventListener('click', runPathfinding);

    // Define the runPathfinding function
    function runPathfinding() {
        var startLocation = document.getElementById("start_location").value;
        var destLocation = document.getElementById("dest_location").value;
        var algorithm = document.getElementById("algorithm").value;

        // Make an AJAX request to the Python backend
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:5000/pathfinding", true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var result = JSON.parse(xhr.responseText);
                console.log(result); // Process the result as needed
                var path = result.path; // Assuming the path is an array of node IDs
                if (path) {
                    loadPathAndDrawPolylines(map, path); // Call the function to draw the path
                } else {
                    console.error("Error: Path data not found in response.");
                }
            } else {
                console.error("Error:", xhr.status);
            }
        }
    };


        var data = {
            start_location: startLocation,
            dest_location: destLocation,
            algorithm: algorithm
        };

        xhr.send(JSON.stringify(data));
    }
}
