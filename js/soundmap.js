window.onload = function () {

    var debug = false;

    var OpenStreetMap_BlackAndWhite = L.tileLayer('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });


    var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    });

    var Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    });

    var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });


    var Stamen_TonerBackground = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20,
        ext: 'png'
    });



    var map = L.map('map', {
        zoomControl: true,
        zoomSnap: 0.25,
        layers: [OpenStreetMap_BlackAndWhite]
    });

    var baseMaps = {
        "<span style='color: gray'>Grayscale</span>": OpenStreetMap_BlackAndWhite,
        "No Labels": Stamen_TonerBackground,
        "Positron": CartoDB_Positron,
        "Topo": Esri_WorldTopoMap,
        "Satellite": Esri_WorldImagery
    };

    map.zoomControl.setPosition('bottomright');
    L.control.scale().addTo(map);

    L.control.fullscreen({
        position: 'bottomright'
    }).addTo(map);


    var markerLayer = L.layerGroup();
    var markerClGroup = L.markerClusterGroup({
        iconCreateFunction: function (cluster) {
            // const dim = cluster.getChildCount();
            return L.divIcon({
                html: '<div class="clusterdiv"><b style="position: relative; top: -3px">' + cluster.getChildCount() + '</b></div>'
            })
        },
        polygonOptions: {
            weight: 0.5,
            color: 'black'
        }
    });
    map.addLayer(markerClGroup);



    var overlayMaps = {
        "Markers": markerClGroup
    };

    // L.control.layers(baseMaps, overlayMaps).addTo(map); // add it after the slide menu
    // OpenStreetMap_BlackAndWhite.addTo(map);


    var blackIcon = L.icon({
        iconUrl: 'data/circle-marker.svg',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, 0]
    });

    var colorIcon = L.icon({
        iconUrl: 'data/circle-marker-color.svg',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, 0]
    });

    var lc = L.control.locate({
        showPopup: false,
        position: 'bottomright',
        drawMarker: false,
        drawCircle: false,
        strings: {
            title: "Locate"
        }
    }).addTo(map);

    function onLocationFound(e) {

        if (debug) console.log("location found", e);
        const radius = e.accuracy / 2;
        locCircle(e.latlng, radius);
    }

    map.on('locationfound', onLocationFound);

    function onLocationError(e) {
        alert(e.message);
    }

    map.on('locationerror', onLocationError);

    L.Control.geocoder({
        position: "bottomright",
        defaultMarkGeocode: false
    }).on('markgeocode', function (e) {
        lc.stop();
        if (debug) console.log("geocode", e);
        const ll = L.latLng(e.geocode.center.lat, e.geocode.center.lng);
        locCircle(ll, 100);
        map.setView(ll, 15);
    }).addTo(map);


    var locateCircle = null;

    function locCircle(latlng, radius) {
        if (locateCircle != null) {
            locateCircle.remove();
        }
        locateCircle = L.circle(latlng, {
            radius: radius,
            weight: 1,
            color: "black"
        });
        locateCircle.addTo(map);
    }

    // https://github.com/unbam/Leaflet.SlideMenu
    var slideMenu = L.control.slideMenu(
        '<input id="txtEmail" type="email" placeholder="Email" ></input>' +
        '<input id="txtPassword" type="password" placeholder="Password" ></input>' +
        '<button id="btnLogin" class="btn btn-action">Log in</button>' +
        '<button id="btnLogout" class="btn btn-action hide">Log out</button>' +
        '<button id="btnSignUp" class="btn btn-secondary hide">Sign Up</button></br></br>' +
        '<h2>Markers</h2>' +
        '<table id="markertable"></table>', {
            position: 'topright',
            menuposition: 'topright',
            height: '98%'

        }).addTo(map);

    // get elements
    const txtEmail = document.getElementById('txtEmail');
    const txtPassword = document.getElementById('txtPassword');
    const btnLogin = document.getElementById('btnLogin');
    const btnSignUp = document.getElementById('btnSignUp');
    const btnLogout = document.getElementById('btnLogout');


    L.control.layers(baseMaps, overlayMaps).addTo(map);


    function getEmptyFeature() {
        var feature = {
            "geometry": {
                "type": "Point",
                "coordinates": []
            },
            "key": "",
            "editMode": false,
            "properties": {
                "title": "",
                "description": "",
                "audio": [],
                "equipment": "",
                "date": "",
                "time": "",
                "location": "",
                "author": ""
            },
            "type": "Feature"
        };
        return feature;
    }

    var nanobar = new Nanobar();

    var geo_data = null;
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyCJG5WUmr-iXbiZeyi6appm9f6HvRjudag",
        authDomain: "sound-map-projec-1548326273973.firebaseapp.com",
        databaseURL: "https://sound-map-projec-1548326273973.firebaseio.com",
        projectId: "sound-map-projec-1548326273973",
        storageBucket: "sound-map-projec-1548326273973.appspot.com",
        messagingSenderId: "190466259734"
    };

    firebase.initializeApp(config);

    var database = firebase.database();
    var storage = firebase.storage();
    var storageRef = storage.ref();
    var user = null;

    btnLogin.addEventListener('click', e => {
        const email = txtEmail.value;
        const pass = txtPassword.value;
        const auth = firebase.auth();
        const promise = auth.signInWithEmailAndPassword(email, pass);
        promise.catch(e => {
            if (debug) console.log(e.message)
        });
    });

    btnSignUp.addEventListener('click', e => {
        const email = txtEmail.value;
        const pass = txtPassword.value;
        const auth = firebase.auth();
        const promise = auth.createUserWithEmailAndPassword(email, pass);
        promise
            .catch(e => {
                if (debug) console.log(e.message)
            });
    });

    btnLogout.addEventListener('click', e => {
        firebase.auth().signOut();
    });

    // obseve user state
    firebase.auth().onAuthStateChanged(firebaseUser => {
        user = firebaseUser;
        if (firebaseUser) {
            if (debug) console.log(firebaseUser);
            btnLogin.classList.add('hide');
            txtEmail.classList.add('hide');
            txtPassword.classList.add('hide');
            btnLogout.classList.remove('hide');
        } else {
            if (debug) console.log('not logged in');
            btnLogin.classList.remove('hide');
            txtEmail.classList.remove('hide');
            txtPassword.classList.remove('hide');
            btnLogout.classList.add('hide');
        }
    });


    var ref = database.ref('map0/layer0');
    ref.once("value", gotData, errData); // attach listener to markers data -> gotData is triggered.

    function gotData(data) {

        if (data.exists()) { // received some markers

            if (debug) console.log("got Data from db", data.val());
            geo_data = {
                "type": "FeatureCollection",
                "features": []
            }
            const markers = data.val();
            const keys = Object.keys(markers);

            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                geo_data.features.push(markers[key]);
                geo_data.features[i].key = key; // add key from db. not part of feature data
            }

            addGeoJsonToMap();
            updateMarkerListAll();
            if (debug) console.log(geo_data);
        } else { // no data received -> empty map
            map.locate({
                setView: true,
                maxZoom: 12
            });
            // var zoom = 7;
            // map.setView([0, 0], zoom);
        }
    }

    function errData(err) {
        if (debug) console.log("some errror");
    }



    function addGeoJsonToMap() {

        // create GeoJSON layer with marker and popup of all point features and add it to the map
        markerLayer = makeGeoJsonLayer(geo_data);
        markerClGroup.addLayer(markerLayer);

        map.fitBounds(markerLayer.getBounds(), {
            padding: [40, 40]
        });
    }

    function makeGeoJsonLayer(data) {
        let layer = L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                if (feature.geometry.type === "Point") {
                    layer.bindPopup(makePopupContent(feature), {
                            minWidth: 320,
                            minHeight: "auto"
                        }).on('popupopen', popupOpenHandler)
                        .on('contextmenu', markerContextMenuHandler)
                        .on('popupclose', popupCloseHandler);
                }
            },
            pointToLayer: function (geoJsonPoint, latlng) {
                let marker = L.marker(latlng, {
                    icon: blackIcon,
                    keyboard: false,
                    autoPan: true
                });
                marker
                    .on('dragend', function (e) {
                        if (debug) console.log(e.target.getLatLng());
                    });
                marker.options.selectedIndex = 0; // add custom data for popup close open handling. default is the first audio entry
                return marker;
            }
        });
        return layer;
    }


    function updateMarkerListAll() {
        const table = document.getElementById("markertable");
        table.innerHTML = "";
        const layers = markerLayer.getLayers();
        if (debug) console.log("layers", layers);
        for (let i in layers) {

            const row = table.insertRow(table.length);
            const cell = row.insertCell(0);
            cell.id = layers[i].feature.key;
            cell.innerHTML = layers[i].feature.properties.title;
            L.DomEvent.addListener(cell, 'click', markerListClickHandler);
        }
    }

    function markerListClickHandler(e) {
        const markElem = e.target;
        const layers = markerLayer.getLayers();
        let marker = null;

        for (let i = 0; i < layers.length; i++) {
            if (layers[i].feature.key === markElem.id) {
                if (debug) console.log("marker found", layers[i]);
                marker = layers[i];
                break;
            }
        }

        if (marker) {

            map.setView(marker.getLatLng());
            window.setTimeout(function () {
                marker.openPopup()
            }, 200);
            // marker.openPopup();
        }
    }

    function removeHash() {
        history.pushState("", document.title, window.location.pathname +
            window.location.search);
    }

    function popupOpenHandler(e) {
        if (menuVisible) toggleMenu("hide");
        var marker = e.target,
            properties = e.target.feature.properties;
        if (debug) console.log("popupOpen on marker:", marker)

        window.setTimeout(delayed, 200);

        function delayed() {
            // damit popop dom sicher existiert, wenn 2 hintereinander geöffnet werden

            // open popup on last tab
            L.DomEvent.addListener(L.DomUtil.get('tab1-link'), 'click', function (e) {
                marker.options.lastOpenedTab = 1;
                e.preventDefault();
                document.location.hash = '';
            });
            L.DomEvent.addListener(L.DomUtil.get('tab2-link'), 'click', function (e) {
                marker.options.lastOpenedTab = 2;
            });
            L.DomEvent.addListener(L.DomUtil.get('tab3-link'), 'click', function (e) {
                marker.options.lastOpenedTab = 3;
            });

            if (typeof marker.options.lastOpenedTab !== 'undefined') {
                L.DomUtil.get('tab' + marker.options.lastOpenedTab + '-link').click();
            }

            let lat = L.DomUtil.get('latitude');
            let long = L.DomUtil.get('longitude');

            if (marker.options.draggable) { // edit mode

                L.DomUtil.get('title').style.border = "1px dotted white";
                L.DomUtil.get('title').removeAttribute("readOnly");

                L.DomUtil.get('file-item').style.display = "block";

                L.DomUtil.get('descriptionPart').style.display = "block";
                L.DomUtil.get('description').style.border = "1px dotted white";
                L.DomUtil.get('description').removeAttribute("readonly");

                L.DomUtil.get('equipmentPart').style.display = "block";
                L.DomUtil.get('equipment').style.border = "1px dotted white";
                L.DomUtil.get('equipment').removeAttribute("readOnly");

                L.DomUtil.get('locationPart').style.display = "block";
                L.DomUtil.get('location').style.border = "1px dotted white";
                L.DomUtil.get('location').removeAttribute("readOnly");

                L.DomUtil.get('dateTimePart').style.display = "block";
                L.DomUtil.get('date').style.border = "1px dotted white";
                L.DomUtil.get('date').removeAttribute("readOnly");
                L.DomUtil.get('time').style.border = "1px dotted white";
                L.DomUtil.get('time').removeAttribute("readOnly");

                lat.style.border = "1px dotted white";
                lat.removeAttribute("readOnly");
                long.style.border = "1px dotted white";
                long.removeAttribute("readOnly");

                L.DomUtil.get('authorPart').style.display = "block";
                L.DomUtil.get('author').style.border = "1px dotted white";
                L.DomUtil.get('author').removeAttribute("readOnly");

                L.DomUtil.get('video-file-item').style.display = "block";
                const videoItems = L.DomUtil.get('videoPart').children;
                for (let i = 0; i < videoItems.length; i++) {
                    const vidElems = videoItems[i].children;
                    for (let j = 0; j < vidElems.length; j++) {
                        if (vidElems[j].nodeName === 'INPUT') {
                            vidElems[j].style.border = "1px dotted white";
                            vidElems[j].removeAttribute("readOnly");
                        } else if (vidElems[j].nodeName === 'I') {
                            // delete icon
                            vidElems[j].style.display = "inline";
                            L.DomEvent.addListener(vidElems[j], 'click', videoContextHandler); // delete selected file
                        }
                    }
                }

                L.DomUtil.get('files-file-item').style.display = "block";
                const fileItems = L.DomUtil.get('filesPart').children;
                for (let i = 0; i < fileItems.length; i++) {
                    L.DomEvent.addListener(fileItems[i], 'contextmenu', filesContextHandler); // delete selected file
                }


            } else {
                if (L.DomUtil.get('description').value !== "") {
                    L.DomUtil.get('descriptionPart').style.display = "block";
                }
                if (L.DomUtil.get('equipment').value !== "") {
                    L.DomUtil.get('equipmentPart').style.display = "block";
                }
                if (L.DomUtil.get('location').value !== "") {
                    L.DomUtil.get('locationPart').style.display = "block";
                }
                if (L.DomUtil.get('date').value !== "" || L.DomUtil.get('time').value !== "") {
                    L.DomUtil.get('dateTimePart').style.display = "block";
                }
                if (L.DomUtil.get('author').value !== "") {
                    L.DomUtil.get('authorPart').style.display = "block";
                }
            }


            // set popup height

            let h = 0;
            let vidH = 0;

            if (typeof marker.feature.popupHeight === "undefined") {
                // first time popup is opened. tab is main tab1
                const els = L.DomUtil.get('tab1-content').children;
                for (let i = 0; i < els.length; i++) {
                    h += els[i].offsetHeight;
                    if (debug) console.log(els[i], els[i].offsetHeight);
                }

                h += 50;
                marker.feature.popupHeight = h;
                if (debug) console.log("popupHeight", marker.feature.popupHeight);
            }

            if (typeof marker.feature.properties.video != "undefined" && typeof marker.feature.popupHeightV === "undefined") {
                vidH = L.DomUtil.get('videoPart').offsetHeight;

                if (vidH != 0) { // video tab is open
                    vidH += 50;
                    marker.feature.popupHeightV = vidH;
                    marker.feature.popupHeight = vidH;
                } else {
                    vidH = 400; // assume max height
                }
            }

            if (vidH == 400) {
                L.DomUtil.get('content').style.height = "400px";
            } else {
                L.DomUtil.get('content').style.height = marker.feature.popupHeight + "px";
            }


            // if marker was dragged -> update the dom elements
            if (long.value != marker.getLatLng().lng) {
                long.value = marker.getLatLng().lng
            };
            if (lat.value != marker.getLatLng().lat) {
                lat.value = marker.getLatLng().lat
            };



            // add event listeners
            L.DomEvent.addListener(lat, 'change', latChangeHandler);

            function latChangeHandler(e) {
                if (lat.value <= 90 && lat.value >= -90) {
                    // remove the marker from the clustergroup (otherwise crash)
                    let layer = markerClGroup.getLayer(L.stamp(marker));
                    markerClGroup.removeLayer(layer);
                    let pos = {
                        "lat": lat.value,
                        "lng": long.value
                    };
                    marker.setLatLng(pos);
                    // add the marker to the clustergroup again
                    markerClGroup.addLayer(layer);
                    map.setView(pos);
                }
            }


            L.DomEvent.addListener(long, 'change', longChangeHandler);

            function longChangeHandler(e) {
                if (long.value <= 180 && lat.value >= -180) {
                    // remove the marker from the clustergroup (otherwise crash)
                    let layer = markerClGroup.getLayer(L.stamp(marker));
                    markerClGroup.removeLayer(layer);
                    let pos = {
                        "lat": lat.value,
                        "lng": long.value
                    };
                    marker.setLatLng(pos);
                    // add the marker to the clustergroup again
                    markerClGroup.addLayer(layer);
                    map.setView(pos);
                }
            }


            var changeSel = L.DomUtil.get('audio-selection');
            L.DomEvent.addListener(changeSel, 'change', changeSelHandler);

            function changeSelHandler(e) {
                const idx = changeSel.selectedIndex;
                if (debug) console.log("changeSelHandlder index=", idx);
                if (idx > -1) { // valid index
                    const text = changeSel.options[idx].text;
                    const audioElement = L.DomUtil.get('audio')
                    let audio;
                    if (marker.options.draggable) audio = marker.editFeature.properties.audio;
                    else audio = marker.feature.properties.audio;

                    for (i in audio) {
                        if (text === audio[i].name) {
                            audioElement.src = audio[i].url;
                            break;
                        }
                    }

                    audioElement.pause();
                    audioElement.load();
                }
            }


            // Delete single selected File ---------------------------------------------------------------------------------------------
            L.DomEvent.addListener(changeSel, 'contextmenu', contextSelHandler); // delete selected file

            function contextSelHandler(e) {
                e.preventDefault();
                if (user != null && marker.options.draggable) { // edit mode
                    if (window.confirm("Remove the selected audio file?")) {
                        const idx = changeSel.selectedIndex;
                        if (idx > -1) { // valid index
                            let audioFileName = changeSel.options[idx].text;

                            if (marker.feature.key != "") { // marker is already in db

                                // check if file in db storage and delete from storage is neccessary 
                                if (typeof marker.feature.properties.audio != "undefined") { // audio exists
                                    let audio = marker.feature.properties.audio;
                                    let found = false;
                                    for (i in audio) {
                                        if (audio[i].name === audioFileName) {
                                            found = true;
                                            break;
                                        }
                                    }
                                    // add to delete list if it exist in db
                                    if (found) {
                                        // check if not already listed
                                        audio = marker.editFeature.properties.audioToDelete;
                                        found = false;
                                        for (let i = 0; i < audio.length; i++) {
                                            if (audio[i] === audioFileName) {
                                                found = true;
                                                break;
                                            }
                                        }
                                        if (!found) marker.editFeature.properties.audioToDelete.push(audioFileName);
                                    }
                                }
                            }
                            // remove from files to add and editfeature audio list
                            let audio = marker.editFeature.properties.audioToAdd;
                            for (i in audio) {
                                if (audio[i].name === audioFileName) {
                                    audio.splice(i, 1);
                                    break;
                                }
                            }
                            audio = marker.editFeature.properties.audio;
                            for (i in audio) {
                                if (audio[i].name === audioFileName) {
                                    audio.splice(i, 1);
                                    break;
                                }
                            }
                            // update the select menu. 
                            for (i = 0; i < changeSel.length; i++) {
                                if (changeSel.options[i].text === audioFileName) {
                                    changeSel.remove(i);
                                }
                            }

                            if (debug) console.log("context deleted", marker);
                        }
                    }
                }
            }

            function videoContextHandler(e) {
                e.preventDefault();
                if (user != null && marker.options.draggable) { // edit mode
                    if (window.confirm("Remove the selected video/image file?")) {
                        if (debug) console.log("video click delete", e);

                        const videoContainer = e.target.parentNode;
                        const videoItems = videoContainer.children;
                        let idx = null;
                        let src = null;
                        // get src of video item
                        for (idx = 0; idx < videoItems.length; idx++) {
                            if (videoItems[idx].nodeName === 'VIDEO' || videoItems[idx].nodeName === 'IMG') {
                                src = videoItems[idx].src;
                                break;
                            }
                        }

                        // get video file name,if file is in the to add list
                        let videoFileName = "";
                        let video = marker.editFeature.properties.videoToAdd;
                        for (i in video) {
                            if (video[i].src === src) {
                                videoFileName = video[i].name;
                                break;
                            }
                        }

                        if (marker.feature.key != "") { // marker is already in db
                            // check if file in db storage and delete from storage is neccessary 
                            if (typeof marker.feature.properties.video != "undefined") { // video exists
                                let video = marker.feature.properties.video;
                                let found = false;

                                for (i in video) {
                                    if (video[i].url === src) {
                                        found = true;
                                        videoFileName = video[i].name;
                                        break;
                                    }
                                }
                                // add to delete list if it exist in db
                                if (found) {
                                    // check if not already listed
                                    video = marker.editFeature.properties.videoToDelete;
                                    found = false;
                                    for (let i = 0; i < video.length; i++) {
                                        if (video[i] === videoFileName) {
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (!found) marker.editFeature.properties.videoToDelete.push(videoFileName);
                                }
                            }
                        }

                        // remove from files to add and editfeature video list
                        video = marker.editFeature.properties.videoToAdd;
                        for (i in video) {
                            if (video[i].name === videoFileName) {
                                video.splice(i, 1);
                                break;
                            }
                        }
                        video = marker.editFeature.properties.video;
                        for (i in video) {
                            if (video[i].name === videoFileName) {
                                video.splice(i, 1);
                                break;
                            }
                        }

                        // remove from dom
                        L.DomUtil.get('videoPart').removeChild(videoContainer); // remove image/video
                    }
                }
            }

            function filesContextHandler(e) {
                e.preventDefault();

                if (window.confirm("Remove the selected file?")) {
                    if (debug) console.log("file context delete", e);

                    const filesPart = e.target.parentNode;
                    const fileItems = filesPart.children;
                    let idx = null;
                    let src = null;
                    let fileName = null;
                    for (idx = 0; idx < fileItems.length; idx++) {
                        if (fileItems[idx] === e.target) {
                            if (debug) console.log("found", idx);
                            src = fileItems[idx].src;
                            fileName = fileItems[idx].text;
                            break;
                        }
                    }


                    if (marker.feature.key != "") { // marker is already in db
                        // check if file in db storage and delete from storage is neccessary 
                        if (typeof marker.feature.properties.files != "undefined") { // video exists
                            let fils = marker.feature.properties.files;
                            let found = false;

                            for (i in fils) {
                                if (fils[i].url === src) {
                                    found = true;
                                    // fileName = video[i].name;
                                    break;
                                }
                            }
                            // add to delete list if it exist in db
                            if (found) {
                                // check if not already listed
                                fils = marker.editFeature.properties.filesToDelete;
                                found = false;
                                for (let i = 0; i < fils.length; i++) {
                                    if (fils[i] === fileName) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) marker.editFeature.properties.filesToDelete.push(fileName);
                            }
                        }
                    }

                    // remove from files to add and editfeature video list
                    fils = marker.editFeature.properties.filesToAdd;
                    for (i in fils) {
                        if (fils[i].name === fileName) {
                            fils.splice(i, 1);
                            break;
                        }
                    }
                    fils = marker.editFeature.properties.files;
                    for (i in fils) {
                        if (fils[i].name === fileName) {
                            fils.splice(i, 1);
                            break;
                        }
                    }

                    // remove from dom
                    for (idx = 0; idx < fileItems.length; idx++) {
                        if (fileItems[idx] === e.target) {
                            filesPart.removeChild(fileItems[idx]); // remove file
                            break;
                        }
                    }
                }


            }

            if (debug) console.log("selected index on open", marker.options.selectedIndex);

            if (marker.options.selectedIndex === -1) marker.options.selectedIndex = 0;
            if (marker.options.selectedIndex !== null) {
                changeSel.selectedIndex = marker.options.selectedIndex;
                changeSelHandler(e);
            }



            const fileItem = L.DomUtil.get('file-item');
            L.DomEvent.addListener(fileItem, 'change', function (e) {
                if (debug) console.log("fileItem", fileItem.files);

                for (let i = 0; i < fileItem.files.length; i++) {
                    const file = fileItem.files[i];
                    // check if file already exists in files to add list
                    let found = false;
                    marker.editFeature.properties.audioToAdd.forEach(function (audio) {
                        if (audio.name === file.name) {
                            found = true;
                        }
                    });
                    if (!found) {
                        marker.editFeature.properties.audioToAdd.push(file);
                    }

                    const tempURL = URL.createObjectURL(file); // temporary local file path

                    // check if already in existing audio file list
                    found = false;
                    if (typeof marker.editFeature.properties.audio !== "undefined") {
                        marker.editFeature.properties.audio.forEach(function (audio) {
                            if (audio.name === file.name) {
                                audio.url = tempURL; // replace url by temp url
                                found = true;
                            }
                        });
                    } else {
                        marker.editFeature.properties.audio = [];
                    }

                    if (!found) { // new file name
                        marker.editFeature.properties.audio.push({
                            "name": file.name,
                            "url": tempURL
                        });

                        // update the select menu. 
                        const changeSel = L.DomUtil.get('audio-selection');
                        const option = document.createElement("option");
                        option.text = file.name
                        changeSel.add(option);
                        changeSel.selectedIndex = changeSel.length - 1;
                        L.DomUtil.get('audioPart').style.display = "block";
                    }

                    L.DomUtil.get('audio').src = tempURL;
                }
            });


            const videoFileItem = L.DomUtil.get('video-file-item');
            L.DomEvent.addListener(videoFileItem, 'change', function (e) {
                if (debug) console.log("videoFileItem", videoFileItem.files);

                for (let i = 0; i < videoFileItem.files.length; i++) {
                    const file = videoFileItem.files[i];
                    // check if file already exists in files to add list
                    let found = false;
                    marker.editFeature.properties.videoToAdd.forEach(function (video) {
                        if (video.name === video.name) {
                            found = true;
                        }
                    });
                    if (!found) {
                        marker.editFeature.properties.videoToAdd.push(file);
                    }

                    const tempURL = URL.createObjectURL(file); // temporary local file path

                    // check if already in existing video file list
                    found = false;
                    if (typeof marker.editFeature.properties.video !== "undefined") {
                        marker.editFeature.properties.video.forEach(function (video) {
                            if (video.name === file.name) {
                                video.url = tempURL; // replace url by temp url
                                found = true;
                            }
                        });
                    } else {
                        marker.editFeature.properties.video = [];
                    }

                    if (!found) { // new file name
                        const idx = marker.editFeature.properties.video.push({
                            "name": file.name,
                            "url": tempURL,
                            "type": file.type
                        });
                        // if (debug) console.log(makeVideoPart(marker.editFeature.properties.video[idx-1]));
                        // L.DomUtil.get("videoPart").appendChild(makeVideoPart(marker.editFeature.properties.video[idx-1]));
                    }
                }

                if (marker.getPopup().isOpen()) {
                    marker.closePopup();
                }
                marker.openPopup();
            });

            const filesFileItem = L.DomUtil.get('files-file-item');
            L.DomEvent.addListener(filesFileItem, 'change', function (e) {
                if (debug) console.log("filesFileItem", filesFileItem.files);

                for (let i = 0; i < filesFileItem.files.length; i++) {
                    const file = filesFileItem.files[i];
                    // check if file already exists in files to add list
                    let found = false;
                    marker.editFeature.properties.filesToAdd.forEach(function (fil) {
                        if (fil.name === file.name) {
                            found = true;
                        }
                    });
                    if (!found) {
                        marker.editFeature.properties.filesToAdd.push(file);
                    }

                    const tempURL = URL.createObjectURL(file); // temporary local file path

                    // check if already in existing video file list
                    found = false;
                    if (typeof marker.editFeature.properties.files !== "undefined") {
                        marker.editFeature.properties.files.forEach(function (fil) {
                            if (fil.name === file.name) {
                                fil.url = tempURL; // replace url by temp url
                                found = true;
                            }
                        });
                    } else {
                        marker.editFeature.properties.files = [];
                    }

                    if (!found) { // new file name
                        const idx = marker.editFeature.properties.files.push({
                            "name": file.name,
                            "url": tempURL,
                            "type": file.type
                        });
                    }

                }
                if (marker.getPopup().isOpen()) {
                    marker.closePopup();
                }
                marker.openPopup();
            });
        }
    }




    function popupCloseHandler(e) {
        if (debug) console.log("popupCloseHandler", e);

        let marker = e.target;
        if (marker.getPopup().isOpen()) {
            const changeSel = L.DomUtil.get('audio-selection');
            let idx = changeSel.selectedIndex;
            marker.options.selectedIndex = idx;
            if (debug) console.log("selected index on close", marker.options.selectedIndex);

            if (marker.options.draggable) {
                // close while editable -> save popup data temporarily: get popup data from dom elements, 
                // store to editFeature and update the _popup in memory, 
                // but leave the marker feature unchanged (for restoring the state when cancel action)

                // data from all editable popup dom elements
                marker.editFeature.properties.title = L.DomUtil.get('title').value;
                marker.editFeature.properties.description = L.DomUtil.get('description').value;
                marker.editFeature.properties.equipment = L.DomUtil.get('equipment').value;
                marker.editFeature.properties.location = L.DomUtil.get('location').value;
                marker.editFeature.properties.date = L.DomUtil.get('date').value;
                marker.editFeature.properties.time = L.DomUtil.get('time').value;
                marker.editFeature.properties.author = L.DomUtil.get('author').value;

                let pos = marker.getLatLng();
                marker.editFeature.geometry.coordinates[0] = pos.lng;
                marker.editFeature.geometry.coordinates[1] = pos.lat;

                const videoItems = L.DomUtil.get('videoPart').children;
                console.log("dom video items", videoItems.length);
                for (let i = 0; i < videoItems.length; i++) {
                    const vidElems = videoItems[i].children;
                    console.log("vid elems", vidElems.length);
                    for (let j = 0; j < vidElems.length; j++) {

                        if (vidElems[j].nodeName === 'INPUT') {
                            console.log(i, j);
                            marker.editFeature.properties.video[i].text = vidElems[j].value;
                        }
                    }
                }

                marker.setPopupContent(makePopupContent(marker.editFeature)); // update popup content
                if (debug) console.log("editable marker closed", marker);
            } else {
                marker.setPopupContent(makePopupContent(marker.feature)); // update popup content for height
            }
        }
    }



    function markerEditMode(marker, on) {
        if (on) {
            marker.options.draggable = true;
            marker.dragging.enable();
            marker.setIcon(colorIcon);
        } else {
            marker.options.draggable = false; // edit mode off
            marker.dragging.disable();
            marker.setIcon(blackIcon);
        }
    }


    // return a deep copy of the feature with additional data used in editmode
    function makeEditFeature(feature) {
        let editFeature = JSON.parse(JSON.stringify(feature));
        editFeature.properties.audioToAdd = []; // add additional edit data
        editFeature.properties.audioToDelete = [];
        editFeature.properties.videoToAdd = []; // add additional edit data
        editFeature.properties.videoToDelete = [];
        editFeature.properties.filesToAdd = []; // add additional edit data
        editFeature.properties.filesToDelete = [];
        if (debug) console.log("make editFeature", editFeature);
        return editFeature;
    }


    // marker context menu ------------------------------------------------------------------------------------------------------
    function markerContextMenuHandler(e) {
        if (debug) console.log("markerContext", e)
        if (user != null) {
            const origin = {
                left: e.containerPoint.x + 10,
                top: e.containerPoint.y
            };
            setPosition(origin);

            var marker = e.target;

            var newMenu = document.querySelector("#new-menu");
            var editMenu = document.querySelector("#edit-menu");
            var cancelMenu = document.querySelector("#cancel-menu");
            var saveMenu = document.querySelector("#save-menu");
            var delMenu = document.querySelector("#delete-menu");

            newMenu.style.display = "none";
            delMenu.style.display = "block";

            if (marker.options.draggable) { // edit mode
                editMenu.style.display = "none";
                cancelMenu.style.display = "block";
                saveMenu.style.display = "block";
            } else {
                editMenu.style.display = "block";
                cancelMenu.style.display = "none";
                saveMenu.style.display = "none";
            }


            // edit menu
            editMenu.onclick = function () {
                toggleMenu("hide");
                if (debug) console.log("edit menu selected", e);

                // when entering edit mode: 
                //create editFeature by copying marker.feature
                if (!marker.draggable) {

                    if (marker.feature.key !== "") {

                        // check if marker is being edited
                        const ref = database.ref('map0/layer0/' + marker.feature.key + '/editMode');
                        ref.once('value', function (snapshot) {
                            if (debug) console.log(snapshot.val());
                            if (snapshot.val() === false) {
                                ref.set(true);
                                markerEditMode(marker, true);
                                marker.editFeature = makeEditFeature(marker.feature);
                                if (marker.getPopup().isOpen()) {
                                    marker.closePopup();
                                }
                                marker.openPopup();
                            } else {
                                if (window.confirm("This marker is being edited.\nDo you still want to edit it?")) {
                                    ref.set(true);
                                    markerEditMode(marker, true);
                                    marker.editFeature = makeEditFeature(marker.feature);
                                    if (marker.getPopup().isOpen()) {
                                        marker.closePopup();
                                    }
                                    marker.openPopup();
                                }
                            }
                        });
                    } else { // marker not yet in db
                        markerEditMode(marker, true);
                        marker.editFeature = makeEditFeature(marker.feature);
                    }
                }

            }



            cancelMenu.onclick = function () {
                toggleMenu("hide");
                markerEditMode(marker, false);

                if (marker.feature.key !== "") {
                    const ref = database.ref('map0/layer0/' + marker.feature.key + '/editMode');
                    ref.set(false);
                }

                // recreate popup from marker feature. editFeature will be created newly when entering edit mode again
                marker.setPopupContent(makePopupContent(marker.feature));

                marker.closePopup();
                // reset lat lng
                marker.setLatLng([marker.feature.geometry.coordinates[1], marker.feature.geometry.coordinates[0]]);
            }


            // Save marker ----------------------------------------------------------------------------------------------------------
            saveMenu.onclick = function () {
                // save changes to the feature in marker and send to db
                toggleMenu("hide");
                if (window.confirm("Save all changes to the marker?")) {
                    // update the leaflet marker feature with the popup content,
                    // if popup open -> get data from dom elements
                    if (marker.getPopup().isOpen()) {
                        marker.feature.properties.title = L.DomUtil.get('title').value;
                        marker.feature.properties.description = L.DomUtil.get('description').value;
                        marker.feature.properties.equipment = L.DomUtil.get('equipment').value;
                        marker.feature.properties.location = L.DomUtil.get('location').value;
                        marker.feature.properties.date = L.DomUtil.get('date').value;
                        marker.feature.properties.time = L.DomUtil.get('time').value;
                        marker.feature.properties.author = L.DomUtil.get('author').value;
                        const videoItems = L.DomUtil.get('videoPart').children;
                        for (let i = 0; i < videoItems.length; i++) {
                            const vidElems = videoItems[i].children;
                            for (let j = 0; j < vidElems.length; j++) {

                                if (vidElems[j].nodeName === 'INPUT') {
                                    marker.editFeature.properties.video[i].text = vidElems[j].value;
                                }
                            }
                        }

                    } else {
                        // popup not open -> take data from editFeature
                        marker.feature.properties.title = marker.editFeature.properties.title;
                        marker.feature.properties.description = marker.editFeature.properties.description;
                        marker.feature.properties.equipment = marker.editFeature.properties.equipment;
                        marker.feature.properties.location = marker.editFeature.properties.location;
                        marker.feature.properties.date = marker.editFeature.properties.date;
                        marker.feature.properties.time = marker.editFeature.properties.time;
                        marker.feature.properties.author = marker.editFeature.properties.author;
                    }

                    // copy edited audio file list
                    if (typeof marker.editFeature.properties.audio !== "undefined") {
                        marker.feature.properties.audio = marker.editFeature.properties.audio;
                    }
                    // copy edited video file list
                    if (typeof marker.editFeature.properties.video !== "undefined") {
                        marker.feature.properties.video = marker.editFeature.properties.video;
                    }
                    // copy edited files file list
                    if (typeof marker.editFeature.properties.files !== "undefined") {
                        marker.feature.properties.files = marker.editFeature.properties.files;
                    }

                    marker.feature.geometry.coordinates[0] = marker.getLatLng().lng;
                    marker.feature.geometry.coordinates[1] = marker.getLatLng().lat;

                    if (marker.feature.key === "") { // new marker -> get key from database
                        let key = database.ref('map0/layer0/').push().key; // client side operation -> no promise necessary
                        marker.feature.key = key;
                        if (debug) console.log("new key ", key);
                    }


                    // store updated marker to db
                    let ref = database.ref('map0/layer0/' + marker.feature.key);
                    ref.set(marker.feature);


                    if (marker.editFeature.properties.audioToAdd.length > 0) { // new file(s) selected

                        // save media files to storage db
                        const promises = [];
                        marker.editFeature.properties.audioToAdd.forEach(file => {
                            const mediaStoragRef = storageRef.child('map0/layer0/' + marker.feature.key + '/' + file.name);
                            const uploadTask = mediaStoragRef.put(file);

                            promises.push(uploadTask);

                            uploadTask.on('state_changed', snapshot => {
                                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                if (debug) console.log(progress);
                                nanobar.go(progress);
                            }, error => {
                                if (debug) console.log(error)
                            }, () => {
                                if (debug) console.log(file.name + ' Uploaded!');
                                uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {

                                    // update url of audio file
                                    const audio = marker.feature.properties.audio;
                                    let idx = null;
                                    for (idx in audio) {
                                        if (audio[idx].name === file.name) {
                                            audio[idx].url = downloadURL;

                                            const ref = database.ref('map0/layer0/' + marker.feature.key + '/properties/audio/' + idx);
                                            ref.set(marker.feature.properties.audio[idx]);
                                            break;
                                        }
                                    }
                                });
                            });
                        });

                        Promise.all(promises).then(tasks => {
                            if (debug) console.log('all audio uploads complete', marker.feature);
                        }).catch(reason => {
                            if (debug) console.log(reason)
                            alert(reason);
                        });
                    }

                    if (marker.editFeature.properties.audioToDelete.length > 0) {
                        const delAudio = marker.editFeature.properties.audioToDelete;
                        for (let i = 0; i < delAudio.length; i++) {
                            // Create a reference to the file to delete
                            const mediaStoragRef = storageRef.child('map0/layer0/' + marker.feature.key + '/' + delAudio[i]);
                            mediaStoragRef.delete().then(function () {
                                if (debug) console.log("file deleted: " + delAudio[i]);
                            }).catch(function (error) {
                                // Uh-oh, an error occurred!
                                if (debug) console.log("file deletion error");
                            });
                        }
                    }

                    if (marker.editFeature.properties.videoToAdd.length > 0) { // new file(s) selected

                        // save media files to storage db
                        const promises = [];
                        marker.editFeature.properties.videoToAdd.forEach(file => {
                            const mediaStoragRef = storageRef.child('map0/layer0/' + marker.feature.key + '/' + file.name);
                            const uploadTask = mediaStoragRef.put(file);

                            promises.push(uploadTask);

                            uploadTask.on('state_changed', snapshot => {
                                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                if (debug) console.log(progress);
                                nanobar.go(progress);
                            }, error => {
                                if (debug) console.log(error)
                            }, () => {
                                if (debug) console.log(file.name + ' Uploaded!');
                                uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {

                                    // update url of video file
                                    const video = marker.feature.properties.video;
                                    let idx = null;
                                    for (idx in video) {
                                        if (video[idx].name === file.name) {
                                            video[idx].url = downloadURL;

                                            const ref = database.ref('map0/layer0/' + marker.feature.key + '/properties/video/' + idx);
                                            ref.set(marker.feature.properties.video[idx]);
                                            break;
                                        }
                                    }
                                });
                            });
                        });

                        Promise.all(promises).then(tasks => {
                            if (debug) console.log('all video uploads complete', marker.feature);
                        }).catch(reason => {
                            if (debug) console.log(reason)
                            alert(reason);
                        });
                    }

                    if (marker.editFeature.properties.videoToDelete.length > 0) {
                        const delVideo = marker.editFeature.properties.videoToDelete;
                        for (let i = 0; i < delVideo.length; i++) {
                            // Create a reference to the file to delete
                            const mediaStoragRef = storageRef.child('map0/layer0/' + marker.feature.key + '/' + delVideo[i]);
                            mediaStoragRef.delete().then(function () {
                                if (debug) console.log("file deleted: " + delVideo[i]);
                            }).catch(function (error) {
                                // Uh-oh, an error occurred!
                                if (debug) console.log("file deletion error");
                            });
                        }
                    }


                    if (marker.editFeature.properties.filesToAdd.length > 0) { // new file(s) selected

                        // save media files to storage db
                        const promises = [];
                        marker.editFeature.properties.filesToAdd.forEach(file => {
                            const mediaStoragRef = storageRef.child('map0/layer0/' + marker.feature.key + '/' + file.name);
                            const uploadTask = mediaStoragRef.put(file);

                            promises.push(uploadTask);

                            uploadTask.on('state_changed', snapshot => {
                                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                if (debug) console.log(progress);
                                nanobar.go(progress);
                            }, error => {
                                if (debug) console.log(error)
                            }, () => {
                                if (debug) console.log(file.name + ' Uploaded!');
                                uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {

                                    // update url of video file
                                    const fils = marker.feature.properties.files;
                                    let idx = null;
                                    for (idx in fils) {
                                        if (fils[idx].name === file.name) {
                                            fils[idx].url = downloadURL;

                                            const ref = database.ref('map0/layer0/' + marker.feature.key + '/properties/files/' + idx);
                                            ref.set(marker.feature.properties.files[idx]);
                                            break;
                                        }
                                    }
                                });
                            });
                        });

                        Promise.all(promises).then(tasks => {
                            if (debug) console.log('all file uploads complete', marker.feature);
                        }).catch(reason => {
                            if (debug) console.log(reason)
                            alert(reason);
                        });
                    }

                    if (marker.editFeature.properties.filesToDelete.length > 0) {
                        const delFiles = marker.editFeature.properties.filesToDelete;
                        for (let i = 0; i < delFiles.length; i++) {
                            // Create a reference to the file to delete
                            const mediaStoragRef = storageRef.child('map0/layer0/' + marker.feature.key + '/' + delFiles[i]);
                            mediaStoragRef.delete().then(function () {
                                if (debug) console.log("file deleted: " + delFiles[i]);
                            }).catch(function (error) {
                                // Uh-oh, an error occurred!
                                if (debug) console.log("file deletion error");
                            });
                        }
                    }


                    markerEditMode(marker, false);
                    ref = database.ref('map0/layer0/' + marker.feature.key + '/editMode');
                    ref.set(false);

                    // update the popup data with the updated marker feature
                    marker.setPopupContent(makePopupContent(marker.feature));
                    if (marker.getPopup().isOpen()) popupOpenHandler(e);
                    updateMarkerListAll();
                }
            }




            // Delete complete marker -----------------------------------------------------------------------------------------------
            delMenu.onclick = function () {
                toggleMenu("hide");
                if (debug) console.log("delete menu selected", e);
                if (window.confirm("Delete the entire marker?")) {
                    // delete data from db

                    if (marker.feature.key != "") { // marker that exists in the db

                        // check if not being edited
                        const ref = database.ref('map0/layer0/' + marker.feature.key + '/editMode');
                        ref.once('value', function (snapshot) {
                            if (debug) console.log(snapshot.val());
                            if (snapshot.val() === false) {
                                if (debug) console.log("marker is not being edited");
                                deleteMarker(marker);
                            } else {
                                if (window.confirm("This marker is being edited.\nDo you still want to delete it?")) {
                                    deleteMarker(marker);
                                }
                            }
                        });

                    } else {
                        markerLayer.removeLayer(marker);
                        markerClGroup.removeLayer(marker);
                    }
                }

                function deleteMarker(marker) {
                    if (typeof marker.feature.properties.audio != "undefined" && marker.feature.properties.audio.length > 0) {
                        // remove from storage db
                        // tbs promise.all?
                        marker.feature.properties.audio.forEach(audio => {
                            // Create a reference to the file to delete
                            var mediaStoragRef = storageRef.child('map0/layer0/' + marker.feature.key + '/' + audio.name);

                            // Delete the file
                            mediaStoragRef.delete().then(function () {
                                // File deleted successfully
                                if (debug) console.log("file deleted from storage: " + audio.name);
                            }).catch(function (error) {
                                // Uh-oh, an error occurred!
                                if (debug) console.log("file deletion error");
                            });
                        });
                    }

                    database.ref('map0/layer0/' + marker.feature.key).remove();
                    if (debug) console.log("removed " + marker.feature.key + " from firebase");
                    markerLayer.removeLayer(marker);
                    markerClGroup.removeLayer(marker);
                }
            }
        }
        return false;
    }



    // marker context menu handling
    const menu = document.querySelector(".menu");
    // prevent right click on menu item, because it's not part of the map
    menu.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    let menuVisible = false;

    const toggleMenu = command => {
        menu.style.display = command === "show" ? "block" : "none";
        menuVisible = !menuVisible;
    };

    const setPosition = ({
        top,
        left
    }) => {
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        toggleMenu("show");
    };



    // hide custom menu
    map.on('click', function (e) {
        // if (debug) console.log("mapclick");
        toggleMenu("hide");
        if (locateCircle != null) {
            locateCircle.remove();
        }
    });



    // create new marker on map with right click or long press
    map.on('contextmenu', function (e) {
        if (debug) console.log("map context menu", e)
        if (user != null) {
            // show context menu with New entry
            const origin = {
                left: e.containerPoint.x,
                top: e.containerPoint.y
            };
            setPosition(origin);

            var newMenu = document.querySelector("#new-menu");
            var editMenu = document.querySelector("#edit-menu");
            var cancelMenu = document.querySelector("#cancel-menu");
            var saveMenu = document.querySelector("#save-menu");
            var delMenu = document.querySelector("#delete-menu");

            newMenu.style.display = "block";
            editMenu.style.display = "none";
            cancelMenu.style.display = "none";
            saveMenu.style.display = "none";
            delMenu.style.display = "none";

            // "New" menu function -> add a new marker
            newMenu.onclick = function () {
                toggleMenu("hide");
                if (locateCircle != null) {
                    locateCircle.remove();
                }

                let feature = getEmptyFeature();

                feature.geometry.coordinates = [e.latlng.lng, e.latlng.lat];
                let layer = makeGeoJsonLayer(feature);
                let marker = layer.getLayers()[0]; // get marker from layer
                markerLayer.addLayer(marker);
                markerClGroup.addLayer(layer); // clgroup is already added to the map
                markerEditMode(marker, true);

                marker.editFeature = makeEditFeature(marker.feature);
                marker.openPopup();
                if (debug) console.log("layer", layer);
                if (debug) console.log("markerLayer", markerLayer);
                if (debug) console.log("markerClGroup", markerClGroup);
                if (debug) console.log("marker", marker);
            }
        }
    });



    function makePopupContent(feature) {
        if (debug) console.log("makepopup content from feature", feature);

        const select = `
            <select id="audio-selection">
            ${feature.properties.audio ? feature.properties.audio.map(audio => `<option>${audio.name}</option>`) : ""}
            </select>
            `;

        const videoElements = makeVideoPart(feature.properties.video);
        const fileElements = makeFilesPart(feature.properties.files);


        var content = '<div class="tabs" id="content" style="height:' + `${feature.popupHeight ? feature.popupHeight : "400"}` + 'px">' +

            '<div class="tab" id="tab-1">' +
            '<div class="content" id="tab1-content">' +

            '<div id="audioPart" style="display: ' + `${feature.properties.audio ? "block" : "none"}` + '">' +
            '<audio  id="audio" src="" controls controlsList="nodownload"> </audio>' +
            '</br>' +
            '<b>Select Audiofile: </b> ' + select +
            '</div>' +

            '<input id="file-item" type="file" style="display: none" accept="audio/*" multiple></input>' +

            '<div id="descriptionPart" style="display: none"><b>Description: </b></br>' + '<textarea id="description" class="input-element" readonly >' + `${feature.properties.description ? feature.properties.description : ""}` + '</textarea></div>' +

            '<div id="equipmentPart" style="display: none"> <b>Equipment used: </b> <input id="equipment" class="input-element" type="text" readonly value=' + `${feature.properties.equipment ? `"${feature.properties.equipment}"` : ""}` + '>' + '</input></div>' +

            '<div id="dateTimePart" style="display: none"> <b>Date: </b> <input id="date" readonly class="input-element" type="date"  value=' + `${feature.properties.date ? `"${feature.properties.date}"` : ""}` + '>' + '</input>' +
            '<b>Time: </b> <input id="time" class="input-element" type="time"  readonly value=' + `${feature.properties.time ? `"${feature.properties.time}"` : ""}` + '>' + '</input></div>' +

            '<div id="locationPart" style="display: none"> <b>Location: </b> <input id="location" class="input-element" type="text"  readonly  value=' + `${feature.properties.location ? `"${feature.properties.location}"` : ""}` + '></input></div>' +

            '<div><b>Latitude: </b> <input id="latitude" class="input-element" type="number" readonly value=' + feature.geometry.coordinates[1] + '>' + '</input>' +
            '</br> <b>  Longitude: </b> <input id="longitude" class="input-element" type="number" readonly value=' + feature.geometry.coordinates[0] + '></input></div>' +

            '<div id="authorPart" style="display: none"> <b>Author: </b> <input id="author" class="input-element" type="text"  readonly  value=' + `${feature.properties.author ? `"${feature.properties.author}"` : ""}` + '></input></div>' +

            '</div>' +
            '</div>' +



            '<div class="tab" id="tab-2">' +
            '<div class="content" id="tab2-content">' +

            '<input id="video-file-item" type="file" style="display: none" accept="video/*, image/*" multiple></input>' +
            '<div id="videoPart" style="display: ' + `${feature.properties.video ? "block" : "none"}` + '">' +
            videoElements +
            '</div>' +

            '</div>' +
            '</div>' +



            '<div class="tab" id="tab-3">' +
            '<div class="content" id="tab3-content">' +
            '<input id="files-file-item" type="file" style="display: none" accept=".doc, .docx, .pdf, .odt, .rtf, .txt, .xlsx, .xls" multiple></input></br>' +
            '<div id="filesPart" style="display: ' + `${feature.properties.files ? "block" : "none"}` + '">' +
            fileElements + '</div>' +
            '</div>' +
            '</div>' +



            '<div id="popheader">' +
            '<input id="title" class="input-element" type="text" readonly autocomplete="off" style="font-weight: bold;" placeholder="Title" value=' + `${feature.properties.title ? `"${feature.properties.title}"` : ""}` + '></input>' +
            '<ul class="tabs-link">' +
            '<li class="tab-link"> <a id="tab1-link" href="#tab-1" style="color:white">Main</a></li>' +
            '<li class="tab-link"> <a id="tab2-link" href="#tab-2" style="color:white">Pics</a></li>' +
            '<li class="tab-link"> <a id="tab3-link" href="#tab-3" style="color:white">Other</a></li>' +
            '</ul>' +
            '</div>' +


            '</div>';



        return content;
    }

    function makeVideoPart(videos) {
        let videoElements = "";
        if (typeof videos != "undefined") {
            for (let i = 0; i < videos.length; i++) {
                const videoElement = `${videos[i].type.startsWith("video") ? `<video src="${videos[i].url}" width="100%"  controls></video>` : `<image src="${videos[i].url}" width="100%" ></image>`}`;
                const inputElement = `<input class="input-element" style="width:100%" type="text" readonly value= ${videos[i].text ? `"${videos[i].text}"` : ""} ></input>`;
                videoElements += '<div class="videoContainer" style="position:relative">' + videoElement + '<i class="far fa-window-close fa-2x close-icon" style="display:none"></i>' + inputElement + '</br></br></div>';
            }
        }
        return videoElements;
    }

    // function makeVideoPart(video) {
    //     let videos = "";
    //     if (typeof video != "undefined") {
    //         videos = `${video.map(video =>  `${video.type.startsWith("video") ? `<video src="${video.url}" width="100%"  controls></video>` : `<image src="${video.url}" width="100%" ></image>`}<input class="input-element" style="width:100%" type="text" readonly value= ${video.text ? `"${video.text}"` : ""} ></input>`)}`;
    //     }
    //     return videos;
    // }

    function makeFilesPart(files) {
        let fileElements = "";
        if (typeof files != "undefined") {
            for (let i = 0; i < files.length; i++) {
                fileElements += '<a  target="_blank" rel="noopener noreferrer" href="' + files[i].url + '">' + files[i].name + '</a>';
            }
        }
        return fileElements;
    }


}