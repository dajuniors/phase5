// "use strict";
mapboxgl.accessToken = mapkey;

let state = {
    currLat: undefined,
    currLog: undefined,
    dataSource: allBathrooms
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
    center: [-122.308790, 47.655273],
    zoom: 15
});
map.addControl(new mapboxgl.NavigationControl());

map.on('load', function () {

navigator.geolocation.watchPosition(onCurrentPos, onErrorCurrentPos, {enableHighAccuracy: false});

function onCurrentPos(position) {
    let lnglat = [position.coords.longitude, position.coords.latitude];
    state.currLat = position.coords.latitude;
    state.currLog = position.coords.longitude;
    var geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: lnglat
      }
    }
    if (map.getSource('userLocation')) {
      map.getSource('userLocation').setData(geojson);
      renderCards(); 
    } else {
        renderCards(); 
        map.addLayer({
          "id": "userLocation",
          "type": "circle",
          "source": {
            "type": "geojson",
            "data": {
              "type": "Feature",
              "properties": {},
              "geometry": {
                "type": "LineString",
                "coordinates": lnglat
              }
            }
          },
          "paint": {
            'circle-radius': {
              'base': 2,
              // edit stops
              'stops': [[12, 2], [22, 180]]
              },
              'circle-color': "#1692FF"
          }
      })
    }
    map.flyTo({center: lnglat, zoom: 18});
}


    renderCards();
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

});

});

