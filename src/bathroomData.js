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
                "disabilityAccess": test.da
            }
        }

        allBathrooms.features.push(obj);
    });
});

    // let test = {
    //     "type": "FeatureCollection", "features": [
    //         {"type": "Feature", 
    //         "properties": {"name": "Mary Gates", "disability":false}, 
    //         "geometry":{"type":"Point","coordinates":[-122.3080377, 47.654979]}},

    //         {"type": "Feature", 
    //         "properties": {"name": "CSE", "disability":false}, 
    //         "geometry":{"type":"Point","coordinates":[-122.3080377, 47.654979]}}

    //     ]
    // }

    // console.log(test);



    // /*
                
    // */