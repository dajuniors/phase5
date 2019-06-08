// "use strict";
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

map.on('load', function () {

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


map.loadImage("https://img.icons8.com/color/24/000000/marker.png", function(error, image) {
    if (error) throw error;
    map.addImage('marker', image);


    map.addSource("bathrooms", {
        "type": "geojson",
        "data": allBathrooms
    });
    
    map.addLayer({
        "id": "testing",
        "type": "symbol",
        "source": "bathrooms",
        "layout": {
            "icon-image": "marker",
            "icon-size": 1,
            "icon-allow-overlap": true
        }
    });

    // code for inserting cards into the side panel
    let cards = document.getElementById('cardStack');
    for (i = 0; i < allBathrooms.features.length; i++) {
      let currProp = allBathrooms.features[i].properties
      
      let newP = document.createElement('p');
      newP.className = 'mb-1';
      newP.textContent = 'LOCATION'

      let divIcons = document.createElement('div');
      
      let gender = currProp.gender;
      let key = currProp.needKey;
      let da = currProp.disailityAccess;

      if (key) {
        let newK = document.createElement('img');
        newK.src = 'imgs/key_24.png';
        divIcons.appendChild(newK);
      }
      if (da) {
        let newDA = document.createElement('img');
        newK.src = 'imgs/wc_24.png'
        divIcons.appendChild(newDA);
      }
      let newG = document.createElement('img');
      if (gender == "m") {
        newG.src = 'imgs/m_24.png';
      } else if (gender == "f") {
        newG.src = 'imgs/f_24.png';
      } else if (gender == "mf") {
        newG.src = 'imgs/mf_24.png';
      } else {
        newG.src = 'imgs/gn_24.png';
      }
      divIcons.appendChild(newG);


      let div2 = document.createElement('div');
      div2.className = 'd-flex w-100 justify-content-between';
      div2.appendChild(newP);
      div2.appendChild(divIcons);


      let newH = document.createElement('h1');
      newH.className = 'mb-1';
      newH.textContent = currProp.name;
      let newSm = document.createElement('small');
      newSm.textContent = 'DISTANCE'

      let div1 = document.createElement('div');
      div1.className = 'd-flex w-100 justify-content-between';

      div1.appendChild(newH);
      div1.appendChild(newSm);

      let divOut = document.createElement("div");
      divOut.appendChild(div1);
      divOut.appendChild(div2);
      
      
      let newCard = document.createElement("button");
      newCard.className = "list-group-item male female dis key list-group-flush flex-column align-items-start card_btn"
      newCard.appendChild(divOut);

      // add new card to card list
      //cards.appendChild(spacing)
      cards.appendChild(newCard)

      let location = currProp
      console.log(location)
      
      // add spacing between the cards
      let spacing = document.createElement('div');
      spacing.className = 'col-md-6 col-lg-4 mt-3'
      cards.appendChild(spacing)
    }
});

});



function onErrorCurrentPos(error) {
    console.error(error);
}


var allCheckboxes = document.querySelectorAll("input[type=checkbox]");
var allRestrooms = Array.from(document.querySelectorAll(".list-group-item"));
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
  // allRestrooms.map(function(el) {
    // var gender;
    // var disability;
    // var key;
    // if (checked.gender.length == intersect(Array.from(el.classList), checked.gender).length) {
      // gender = true;
    // }
    // if (checked.gender.length == intersect(Array.from(el.classList), checked.dis).length) {
      // disability = true;
    // }
    // if (checked.gender.length == intersect(Array.from(el.classList), checked.key).length) {
      // key = true;
    // }
    // if (gender && disability && key) {
      // el.style.display = "block";
    // } else {
      // el.style.display = "none";
    // }
  // });
  let male = false;
  let female = false;
  let gender = false;
  let disability = false;
  let key = false;
  let checked = document.querySelectorAll("input:checked")
  for (let i = 0; i < checked.length; i++) {
	  let val = checked[i].value;
	  if (val == "male")
		  male = true
	  if (val == "female")
		  female = true
	  if (val == "gn")
		  gender = true
	  if (val == "dis")
		  disability = true
	  if (val == "key")
		  key = true
  }
  var restrooms = document.querySelectorAll(".list-group-item");
  if (!male && !female && !gender && !disability && !key) {
	  for (let i = 0; i < restrooms.length; i++)
		  restrooms[i].style.display = "block";
  } else {
	  for (let i = 0; i < restrooms.length; i++) {
		  restrooms[i].style.display = "none";
		  let clist = restrooms[i].classList;
		  if (male && clist.contains("male")) {
			restrooms[i].style.display = "block";
		  }
		  if (female && clist.contains("female")) {
			restrooms[i].style.display = "block";
		  }
		  if (gender && clist.contains("gn")) {
			restrooms[i].style.display = "block";
		  }
		  if (disability && clist.contains("dis")) {
			restrooms[i].style.display = "block";
		  }
		  if (key && clist.contains("key")) {
			restrooms[i].style.display = "block";
		  }
	  }
  }

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
    var el = document.getElementById('cards');
    el.innerHTML = "";
    el.style.backgroundColor = "white"

    var steps = routes.legs[0].steps;

    var tripInstructions = [];
    var filters = document.getElementById('filter')
      filters.parentNode.removeChild(filters);

    for (var i = 0; i < steps.length; i++) {
        tripInstructions.push('<br><li class="list-group-item list-group-flush flex-column align-items-start card_btn">' + steps[i].maneuver.instruction) + '</li>';
        el.innerHTML = '<br><span class="duration">Trip duration: ' + Math.floor(routes.duration / 60) + ' min </span>' + tripInstructions;
    }

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
    } else {
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
}

function endDirections() {
  map.removeLayer('route');
  map.removeSource('route');
}


function intersect(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a.filter(function (e) {
        return b.indexOf(e) > -1;
    });
}

// let test = allBathrooms.features

// console.log(test)
// console.log(test[[0]].properties)


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