// popup on map
var popup = new mapboxgl.Popup();
map.on('click', 'testing', function (e) {

  var data = e.features[0]
  var coordinates = data.geometry.coordinates.slice();

  // create html for popup
  let test = '<p>' + data.properties.name + '</p>';

  // if user provides location, display distance and get directions button
  if (state.currLat != null && state.currLog != null) {
    let cord = distance(coordinates)
    test += ' <p> Distance: '+ cord + '</p>';
  }

  test = test + ' <button onclick="getRoute([' + data.geometry.coordinates + '])"> Get Directions </button>';

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

  popup.remove()

  popup = new mapboxgl.Popup();

  popup
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

// functino to sort bathroomsa
function sortByKey(array, key) {
  return array.sort(function(a, b) {
      var x = a[key]; var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

function renderCards() {
  // code for inserting cards into the side panel
  let diatanceBathrooms = [];
  for (i = 0; i < allBathrooms.features.length; i++) {
    let currBathroom = allBathrooms.features[i];
    let coordinates = currBathroom.geometry.coordinates.slice();
    diatanceBathrooms.push({id: distance(coordinates), data: currBathroom});
  }
  let sortedBathrooms = sortByKey(diatanceBathrooms, 'id')

  let cards = document.getElementById('cardStack');
  cards.innerHTML = "";
  for (i = 0; i < sortedBathrooms.length; i++) {
    let currProp = sortedBathrooms[i].data.properties
    let bathroomCoord = sortedBathrooms[i].data.geometry.coordinates

    let newP = document.createElement('p');
    newP.className = 'mb-1';
    newP.textContent = currProp.address;

    let divIcons = document.createElement('div');

    let newCard = document.createElement("button");
    let newCardClass = "list-group-item list-group-flush flex-column align-items-start card_btn mt-3"

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
      newG1 = document.createElement('img');
      newG1.src = 'imgs/m_24.png';
      divIcons.appendChild(newG1);
      newG.src = 'imgs/f_24.png';
      newCardClass += ' male female';
    } else {
      newG.src = 'imgs/gn_24.png';
      newCardClass += ' gn male female'
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
    if (sortedBathrooms[i].id != "NaN miles") {
      // let distancebtwn = distance(bathroomCoord);
      let distancebtwn = sortedBathrooms[i].id;
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
    newCard.data = sortedBathrooms[i].data;
    newCard.appendChild(divOut);

    newCard.onclick = markerPopUpFromCard;

    // add new card to card list
    cards.appendChild(newCard)
  }
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
  filterMarkers();
}

function filterMarkers() {
    map.removeLayer("testing");
    map.removeSource("bathrooms");
    map.addSource("bathrooms", {
        "type": "geojson",
        "data": state.dataSource
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
  let addArr = allBathrooms.features;
  let filteredBathrooms = {
    "type": "FeatureCollection",
    "features": []
}
  for (let i = 0; i < checked.length; i++) {
      let val = checked[i].value;
	  if (val == "male") {
          male = true
          state.male = true
          addArr = addArr.filter(item => 
            item.properties.gender == "m" || 
            item.properties.gender == "mf" ||
            item.properties.gender == "gn")
          filteredBathrooms.features = addArr;
      }
	  if (val == "female") {
          female = true
          state.female = true
          addArr = addArr.filter(item => 
            item.properties.gender == "f" || 
            item.properties.gender == "mf" ||
            item.properties.gender == "gn")
          filteredBathrooms.features = addArr;
      }
	  if (val == "gn"){
          gender = true
          state.gender = true
          addArr = addArr.filter(item => 
            item.properties.gender == "gn")
          filteredBathrooms.features = addArr;
      }
	  if (val == "dis") {
          disability = true
          state.disability = true
          addArr = addArr.filter(item => 
            item.properties.disabilityAccess == disability);
          filteredBathrooms.features = addArr;
      }
	  if (val == "key") {
          key = true
          state.key = true
          addArr = addArr.filter(item => 
            item.properties.needKey == key)
          filteredBathrooms.features = addArr;
      } 
  }

  if(filteredBathrooms.features.length > 0) {
  state.dataSource = filteredBathrooms;
  } else {
      state.dataSource = allBathrooms;
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
        if ((female && !clist.contains("female")) || (gender && !clist.contains("gn")) ||
            (disability && !clist.contains("dis")) || (key && !clist.contains("key"))) {
              restrooms[i].style.display = "none";
            }
		  }
		  if (female && clist.contains("female")) {
        restrooms[i].style.display = "block";
        if ((male && !clist.contains("male")) || (gender && !clist.contains("gn")) ||
            (disability && !clist.contains("dis")) || (key && !clist.contains("key"))) {
              restrooms[i].style.display = "none";
            }
		  }
		  if (gender && clist.contains("gn")) {
        restrooms[i].style.display = "block";
        if ((female && !clist.contains("female")) || (male && !clist.contains("male")) ||
            (disability && !clist.contains("dis")) || (key && !clist.contains("key"))) {
              restrooms[i].style.display = "none";
            }
		  }
		  if (disability && clist.contains("dis")) {
        restrooms[i].style.display = "block";
        if ((female && !clist.contains("female")) || (gender && !clist.contains("gn")) ||
            (male && !clist.contains("male")) || (key && !clist.contains("key"))) {
              restrooms[i].style.display = "none";
            }
		  }
		  if (key && clist.contains("key")) {
        restrooms[i].style.display = "block";
        if ((female && !clist.contains("female")) || (gender && !clist.contains("gn")) ||
            (disability && !clist.contains("dis")) || (male && !clist.contains("key"))) {
              restrooms[i].style.display = "none";
            }
		  }
	  }
  }

}


// tutorial https://docs.mapbox.com/help/tutorials/getting-started-directions-api/#build-a-directions-api-reques

// using the user's current location,
// pass in the coordinates for the end location
// send requests to mapbox API
function getRoute(end) {
    if (state.currLat == null && state.currLog == null) {
      var el = document.getElementById('direction');
      el.style.width = "30%";
      let header = '<div class="container text-center" id="logo"><h1>OneRestroomAway</h1></div>'
      let button = '<h3 class="container" style="padding:1rem;"></div><button type="button" class="btn btn-outline-light" onclick="endDirections()">←</button><h3>'
      let form = '<form id="enteraddress"><div class="input-group container" style:"padding: 1rem"><input id="address" type="text" class="form-control" onkeypress="return event.keyCode != 13" placeholder="Enter Starting Address "aria-label="Enter Starting Address" aria-describedby="button-addon2"><button class="btn btn-outline-secondary" type="button" id="button-addon2" onclick="startCoords([' + end + '])">Enter</button></form></div><div id="errormessage"></div>'
      el.innerHTML = header + button + form;
    } else {
      if (state.currLat != null && state.currLog != null) {
        var start = [state.currLog, state.currLat];
      }
      var url = 'https://api.mapbox.com/directions/v5/mapbox/walking/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;
      fetch(url)
          .then(handleResponse)
          .then(renderInstructions)
    }
}

function startCoords(end) {  
  var address = document.getElementById('address');
  let searchtext = address.value;
  let bbox = "-122.31753496111074,47.647176261717675,-122.29269536138283,47.66094893111739"
  let url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + searchtext + ".json?&" + "&access_token=" +mapboxgl.accessToken + "&limit=1&bbox=" + bbox;
  fetch(url)
        .then(handleResponse)
        .then(data => {
          if (data.features[0] == undefined) {
            let div = document.getElementById('errormessage');
            div.setAttribute('class', 'alert alert-danger container')
            div.innerHTML = '<h3 id = "error" class="container">Error: Cannot locate the address you have entered. Please enter the full address of your starting location.</h3>'
          } else {
            let start = data.features[0].geometry.coordinates;
          
            address2bathroom(start, end);
          }
        });
}

// find route between inputed starting point and bathroom
// then render instructions
function address2bathroom(start, end) {
  var url = 'https://api.mapbox.com/directions/v5/mapbox/walking/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;
          fetch(url)
              .then(handleResponse)
              .then(renderInstructions);
}

function renderInstructions(data) {
    var routes = data.routes[0];
    var el = document.getElementById('direction');
    el.style.width = "30%";
    var steps = routes.legs[0].steps;
    var tripInstructions = [];

    for (var i = 0; i < steps.length; i++) {
        tripInstructions.push('<br><li class="list-group-item list-group-flush flex-column align-items-start card_btn">' + steps[i].maneuver.instruction) + '</li>';
        let header = '<div class="container text-center" id="logo"><h1>OneRestroomAway</h1></div>'
        let button = '<button type="button" class="btn btn-outline-light" onclick="endDirections()">←</button>'
        el.innerHTML = header + '<h3 class="duration container" style="background-color: #b7a57a; padding: 1rem;">' + button + '  Trip duration: ' + Math.floor(routes.duration / 60) + ' mins </h3>' + tripInstructions;
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
  if (map.getSource('route')) {
    map.removeLayer('route');
    map.removeSource('route');
  }  
  document.getElementById("direction").style.width = "0";
}


function intersect(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a.filter(function (e) {
        return b.indexOf(e) > -1;
    });
}



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
    return dist.toFixed(2) + " miles";
	}
}

// functino to make popup from the side panel cards
function markerPopUpFromCard() {
  var data = this.data;
  
  var coordinates = data.geometry.coordinates;

  // create html for popup

  // if user provides location, display distance and get directions button
  let test = '<p>' + data.properties.name + '</p>';
  if (state.currLat != null && state.currLog != null) {
    let cord = distance(coordinates)
    test += ' <p> Distance: '+ cord + '</p>';
  }

  test = test + ' <button onclick="getRoute([' + data.geometry.coordinates + '])"> Get Directions </button>';


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

  // remove existing popups
  popup.remove()

  //new mapboxgl.Popup()
  popup
  .setLngLat(coordinates)
  .setHTML(test)
  .addTo(map);

  map.flyTo({
    center: [
    coordinates[0], 
    coordinates[1]]
  });


}

// let test = allBathrooms.features

// console.log(test)
// console.log(test[[0]].properties)
