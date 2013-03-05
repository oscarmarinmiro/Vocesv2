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
$(document).ready(function()
{
    //TODO: modificar tamaños :-P
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
    var  L_PREFER_CANVAS=true;
    var map = L.map('map',{touchZoom:true}).locate({setView:true,maxZoom:18,enableHighAccuracy:true});
    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    //L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/997/256/{z}/{x}/{y}.png', {
    L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/88572/256/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
    }).addTo(map);
    var callsLayer = L.layerGroup([])
        .addTo(map);
    var tweetsLayer = L.layerGroup([])
        .addTo(map);
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
        tweetsLayer.clearLayers();
        var lat = map.getCenter().lat;
        var lng = map.getCenter().lng;
        var radius = 1000.0 / map.getZoom(); //Should depend on zoom level.
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
                callMarker.on('mousedown',callClick);
                //callMarker.addTo(map);
                callsLayer.addLayer(callMarker);
            }
        }).complete(function() {console.log("Carga completada...");});
    }
    //END Retrieve calls in map.
    //BEGIN Get call information.
    function callClick(e) {
        var call = e.target._popup._source.__data__;
        var callId = call.id;
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
            myHtml+='<span class="tweet">'+data.text+"</span><br>";
            myHtml+='<span class="ht">'+data.hashTag+"</span><br>";
            myHtml+='<a id="callFocus" href="#">Focus on this</a>';
            myHtml+='<div id="checkinsCount">CheckIns count: '+data.relevanceFirst+'</div>';
            myHtml+='</div>';
            $("#callFocus").on("click", getCallCheckins);
            $("#callFocus").on("mousedowng", getCallCheckins);
            //alex :D
            check(data.tweetId,myHtml);
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
                var fingerprint = md5( data )
                console.log(fingerprint);
                $.ajax( 'check/'+this.getAttribute("tweetId")+'/'+fingerprint );
            });
        });
    }
    //END Get call information.
    //BEGIN Expand call checkins.
    function getCallCheckins(call){
        callNode = call;
        callsLayer.clearLayers();
        //Paint call.
        var callId = call.id;
        var callMarker = L.marker([call.lat, call.lng], {icon: voicesIcon});
        callMarker.bindPopup("Cargando....................................................");
        callMarker.__data__= call;
        callMarker.on('click',getCallCheckins);
        callMarker.on('mousedown',getCallCheckins);
        //circle.addTo(map);
        callsLayer.addLayer(callMarker);
        //callMarker.addTo(map);
        callsLayer.addLayer(callMarker);
        e.target.closePopup();
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
                circle.on('mousedown',tweetClick);
                //circle.addTo(map);
                tweetsLayer.addLayer(circle);
            }
        }).complete(function() {console.log("Carga completada...");});
        callDetail = true;
    }
    //END Expand call checkins.
    function drawMap(){
        console.log("Cargando marcadores...");
        var myZoom = map.getZoom();
        var myLatLng = map.getCenter();
        /*$("#map").remove();
        $("body").append("<div id='map'></div>");
        map = L.map('map',{touchZoom:true}).setView(myLatLng, myZoom);
        //L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/997/256/{z}/{x}/{y}.png', {
        L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/88572/256/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'An idea of <a href="https://twitter.com/_JuanLi">@_juanli</a> y <a href="https://twitter.com/oscarmarinmiro">@oscarmarinmiro</a>. Implemented by <a href="http://www.outliers.es">Outliers Collective </a> and <a href="https://twitter.com/nihilistBird"> @nihilistbird</a> <br>Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
        }).addTo(map);*/
        L.marker(locLatLng).addTo(map);
        /*map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
        map.on('moveend',loadCalls);
        map.on('zoomend',loadCalls);
        map.on('dragend',loadCalls);*/
    }
    //BEGIN Load calls on map.
    function loadCalls() {
        drawMap();
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

    function loadMarkersFirst(){
        console.log("Cargando marcadores...");
        var i;
        var myZoom = map.getZoom();
        var myLatLng = map.getCenter();
        var myBounds = map.getBounds();
        var myUrl="getPointsGeo/"+myBounds.getSouthWest().lat+"/"+myBounds.getSouthWest().lng+"/"+myBounds.getNorthEast().lat+"/"+myBounds.getNorthEast().lng+"/";
        console.log(myUrl);
        $("#map").remove();
        $("body").append("<div id='map'></div>");
////        map = L.map('map',{touchZoom:true}).setView([40.415750595628374, -3.6977791786193848], 14);
        map = L.map('map',{touchZoom:true}).setView(myLatLng, myZoom);
        //L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/997/256/{z}/{x}/{y}.png', {
        L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/88572/256/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'An idea of <a href="https://twitter.com/_JuanLi">@_juanli</a> y <a href="https://twitter.com/oscarmarinmiro">@oscarmarinmiro</a>. Implemented by <a href="http://www.outliers.es">Outliers Collective </a> and <a href="https://twitter.com/nihilistBird"> @nihilistbird</a> <br>Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
        }).addTo(map);
        L.marker(locLatLng).addTo(map);
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
        map.on('moveend',loadMarkersFirst);
        map.on('zoomend',loadMarkersFirst);
        map.on('dragend',loadMarkersFirst);
        $.getJSON(myUrl,
            function(data) {
                var hts = data.tagFacets;
                var index = 0;
                // build a hashtag map in order to apply color scale in circle drawing
                for(var ht in hts)
                {
                    hashtagMap[ht] = index;
                    hashtagCount[ht] = hts[ht];
                    index++;
                }
                console.log(hashtagMap);
                var points = data.points;
                for(var i=0;i<points.length;i++)
                {
                    var point = points[i];
                    var circle = L.circle([point.lat,point.lng],CIRCLE_SIZE,
                        {
                          color:"black",
                          weight:1,
                          stroke:true,
                          fillColor: c_category10[hashtagMap[point.hashTag]],
                          fillOpacity: 1.0,
                          opacity: 1.0
                        });
                    circle.bindPopup("Cargando....................................................");
                    circle.__data__= point.tweetId;
                    circle.on('click',circleClick);
                    circle.on('mousedown',circleClick);
                    circle.addTo(map);
                }
               }).complete(function() {
            console.log("Carga completada...");});

    }
	function onLocationError(e) {
        alert(e.message);
	}
	function onLocationFound(e)
	{
        console.log("Location found...");
        locLatLng = e.latlng;
        //loadMarkersFirst();
        loadCalls();
    }
    fillInfobox();
    var refreshId = setInterval(function()
    {
        //loadMarkersFirst();
        loadCalls();
    }, 60000);
});



