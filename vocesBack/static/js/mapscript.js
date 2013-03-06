// TODO: Probar el metodo de hacer layers y anyadir ahi los circulos, con el volumen de circulos esperado
// Para ver si ha desaparecido el bug del quitar una layer (lentisimo en android) y se puede quitar
// lo de mapa de usar y tirar
var replyAccount = "@vote_outliers";
var c_category10 = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
];
var c_category20 = [
    "#1f77b4", "#aec7e8",
    "#ff7f0e", "#ffbb78",
    "#2ca02c", "#98df8a",
    "#d62728", "#ff9896",
    "#9467bd", "#c5b0d5",
    "#8c564b", "#c49c94",
    "#e377c2", "#f7b6d2",
    "#7f7f7f", "#c7c7c7",
    "#bcbd22", "#dbdb8d",
    "#17becf", "#9edae5"
];
var c_category20b = [
    "#393b79", "#5254a3", "#6b6ecf", "#9c9ede",
    "#637939", "#8ca252", "#b5cf6b", "#cedb9c",
    "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94",
    "#843c39", "#ad494a", "#d6616b", "#e7969c",
    "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"
];
var c_category20c = [
    "#3182bd", "#6baed6", "#9ecae1", "#c6dbef",
    "#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2",
    "#31a354", "#74c476", "#a1d99b", "#c7e9c0",
    "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb",
    "#636363", "#969696", "#bdbdbd", "#d9d9d9"
];
var hashtagMap = {};
var hashtagCount = {};
var CIRCLE_SIZE = 30;
var locLatLng;
var callDetail = false;
var callNode = null;
var voicesIcon = L.icon({
    iconUrl: 'static/imgs/voices-marker.png',
    iconRetinaUrl: 'static/imgs/voices-marker@2x.png',
    iconSize: [36, 37],
    iconAnchor: [17, 35],
    popupAnchor: [-3, -42],
    shadowUrl: 'static/imgs/voices-marker-shadow.png',
    shadowRetinaUrl: 'static/imgs/voices-marker-shadow@2x.png',
    shadowSize: [42, 43],
    shadowAnchor: [17, 35]
});
var map;
$(document).ready(function()
{
    function menuHome()
    {
        console.log("home");
        map.setView(locLatLng,18);
        return false;
    }
    function menuHash()
    {
        console.log(hashtagCount);
        console.log(hashtagMap);
        console.log(c_category10);
        myHtml="";
        myHtml+="Trending Topics<br>";
        for (var ht in hashtagCount)
        {
            myHtml+='<span style="color:'+c_category10[hashtagMap[ht]]+';">'+ht+':'+hashtagCount[ht]+'</span><br>';
        }
        putInfo(myHtml);
        return false;
    }
    //BEGIN Make call
    function menuConvoca() {
        var callSymbol = '%C2%A1';
        if( /Android/i.test(navigator.userAgent) ) {
            location = "https://twitter.com/intent/tweet?text="+replyAccount+"%20"+callSymbol+"%20";
        }
        else
        {
            if( /iPad/i.test(navigator.userAgent) ) {
                location = "twitter://post?message="+replyAccount+"%20"+callSymbol+"%20";
            }
            else
            {
                if( /iPhone/i.test(navigator.userAgent) ) {
                    location = "twitter://post?message="+replyAccount+"%20"+callSymbol+"%20";
                }
                else
                {
                    location = "https://twitter.com/intent/tweet?text="+replyAccount+"%20"+callSymbol+"%20";
                }
            }
        }
        console.log("¡");
        return false;
    }
    //END Make call
    function menuAt()
    {
        if( /Android/i.test(navigator.userAgent) ) {
            //window.open("https://twitter.com/intent/tweet?text="+replyAccount+"%20");
            location = "https://twitter.com/intent/tweet?text="+replyAccount+"%20";
        }
        else
        {
            if( /iPad/i.test(navigator.userAgent) ) {
//                window.open("twitter://post?message="+replyAccount+" ");
                location = "twitter://post?message="+replyAccount+"%20";
            }
            else
            {
                if( /iPhone/i.test(navigator.userAgent) ) {
                    location = "twitter://post?message="+replyAccount+"%20";
                }
                else
                {
                    location = "https://twitter.com/intent/tweet?text="+replyAccount+"%20";
                }
            }
        }
        console.log("at");
        return false;
    }

    function extendInfobox()
    {
        $('#infobox').css("height","300px");
    }
    function contractInfobox()
    {
        $('#infobox').css("height","50px");
        $('#infoextra').html("");
        return false;
    }

    function putInfo(html)
    {
        extendInfobox();
        html+='<a id="close" href="#">Cerrar</a>';
        $('#infoextra').html(html);
        $('#close').on("click",function(){contractInfobox();});

    }

//alex
    function check(tweetId,htmlText)
    {
        var data = [
            tweetId,
            navigator.userAgent,
            [ screen.height, screen.width, screen.colorDepth ].join("x"),
              ( new Date() ).getTimezoneOffset(),
              !!window.sessionStorage,
              !!window.localStorage,
              $.map( navigator.plugins, function(p) {
                   return [
                         p.name,
                         p.description,
                         $.map( p, function(mt) {
                           return [ mt.type, mt.suffixes ].join("~");
                         }).join(",")
                     ].join("::");
                 }).join(";")
            ].join("###");
        var fingerprint = md5( data )
        console.log("fingerprintCH");
        console.log(fingerprint);
        //$.ajax( 'alreadyChecked/'+tweetId+'/'+fingerprint );
        var checkedUrl = 'alreadyChecked/'+fingerprint;
        $.getJSON(checkedUrl,function(d){console.log("already");console.log(d['code']);fillInfo(tweetId,htmlText,d['code'])});
        return true;
    }

    function fillInfo(tweetId,htmlText,ok)
    {
        if(ok == 'KO'){
            htmlText+='<input type="button" id="check" tweetId="'+tweetId+'" />';
        }
        putInfo(htmlText);
        $("#check").on("click",function(e)
                    {
                        console.log("ID");
                        console.log(this.getAttribute("tweetId"));
                        var data = [
                            this.getAttribute("tweetId"),
                            navigator.userAgent,
                            [ screen.height, screen.width, screen.colorDepth ].join("x"),
                            ( new Date() ).getTimezoneOffset(),
                            !!window.sessionStorage,
                            !!window.localStorage,
                            $.map( navigator.plugins, function(p) {
                              return [
                                p.name,
                                p.description,
                                $.map( p, function(mt) {
                                  return [ mt.type, mt.suffixes ].join("~");
                                }).join(",")
                              ].join("::");
                            }).join(";")
                          ].join("###");
                          var fingerprint = md5( data )
                          console.log(fingerprint);
                          $.ajax( {url:'check/'+this.getAttribute("tweetId")+'/'+fingerprint,
                            success:function(d,statusText,xkk){if(d['code']=='OK'){$("#check").css('display', 'none')};$("#checkinsCount").html('CheckIns count: '+d['count']);}}
                          );
                    });
    }
    //BEGIN Retrieve calls in map.
    function getCalls(){
        var myLatLng = map.getCenter();
        var myBounds = map.getBounds();
        var myZoom = map.getZoom();
        $("#map").remove();
        $("body").append('<div id="map"></div>');
        map = L.map('map',{touchZoom:true}).setView(myLatLng, myZoom);
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
        map.on('moveend',loadCalls);
        map.on('zoomend',loadCalls);
        map.on('dragend',loadCalls);
        L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/88572/256/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
        }).addTo(map);
        L.marker(locLatLng).addTo(map);
        var lat = myLatLng.lat;
        var lng = myLatLng.lng;
        var bounds = myBounds;
        var lat_1 = bounds.getSouthWest().lat / 180 * Math.PI;
        var lat_2 = bounds.getSouthEast().lat / 180 * Math.PI;
        var long_1 = bounds.getSouthWest().lng / 180 * Math.PI;
        var long_2 = bounds.getSouthEast().lng / 180 * Math.PI;
        var radius = Math.acos(Math.sin(lat_1) * Math.sin(lat_2) + Math.cos(lat_1) * Math.cos(lat_2) * Math.cos(long_2-long_1)) * 6378.137;
        var myUrl = "getCallsInRadius/"+lat+"/"+lng+"/"+radius+"/";
        console.log('URL: ' + myUrl);
        $.getJSON(myUrl, function(data){
            var calls = data.calls;
            for(var i=0;i<calls.length;i++)
            {
                var call = calls[i];
                var callMarker = L.marker([call.lat, call.lng], {icon: voicesIcon});
                callMarker.bindPopup("Cargando....................................................");
                callMarker.__data__= call;
                callMarker.on('click',callClick);
                //callMarker.addTo(map);
                callMarker.addTo(map);
            }
        }).complete(function() {console.log("Carga completada...");});
    }
    //END Retrieve calls in map.
    //BEGIN Get call information.
    function callClick(e) {
        console.log("Call clicked!")
        var call = e.target._popup._source.__data__;
        var callId = call.id;
        callNode = call;
        e.target.closePopup();
        var myUrl="getPointDetail/"+callId;
        $.getJSON(myUrl, function(data){
            console.log(data);
            var myHtml = '<div class="tweet">';
            myHtml+='<div class="meta">';
            myHtml+='<span class="date">'+moment(data.stamp,"YYYYMMDDHHmmss").format("MMM Do YYYY HH:mm:ss")+"</span><br />";
            myHtml+='<span class="author">@'+data.userNick+"</span><br />";
            myHtml+='<span id="checkinsCount">CheckIns count: '+data.relevanceFirst+'</span>';
            myHtml+='<img class="picture" src="'+data.userImg+'"><br>';
            myHtml+='</div>';
            myHtml+='<span class="tweet">'+data.text+"</span><br />";
            myHtml+='<span class="ht">'+data.hashTag+"</span><br /><br />";
            myHtml+='<a id="focusButton" href="#">Focus on this</a><br /><br />';
            myHtml+='</div>';
            //alex :D
            check(callId,myHtml);
            $("#focusButton").on("click", getCallCheckins);
            $("#check").on("click",function(e){
                console.log("ID");
                console.log(this.getAttribute("tweetId"));
                var data = [
                    this.getAttribute("tweetId"),
                    navigator.userAgent,
                    [ screen.height, screen.width, screen.colorDepth ].join("x"),
                    ( new Date() ).getTimezoneOffset(),
                    !!window.sessionStorage,
                    !!window.localStorage,
                    $.map( navigator.plugins, function(p) {
                        return [
                            p.name,
                            p.description,
                            $.map( p, function(mt) {
                                return [ mt.type, mt.suffixes ].join("~");
                            }).join(",")
                        ].join("::");
                    }).join(";")
                ].join("###");
                var fingerprint = md5( data );
                console.log(fingerprint);
                $.ajax( 'check/'+this.getAttribute("tweetId")+'/'+fingerprint );
            });
        });
    }
    //END Get call information.
    //BEGIN Expand call checkins.
    function getCallCheckins(){
        console.log("Get call checkins!!!");
        var myLatLng = map.getCenter();
        var myZoom = map.getZoom();
        $("#map").remove();
        $("body").append('<div id="map"></div>');
        map = L.map('map',{touchZoom:true}).setView(myLatLng, myZoom);
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
        map.on('moveend',loadCalls);
        map.on('zoomend',loadCalls);
        map.on('dragend',loadCalls);
        L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/88572/256/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
        }).addTo(map);
        callsLayer = L.layerGroup([])
            .addTo(map);
        tweetsLayer = L.layerGroup([])
            .addTo(map);
        L.marker(locLatLng).addTo(map);
        //var call = e.target._popup._source.__data__;
        call = callNode;
        console.log("Antes");
        console.log(call);
        console.log("Despues");
        callsLayer.clearLayers();
        tweetsLayer.clearLayers();
        //Paint call.
        var callId = call.id;
        var callMarker = L.marker([call.lat, call.lng], {icon: voicesIcon});
        callMarker.bindPopup("Cargando....................................................");
        callMarker.__data__= call;
        callMarker.on('click',callClick);
        callMarker.addTo(map);;
        var myUrl = "getCallCheckins/"+callId+"/";
        console.log('URL: ' + myUrl);
        $.getJSON(myUrl, function(data){
            console.log(data);
            var callTweets = data.tweets;
            console.log(callTweets);
            for(var i=0;i<callTweets.length;i++)
            {
                var tweet = callTweets[i];
                var circle = L.circle([tweet.lat,tweet.lng],CIRCLE_SIZE,{
                    color:"black",
                    weight:1,
                    stroke:true,
                    //fillColor: c_category10[hashtagMap[tweet.hashTag]],
                    fillColor: "black",
                    fillOpacity: 1.0,
                    opacity: 1.0
                });
                circle.bindPopup("Cargando....................................................");
                circle.__data__= tweet.id;
                circle.on('click',tweetClick);
                circle.addTo(map);
            }
        }).complete(function() {console.log("Carga completada...");});
        callDetail = true;
    }
    //END Expand call checkins.
    //BEGIN Load calls on map.
    function loadCalls() {
        if (callDetail) {
            if (callNode != null) {getCallCheckins(callNode);}
            else {getCalls();}
        } else {getCalls();}
    }
    //END Load calls on map.
    //BEGIN Show calls.
    function menuShowCalls() {
        callDetail = false;
        callNode = null;
        loadCalls();
    }
    //END Show calls.
    function fillInfobox()
    {
        var myHtml="";
        myHtml = '<a id="home" href="#">Home</a> | <a id="tag" href="#">#</a> | <a id="call" href="#">¡</a> | <a id="resetCalls" href="#">Reset</a>';
        $('#infomenu').html(myHtml);
        $('#home').on("click",menuHome);
        $('#tag').on("click",menuHash);
        $('#call').on("click", menuConvoca);
        $('#resetCalls').on('click', menuShowCalls);
        //$('#at').on("click",menuAt);
    }
    function tweetClick(e)
    {
        var tweetId = e.target._popup._source.__data__;
        e.target.closePopup();
        var myUrl="getPointDetail/"+tweetId;
        $.getJSON(myUrl, function(data){
            console.log(data);
            var myHtml = '<div class="tweet">';
            myHtml+='<div class="meta">';
            myHtml+='<span class="date">'+moment(data.stamp,"YYYYMMDDHHmmss").format("MMM Do YYYY HH:mm:ss")+"</span><br>";
            myHtml+='<span class="author">@'+data.userNick+"</span><br />";
            myHtml+='<img class="picture" src="'+data.userImg+'"><br>';
            myHtml+='</div>';
            myHtml+=data.text+"<br>";
            myHtml+=data.hashTag+"<br>";
            myHtml+='<img width="100" height="100" src="'+data.media+'"><br>';
            myHtml+='</div>';
        });
    }
	function onLocationError(e) {
        alert(e.message);
	}
	function onLocationFound(e)
	{
        console.log("Location found...");
        locLatLng = e.latlng;
        loadCalls();
    }
    var L_PREFER_CANVAS=true;
    map = L.map('map',{touchZoom:true}).locate({setView:true,maxZoom:18,enableHighAccuracy:true});
    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/88572/256/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
    }).addTo(map);
    fillInfobox();
    var refreshId = setInterval(function()
    {
        loadCalls();
    }, 60000);
});



