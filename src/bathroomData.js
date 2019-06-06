var db = firebase.firestore();

db.collection("Bathrooms").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        

        
        console.log(
            //doc.id, " => ", doc.data()
            "hi"
            );
    });
});

    let test = {
        "type": "FeatureCollection", "features": [
            {"type": "Feature", 
            "properties": {"name": "Mary Gates", "disability":false}, 
            "geometry":{"type":"Point","coordinates":[-122.3080377, 47.654979]}},

            {"type": "Feature", 
            "properties": {"name": "CSE", "disability":false}, 
            "geometry":{"type":"Point","coordinates":[-122.3080377, 47.654979]}}

        ]
    }

    console.log(test);



    /*
                let obj = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [long, lat]
                },
                "properties": {
                    "name": name,
                    "bioguide_id": id,
                    "type": (type == "rep") ? "representative" : (type == "sen") ? "senator" : (type == "delegate") ? "delegate" : "Resident Commissioner",
                    "party": party,
                    "end": end,
                    "stateabb": stateabb,
                    "stateName": stateName,
                    "url": url,
                    "color": (party == "Democrat") ? "#0033cc" : (party == "Republican") ? "#ff0000" : "#ffffff"
                }
            }
    */