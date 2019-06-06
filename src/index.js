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
    center: [-122.3321, 47.6062],
    zoom: 12
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
    "data": test
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


function fetchData () {
    fetch(dataURL + "/geocode?" + "lat=" + state.currLat + "&lon=" + state.currLog, {
        headers: {
            "user-key": "f2a8ee09bd3a0f75fa5df0e9bdd7a04d"
        }
    })
    .then(handleResponse)
    .then(data => {
        for (let i = 0; i < data.nearby_restaurants.length; i++) {
            console.log(data.nearby_restaurants[i].restaurant)
            addMarker(data.nearby_restaurants[i].restaurant);
        }
    })
    .catch(err => console.error(err));
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

