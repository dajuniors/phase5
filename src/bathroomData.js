var db = firebase.firestore();

let allBathrooms = {
    "type": "FeatureCollection",
    "features": []
}

db.collection("Bathrooms").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
         let test = doc.data();

        let obj = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [test.location._long, test.location._lat]
            },
            "properties": {
                "name": doc.id,
                "gender": test.gender,
                "needKey": test.key,
                "disabilityAccess": test.da,
                "address": test.address
            }
        }

        allBathrooms.features.push(obj);
    });
});




// let newObj = filter(allBathrooms.features.properties == )

//let myKeys = myObj.keys(data).filter(key => key == vm.system_id);