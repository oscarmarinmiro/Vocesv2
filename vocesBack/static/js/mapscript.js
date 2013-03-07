// TODO: Probar el metodo de hacer layers y anyadir ahi los circulos, con el volumen de circulos esperado
// Para ver si ha desaparecido el bug del quitar una layer (lentisimo en android) y se puede quitar
// lo de mapa de usar y tirar
var replyAccount='@vote_outliers';
var c_category10=[
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
];
var hashtagMap={};
var hashtagCount={};
var CIRCLE_SIZE=30;
var locLatLng;
var calls;
var checkins;
var callNode=null;
//Icons
var defaultIcon = L.icon({
    iconUrl: 'static/imgs/markers/call-marker.png',
    iconSize: [36, 36],
    iconAnchor: [17, 34],
    popupAnchor: [-3, -42]
});
var scaleIcons = [
    L.icon({
        iconUrl: 'static/imgs/markers/call-marker-0.png',
        iconSize: [37, 36],
        iconAnchor: [17, 34],
        popupAnchor: [-3, -42]}),
    L.icon({
        iconUrl: 'static/imgs/markers/call-marker-1.png',
        iconSize: [37, 36],
        iconAnchor: [17, 34],
        popupAnchor: [-3, -42]}),
    L.icon({
        iconUrl: 'static/imgs/markers/call-marker-2.png',
        iconSize: [37, 36],
        iconAnchor: [17, 34],
        popupAnchor: [-3, -42]}),
    L.icon({
        iconUrl: 'static/imgs/markers/call-marker-3.png',
        iconSize: [37, 36],
        iconAnchor: [17, 34],
        popupAnchor: [-3, -42]}),
    L.icon({
        iconUrl: 'static/imgs/markers/call-marker-4.png',
        iconSize: [37, 36],
        iconAnchor: [17, 34],
        popupAnchor: [-3, -42]})
];
var map;
$(document).ready(function(){
    var decideIcon=function(level){
        console.log('At decideIcon');
        if(level>100){return scaleIcons[4];}
        else if(level<=100 && level>75){return scaleIcons[3];}
        else if(level<=75 && level>50){return scaleIcons[2];}
        else if(level<=50 && level>25){return scaleIcons[1];}
        else{return scaleIcons[0];}
    };
    var check=function(tweetId,htmlText){
        console.log('At check');
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
        var checkedUrl = 'alreadyChecked/'+fingerprint;
        $.getJSON(checkedUrl,function(d){console.log("already");console.log(d['code']);fillInfo(tweetId,htmlText,d['code'])});
        return true;
    };
    var fillInfo=function(tweetId,htmlText,ok){
        console.log('At fillInfo');
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
            $.ajax({url:'check/'+this.getAttribute("tweetId")+'/'+fingerprint,
                    success:function(d,statusText,xkk){if(d['code']=='OK'){$("#check").css('display', 'none')};$("#checkinsCount").html('CheckIns count: '+d['count']);}});
        });
    }
    //Data retrieval functions.
    var retrieveCalls=function(){
        console.log('At retrieveCalls');
        var url='getCalls/';
        console.log('URL: '+url);
        $.getJSON(url,function(data){calls = data.calls;}).complete(function(){console.log('Carga completada...' );});
        return true;
    };
    var updateData=function(){
        console.log('At updateCalls');
        calls=retrieveCalls();
        if(callNode!=null){retrieveCallCheckins(callNode.id);}
    };
    var retrieveCallCheckins=function(id){
        console.log('At retrieveCallCheckins');
        var url='getCallCheckins/'+id+'/';
        console.log('URL: '+ url);
        $.getJSON(url,function(data){checkins=data;console.log(checkins);}).complete(function(){console.log('Carga completada...');});
        console.log(checkins);
        return true;
    };
    //Display functions.
    function openInfobox(){
        console.log('At openInfobox');
        $('#infobox').css('height','300px');
    };
    function closeInfobox(){
        console.log('At closeInfobox');
        $('#infoextra').html("");
        $('#infobox').css('height','50px');
    };
    var display = function(html){
        console.log('At display');
        openInfobox();
        html+='<br /><a id="close" href="#">Cerrar</a>';
        $('#infoextra').html(html);
        $('#close').on('click',function(){closeInfobox();});
    };
    var callInfo = function(){
        console.log('At callInfo');
        callId=callNode.id;
        var url="getPointDetail/"+callId;
        $.getJSON(url, function(data){
            var html = '<div class="tweet">';
            html+='<div class="meta">';
            html+='<span class="date">'+moment(data.stamp,"YYYYMMDDHHmmss").format("MMM Do YYYY HH:mm:ss")+"</span><br />";
            html+='<span class="author">@'+data.userNick+"</span><br />";
            html+='<span id="checkinsCount">CheckIns count: '+data.relevanceFirst+'</span>';
            html+='<img class="picture" src="'+data.userImg+'"><br>';
            html+='</div>';
            html+='<span class="tweet">'+data.text+"</span><br />";
            html+='<span class="ht">'+data.hashTag+"</span><br /><br />";
            html+='</div>';
            //alex :D
            check(callId,html);
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
            display(html);
        });
    };
    var replyInfo = function(id){
        console.log('At replyInfo');
        var url="getPointDetail/"+id;
        $.getJSON(url, function(data){
            var html = '<div class="tweet">';
            html+='<div class="meta">';
            html+='<span class="date">'+moment(data.stamp,"YYYYMMDDHHmmss").format("MMM Do YYYY HH:mm:ss")+"</span><br />";
            html+='<span class="author">@'+data.userNick+"</span><br />";
            html+='<img class="picture" src="'+data.userImg+'"><br>';
            html+='</div>';
            html+='<span class="tweet">'+data.text+"</span><br />";
            html+='<span class="ht">'+data.hashTag+"</span><br /><br />";
            html+='</div>';
            display(html);
        });
    };
    var paintMap = function(){
        console.log('At paintMap');
        var myLatLng = map.getCenter();
        var myZoom = map.getZoom();
        $("#map").remove();
        $("body").append('<div id="map"></div>');
        map = L.map('map',{touchZoom:true}).setView(myLatLng, myZoom);
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
        map.on('moveend',updateMap);
        map.on('zoomend',updateMap);
        map.on('dragend',updateMap);
        L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/88572/256/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
        }).addTo(map);
    };
    var paintUserPosition=function(){
        console.log('At paintUserPosition');
        L.marker(locLatLng).addTo(map);
    };
    var paintCalls=function(){
        console.log('At paintCalls');
        for(var i=0;i<calls.length;i++)
        {
            var call = calls[i];
            var marker;
            if(call == callNode){
                marker = L.marker([call.lat, call.lng], {icon: decideIcon(call.votes)});
            }else{
                marker = L.marker([call.lat, call.lng], {icon: defaultIcon});
            }
            marker.__data__= call;
            marker.bindPopup("Cargando");
            marker.on('click',callSelected);
            marker.addTo(map);
        }
    };
    var paintCallReplies=function(){
        console.log('At paintCallReplies');
        console.log(checkins);
        for(var i=0;i<checkins.tweets.length;i++){
            var tweet=checkins.tweets[i];
            var circle=L.circle([tweet.lat,tweet.lng],CIRCLE_SIZE,{
                color:"black",
                weight:1,
                stroke:true,
                fillColor: "black",
                fillOpacity: 1.0,
                opacity: 1.0
            });
            circle.__data__= tweet.id;
            circle.bindPopup("Cargando");
            circle.on('click',replySelected);
            circle.addTo(map);
        }
    };
    //Item selected functions.
    var callSelected=function(e){
        console.log('At callSelected');
        if(callNode!=e.target._popup._source.__data__){
            callNode=e.target._popup._source.__data__;
            $.when(retrieveCallCheckins(callNode.id)).then(updateMap);
        }else{updateMap();}
        callInfo();
    };
    var replySelected=function(e){
        console.log('At replySelected');
        replyInfo(e.target._popup._source.__data__);
    };
    //Menu functions.
    var menuHome=function(){
        map.setView(locLatLng,18);
    };
    var menuHash=function(){
        console.log('At menuHash');
        console.log(c_category10);
        html="";
        html+="Trending Topics<br>";
        for (var ht in hashtagCount){html+='<span style="color:'+c_category10[hashtagMap[ht]]+';">'+ht+':'+hashtagCount[ht]+'</span><br>';}
        display(html);
    }
    var menuCall=function(){
        console.log('At menuCall');
        var callSymbol = '%C2%A1';
        if(/Android/i.test(navigator.userAgent)){location = "https://twitter.com/intent/tweet?text="+replyAccount+"%20"+callSymbol+"%20";}
        else{
            if(/iPad/i.test(navigator.userAgent)){location = "twitter://post?message="+replyAccount+"%20"+callSymbol+"%20";}
            else{
                if(/iPhone/i.test(navigator.userAgent)){location = "twitter://post?message="+replyAccount+"%20"+callSymbol+"%20";}
                else{location = "https://twitter.com/intent/tweet?text="+replyAccount+"%20"+callSymbol+"%20";}
            }
        }
    };
    var menu=function(){
        console.log('At menu');
        var html="";
        html = '<a id="home" href="#">Home</a> | <a id="tag" href="#">#</a> | <a id="call" href="#">¡</a>';
        $('#infomenu').html(html);
        $('#home').on("click",menuHome);
        $('#tag').on("click",menuHash);
        $('#call').on("click", menuCall);
    };
    //Map events handlers.
    var onLocationError=function(e){console.log('At onLocationError');alert(e.message);};
    var onLocationFound=function(e){
        console.log('At onLocationFound');
        console.log("Location found...");
        locLatLng = e.latlng;
        $.when(updateData()).then(updateMap);
    };
    var updateMap=function(){
        console.log('At updateMap');
        paintMap();
        paintUserPosition();
        paintCalls();
        if(callNode!=null){paintCallReplies();}
    };
    //First time run.
    var L_PREFER_CANVAS=true;
    map = L.map('map',{touchZoom:true}).locate({setView:true,maxZoom:18,enableHighAccuracy:true});
    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/88572/256/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
    }).addTo(map);
    menu();
    var refresher = setInterval(function(){updateData();},60000);
});



