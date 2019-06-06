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
    console.log(position);
    let lnglat = [position.coords.longitude, position.coords.latitude];
    state.currLat = position.coords.latitude;
    state.currLog = position.coords.longitude;
    console.log(state.currLat);
    map.flyTo({center: lnglat, zoom: 18});

    let div = document.createElement("div");
    div.className = "current-location-marker";
    let marker = new mapboxgl.Marker(div);
    marker.setLngLat(lnglat).addTo(map);
    fetchData();

}

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
