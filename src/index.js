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
    
    // code for inserting cards into the side panel
    let cards = document.getElementById('cardStack');
    for (i = 0; i < allBathrooms.features.length; i++) {
      let currProp = allBathrooms.features[i].properties
      let bathroomCoord = allBathrooms.features[i].geometry.coordinates
      
      let newP = document.createElement('p');
      newP.className = 'mb-1';
      newP.textContent = 'LOCATION'

      let divIcons = document.createElement('div');

      let newCard = document.createElement("button");
      let newCardClass = "list-group-item list-group-flush flex-column align-items-start card_btn"
      
      let gender = currProp.gender;
      let key = currProp.needKey;
      let da = currProp.disabilityAccess;

      if (key) {
        let newK = document.createElement('img');
        newK.src = 'imgs/key_24.png';
        divIcons.appendChild(newK);
        newCardClass += ' key';
      }
      if (da) {
        let newDA = document.createElement('img');
        newDA.src = 'imgs/wc_24.png';
        divIcons.appendChild(newDA);
        newCardClass += ' dis';
      }
      let newG = document.createElement('img');
      if (gender == "m") {
        newG.src = 'imgs/m_24.png';
        newCardClass += ' male';
      } else if (gender == "f") {
        newG.src = 'imgs/f_24.png';
        newCardClass += ' female';
      } else if (gender == "mf") {
        newG.src = 'imgs/mf_24.png';
        newCardClass += ' male female';
      } else {
        newG.src = 'imgs/gn_24.png';
        newCardClass += ' gn'
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
      
      // if user provides location, calculate and display distance on card
      if (state.currLat != null && state.currLog != null) {
        let distancebtwn = distance(bathroomCoord);
        newSm.textContent = distancebtwn;
      } else {
        newSm.textContent = "";
      }

      let div1 = document.createElement('div');
      div1.className = 'd-flex w-100 justify-content-between';

      div1.appendChild(newH);
      div1.appendChild(newSm);

      let divOut = document.createElement("div");
      divOut.appendChild(div1);
      divOut.appendChild(div2);
      
      newCard.className = newCardClass  
      newCard.data = allBathrooms.features[i]
      newCard.appendChild(divOut);

      // add spacing between the cards
      let spacing = document.createElement('div');
      spacing.className = 'col-md-6 col-lg-4 mt-3'

      newCard.onclick = markerPopUpFromCard;
      // add new card to card list
      //cards.appendChild(spacing)
      cards.appendChild(newCard)
      cards.appendChild(spacing)
      
      
      //cards.appendChild(spacing)
    }

    map.addImage('marker', image);


    map.addSource("bathrooms", {
        "type": "geojson",
        "data": allBathrooms
    });
    
    map.addLayer({
        "id": "bathroom",
        "type": "symbol",
        "source": "bathrooms",
        "layout": {
            "icon-image": "marker",
            "icon-size": 1,
            "icon-allow-overlap": true
        }
    });
    
});

console.log(allBathrooms.features[[0]].properties);

});

// popup on map
map.on('click', 'testing', function (e) {
  var data = e.features[0]
  var coordinates = data.geometry.coordinates.slice();
  
  // create html for popup
  let test = '<p>' + data.properties.name + '</p>';

  // if user provides location, display distance and get directions button
  if (state.currLat != null && state.currLog != null) {
    let cord = distance(coordinates)
    test += ' <p> Distance: '+ cord + '</p>';
    test = test + ' <button onclick="getRoute([' + data.geometry.coordinates + '])"> Get Directions </button>';
  }
  
  
  let test3 = ' <p> DISABILITY ACCESS: NO </p>';
  if (data.properties.disabilityAccess) {
    test3 = ' <p> DISABILITY ACCESS: YES </p>';
  }
  test += test3;
  
  let test4 = ' <p> KEY REQUIRED: NO </p>';
  if (data.properties.disabilityAccess) {
    test4 = ' <p> KEY REQUIRED: YES </p>';
  }
  test += test4;

  let test5 = ' <p> GENDER NEUTRAL </p>';
  if (data.properties.gender == "m") {
    test5 = ' <p> MALE </p>';
  } else if (data.properties.gender == "f") {
    test5 = ' <p> FEMALE </p>';
  } else if (data.properties.gender == "mf") {
    test5 = ' <p> MALE AND FEMALE </p>';
  }
  test += test5;

   
  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  new mapboxgl.Popup()
  .setLngLat(coordinates)
  .setHTML(test)
  .addTo(map);
  });

  // Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'testing', function () {
  map.getCanvas().style.cursor = 'pointer';
  });
   
  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'testing', function () {
  map.getCanvas().style.cursor = '';
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
    filters.innerHTML = "";

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
// Source of distance function code: https://www.geodatasource.com/developers/javascript
*/

// calculates distance in miles between user current location and bathroom
// takes in bathroom coordinates as a parameter
function distance(bathroom) {
	if ((state.currLat == bathroom[0]) && (state.currLog == bathroom[1])) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * state.currLat/180;
		var radlat2 = Math.PI * bathroom[1]/180;
		var theta = state.currLog-bathroom[0];
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;
    
    // if distance is less than 0.1 miles, convert distance to feet
    if (dist <= 0.1) {
      dist = dist * 5280;
      return dist.toFixed(2) + " feet";
    } 
    return dist.toFixed(2) + " miles";
	}
}

function markerPopUpFromCard() {
  var data = this.data;

  var coordinates = data.geometry.coordinates;

  // create html for popup
  let test = '<p>' + data.properties.name + '</p>';
  test += ' <p> Distance: </p>';
  test = test + ' <button onclick= "getRoute([' + data.geometry.coordinates + '])"> Get Directions </button>';
  
  let test3 = ' <p> DISABILITY ACCESS: NO </p>';
  if (data.properties.disabilityAccess) {
    test3 = ' <p> DISABILITY ACCESS: YES </p>';
  }
  test += test3;
  
  let test4 = ' <p> KEY REQUIRED: NO </p>';
  if (data.properties.disabilityAccess) {
    test4 = ' <p> KEY REQUIRED: YES </p>';
  }
  test += test4;

  let test5 = ' <p> GENDER NEUTRAL </p>';
  if (data.properties.gender == "m") {
    test5 = ' <p> MALE </p>';
  } else if (data.properties.gender == "f") {
    test5 = ' <p> FEMALE </p>';
  } else if (data.properties.gender == "mf") {
    test5 = ' <p> MALE AND FEMALE </p>';
  }
  test += test5;
  
  new mapboxgl.Popup()
  .setLngLat(coordinates)
  .setHTML(test)
  .addTo(map);
  
}



// let test = allBathrooms.features

// console.log(test)
// console.log(test[[0]].properties)
