// "use strict";


console.log(mapkey);


mapboxgl.accessToken = mapkey;

let state = {
    currLat: undefined,
    currLog: undefined
}
/**
 * Handles responses from the fetch() API.
 * @param {Response} response
 * @returns {Promise}
 */
function handleResponse(response) {
    if (response.ok) {
        return response.json();
    } else {
        return response.json()
            .then(function(err) {
                throw new Error(err.errorMessage);
            });
    }
}

let map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v9",
    center: [-122.308035, 47.653854],
    zoom: 15
});
map.addControl(new mapboxgl.NavigationControl());

navigator.geolocation.getCurrentPosition(onCurrentPos, onErrorCurrentPos, {enableHighAccuracy: true});

function onCurrentPos(position) {
    let lnglat = [position.coords.longitude, position.coords.latitude];
    state.currLat = position.coords.latitude;
    state.currLog = position.coords.longitude;
    map.flyTo({center: lnglat, zoom: 18});

    let div = document.createElement("div");
    div.className = "current-location-marker";
    let marker = new mapboxgl.Marker(div);
    marker.setLngLat(lnglat).addTo(map);
}

map.on('load', function () {
map.addSource("bathrooms", {
    "type": "geojson",
    "data": allBathrooms
});

map.addLayer({
    "id": "testing",
    "type": "circle",
    "source": "bathrooms",
    "paint": {
        "circle-radius": 6,
        "circle-color": '#1000ff',
        'circle-stroke-color': '#000000',
        'circle-stroke-width': 2
    }
});
console.log("test")
console.log("t: ", test);
});



function onErrorCurrentPos(error) {
    console.error(error);
}


var allCheckboxes = document.querySelectorAll("input[type=checkbox]");
var allRestrooms = Array.from(document.querySelectorAll(".list-group-item list-group-flush flex-column align-items-start"));
var checked = {};

getChecked("gender");
getChecked("dis");
getChecked("key");

Array.prototype.forEach.call(allCheckboxes, function(el) {
  el.addEventListener("change", toggleCheckbox);
});

function toggleCheckbox(e) {
  getChecked(e.target.name);
  setVisibility();
}

function getChecked(name) {
  checked[name] = Array.from(
    document.querySelectorAll("input[name=" + name + "]:checked")
  ).map(function(el) {
    return el.value;
  });
}

function setVisibility() {
  allRestrooms.map(function(el) {
    var gender = checked.gender.length
      ? _.intersection(Array.from(el.classList), checked.gender)
          .length
      : true;
    var disability = checked.dis.length
      ? _.intersection(Array.from(el.classList), checked.dis).length
      : true;
    var key = checked.key.length
      ? _.intersection(Array.from(el.classList), checked.key).length
      : true;
    if (gender && disability && key) {
      el.style.display = "block";
    } else {
      el.style.display = "none";
    }
  });
}


// tutorial https://docs.mapbox.com/help/tutorials/getting-started-directions-api/#build-a-directions-api-reques

// using the user's current location,
// pass in the coordinates for the end location
// send requests to mapbox API
function getRoute(end) {
    var start = [state.currLog, state.currLat];
    var url = 'https://api.mapbox.com/directions/v5/mapbox/walking/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken; 
    fetch(url)
        .then(handleResponse)
        .then(renderInstructions)

}

function renderInstructions(data) {
    var routes = data.routes[0]
    var instructions = document.getElementById('instructions');
    instructions.style.backgroundColor = "rgba(255, 255, 255, 0.7)"; 

    var steps = routes.legs[0].steps;
    
    var tripInstructions = [];
    for (var i = 0; i < steps.length; i++) {
        tripInstructions.push('<br><li>' + steps[i].maneuver.instruction) + '</li>';
        instructions.innerHTML = '<br><span class="duration">Trip duration: ' + Math.floor(routes.duration / 60) + ' min </span>' + tripInstructions;
    }

    //TODO: when a new location is chosen, reset the data to render a new line
    var geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routes.geometry.coordinates
        }
    }
    
    if (map.getSource('route')) {
        map.getSource('route').setData(geojson)
    }
    map.addLayer({
        "id": "route",
        "type": "line",
        "source": {
          "type": "geojson",
          "data": {
            "type": "Feature",
            "properties": {},
            "geometry": {
              "type": "LineString",
              "coordinates": routes.geometry.coordinates
            }
          }
        },
        "layout": {
          "line-join": "round",
          "line-cap": "round"
        },
        "paint": {
          "line-color": "#3887be",
          "line-width": 5,
          "line-opacity": 0.75
        }
    })
}

/* 
function addMarker(record) {
    let elem = document.createElement("div");
    elem.className = "data-marker"
    elem.textContent = record.user_rating.aggregate_rating;
    elem.style.backgroundColor = "#" + record.user_rating.rating_color;
    let marker = new mapboxgl.Marker(elem);
    let lnglat = [record.location.longitude, record.location.latitude];
    marker.setLngLat(lnglat);
    marker.addTo(map);

    let popup = new mapboxgl.Popup();
    let avgCost = " Average price for two: $" + record.average_cost_for_two;
    let cuisine = " Cuisines: " + record.cuisines; 
    let innerHTML = "";
    innerHTML += '<h6>' + record.name + "</h6>";
    if(record.featured_image) {
        innerHTML += '<img class="popup-img" src="' + record.featured_image + '" alt="restraunt featured img" />';
    }
    innerHTML += '<p>' + cuisine + '</p>';
    innerHTML += '<p>' + avgCost + '</p>';
    if(record.menu_url) {
        innerHTML += '<a href=' + record.menu_url + '" target="_blank">Menu</a>';
    }   
    popup.setHTML(innerHTML);
    marker.setPopup(popup);
}
*/
