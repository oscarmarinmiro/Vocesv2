// TODO: Probar el metodo de hacer layers y anyadir ahi los circulos, con el volumen de circulos esperado
// Para ver si ha desaparecido el bug del quitar una layer (lentisimo en android) y se puede quitar
// lo de mapa de usar y tirar


var replyAccount='@vote_outliers';


var htFilter = "__all__";

var hashtagCount={};
var CIRCLE_SIZE=30;
var locLatLng;
var calls;
var checkins;
var callNode=null;
var callsLayerGroup;
var checkinsLayerGroup;



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

    // Helper function to link twitter entities

    var normalizeTweet = function(text)
    {
        return URI.withinString(text, function(url) {
            return "<a href='"+url+"' target='_blank'>" + url + "</a>";
        });
    }

    // Function that returns a Leaflet icon depending on a metric [0-100]

    var decideIcon=function(level){
        console.log('At decideIcon');
        if(level>100){return scaleIcons[4];}
        else if(level<=100 && level>75){return scaleIcons[3];}
        else if(level<=75 && level>50){return scaleIcons[2];}
        else if(level<=50 && level>25){return scaleIcons[1];}
        else{return scaleIcons[0];}
    };


    var mapMe=function(){
        console.log('At mapMe');
        if(/Android/i.test(navigator.userAgent)){location = 'twitter://post?in_reply_to_status_id='+callNode.id+'&messageg='+replyAccount+'%20';}
        else{
            if(/iPad/i.test(navigator.userAgent)){location = 'twitter://post?in_reply_to_status_id='+callNode.id+'&message='+replyAccount+'%20';}
            else{
                if(/iPhone/i.test(navigator.userAgent)){location = 'twitter://post?in_reply_to_status_id='+callNode.id+'&message='+replyAccount+'%20';}
                else{location = 'https://twitter.com/intent/tweet?in_reply_to_status_id='+callNode.id+'&text='+replyAccount+'%20';}
            }
        }
    };
    var checkinMe=function(){
        var checkinSymbol='*';
        console.log('At checkinMe');
        if(/Android/i.test(navigator.userAgent)){location = 'twitter://post?in_reply_to_status_id='+callNode.id+'&messageg='+replyAccount+'%20'+checkinSymbol+'%20';}
        else{
            if(/iPad/i.test(navigator.userAgent)){location = 'twitter://post?in_reply_to_status_id='+callNode.id+'&message='+replyAccount+'%20'+checkinSymbol+'%20';}
            else{
                if(/iPhone/i.test(navigator.userAgent)){location = 'twitter://post?in_reply_to_status_id='+callNode.id+'&message='+replyAccount+'%20'+checkinSymbol+'%20';}
                else{location = 'https://twitter.com/intent/tweet?in_reply_to_status_id='+callNode.id+'&text='+replyAccount+'%20'+checkinSymbol+'%20';}
            }
        }
    }

    //Data retrieval functions.
    // OJO (OSCAR): He mezclado aqui el retrieveCalls y retrieveCallCheckings desde el updateData porque las dos
    // son asincronas, para crear una sola rama de paintMap en cada caso
    var retrieveCalls=function(){
        console.log('At retrieveCalls');
        var url='getCalls/';
        console.log('URL: '+url);
        $.getJSON(url,function(data){
            calls = data.calls;
            hashtagCount = data.hts;
            hashtagCount.push({'ht':"__all__"});
            }).complete(function()
                    {
                        if(callNode!=null){
                                var url='getCallCheckins/'+callNode.id+'/';
                                console.log('URL: '+ url);
                                $.getJSON(url,function(data){
                                    checkins=data;console.log(checkins);
                                    }).complete(function(){console.log('Carga completada...');paintMap();});
                                }
                        else
                        {
                        console.log('Carga completada...' );
                        paintMap();
                        }
                    });
        return true;
    };
    var updateData=function(){
        console.log('At updateCalls');
        calls=retrieveCalls();

    };
    var retrieveCallCheckins=function(id){
        console.log('At retrieveCallCheckins');
        var url='getCallCheckins/'+id+'/';
        console.log('URL: '+ url);
        $.getJSON(url,function(data){checkins=data;console.log(checkins);}).complete(function(){console.log('Carga completada...');paintMap();});
    };
    //Display functions.
    function openInfobox(height){
        console.log('At openInfobox');
        //$('#infobox').css('height',height);
    };
    function closeInfobox(){
        console.log('At closeInfobox');
        $('#infoextra').html("");
        //$('#infobox').css('height','50px');
    };
    var display = function(html,height){
        console.log('At display');
        openInfobox(height+"px");
        html+='<br /><div id="close" class="close" href="#">Cerrar</div>';
        $('#infoextra').html(html);
        $('#close').on('click',function(){closeInfobox();});
    };
    var callInfo = function(){
        console.log('At callInfo');
        callId=callNode.id;
        var url="getPointDetail/"+callId;
        var data = null;
        $.getJSON(url, function(datos){
            data = datos;
        }).complete(function(){
                var html = '<div class="tweet">';
                html+='<div class="birddate"><img src="static/imgs/bird_blue_16.png">';
                html+='<span class="date">'+moment(data.stamp,"YYYYMMDDHHmmss").format("DD.MM.YYYY HH:mm:ss")+"</span></div>";
                html+='<div><img class="picture" src="'+data.userImg+'"></div>';
                html+='<div class="author" target="_blank">'+data.userName+"</div>";
                html+='<div class="nick"><a href="https://www.twitter.com/'+data.userNick+'">@'+data.userNick+'</a></div>';
                //            html+='<span id="checkinsCount">CheckIns count: '+data.relevanceFirst+'</span>';
                html+='<div class="tweetText">'+normalizeTweet(data.text)+"</div>";
                if(data.media!=null)
                {
                    html+='<a href="http://twitter.com/'+data.userNick+"/status/"+data.userId+"/photo/1"+' target="_blank">';
                    html+='<img src="'+data.media+'"></a>';
                }
                html+='<div class="hton">Tag:'+data.hashTag+"</div>";
                html+='<div class="checkin" id="checkin">Checkin</div><div class="mapping" id="mapea">Mapea</div>';
                html+='</div>';
                display(html,430);

                $("#checkin").on("click", checkinMe);
                $("#mapea").on("click", mapMe);

            });
    };
    var replyInfo = function(id){
        console.log('At replyInfo');
        var url="getPointDetail/"+id;
        var data = null;
        $.getJSON(url, function(datos){
            data = datos;
        }).complete(function(){
                var html = '<div class="tweet">';
                html+='<div class="birddate"><img src="static/imgs/bird_blue_16.png">';
                html+='<span class="date">'+moment(data.stamp,"YYYYMMDDHHmmss").format("DD.MM.YYYY HH:mm:ss")+"</span></div>";
                html+='<div><img class="picture" src="'+data.userImg+'"></div>';
                html+='<div class="author" target="_blank">'+data.userName+"</div>";
                html+='<div class="nick"><a href="https://www.twitter.com/'+data.userNick+'">@'+data.userNick+'</a></div>';
                //            html+='<span id="checkinsCount">CheckIns count: '+data.relevanceFirst+'</span>';
                html+='<div class="tweetText">'+normalizeTweet(data.text)+"</div>";
                if(data.media!=null)
                {
                    html+='<a href="http://twitter.com/'+data.userNick+"/status/"+data.userId+"/photo/1"+' target="_blank">';
                    html+='<img src="'+data.media+'"></a>';
                }
                html+='<div class="hton">Tag:'+data.hashTag+"</div>";
                html+='<div class="checkin" id="checkin">Checkin</div><div class="mapping" id="mapea">Mapea</div>';
                html+='</div>';

                display(html,430);

            });
    };
    var paintMapFirstTime = function(){
        console.log('At paintMapFirstTime');
        var myLatLng = map.getCenter();
        var myZoom = map.getZoom();
        console.log("¡¡¡¡¡¡¡¡TIRO EL MAPA!!!!!!!!!!!!!!");
        $("#map").remove();
        $("body").append('<div id="map"></div>');
        map = L.map('map',{touchZoom:true}).setView(myLatLng, myZoom);
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
        L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/88572/256/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
        }).addTo(map);
    }
    var paintMap=function(){
        console.log('At paintMap');
        paintMapFirstTime();
        paintUserPosition();
    };
    var paintUserPosition=function(){
        console.log('At paintUserPosition');
        L.marker(locLatLng).setZIndexOffset(-100).addTo(map);
        paintCalls();
    };
    var paintCalls=function(){
        console.log('At paintCalls');

        for(var i=0;i<calls.length;i++){
            var call=calls[i];
            if ((htFilter=='__all__')||(call.hashTag == htFilter))
            {
                var marker;

                console.log(call);
                console.log(callNode);

                if((callNode) && (call.id==callNode.id)){
                    marker=L.marker([call.lat, call.lng], {icon: decideIcon(call.votes)});
                }else{
                    // BUG? NO hay que decidir dependiendo de los votos independientemente de si es la seleccionada o no?
                    marker=L.marker([call.lat, call.lng], {icon: defaultIcon});
                }
                marker.__data__= call;
                marker.bindPopup("Cargando");
                marker.on('click',callSelected);
                map.addLayer(marker);
            }
        }
        if((callNode!=null) && ((htFilter=='__all__')||(callNode.hashTag == htFilter))){paintCallReplies();}
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
            map.addLayer(circle);
        }
    };
    //Item selected functions.
    var callSelected=function(e){
        console.log('At callSelected');
        e.target.closePopup();
        if(callNode==null){
            callNode=e.target._popup._source.__data__;
            retrieveCallCheckins(callNode.id);
            callInfo();
        }else if(callNode.id!=e.target._popup._source.__data__.id){
            callNode=e.target._popup._source.__data__;
            retrieveCallCheckins(callNode.id);
            callInfo();
        }else{
            callNode=null;
            checkins=null;
            paintMap();
            closeInfobox();
        }
    };
    var replySelected=function(e){
        console.log('At replySelected');
        e.target.closePopup();
        replyInfo(e.target._popup._source.__data__);
    };
    //Menu functions.
    var menuHome=function(){
        map.setView(locLatLng,18);
    };
    var menuHash=function(){
        console.log('At menuHash');
        html="";
        html+='<span class="extraHeader">Trending ahora</span>';
        html+='<p class="extraContent">';
        for (var i in hashtagCount)
        {
            var finalName = hashtagCount[i].ht=='__all__' ? 'todos':'#'+hashtagCount[i].ht;
            html+= hashtagCount[i].ht==htFilter ? '<span class="ht hton" htname='+hashtagCount[i].ht+'>'+finalName+'</span><br>':'<span class="ht" htname='+hashtagCount[i].ht+'>'+finalName+'</span><br>';
        }
        html+='</p>';
        display(html,280);
        $('.ht').on("click",function(){$('.ht').removeClass('hton');htFilter = $(this).attr("htname");$(this).attr('htname');$(this).addClass("hton");paintMap();});
    }

    var menuHelp=function(){
        console.log('At menuhelp');
        html="";
        html+='<span class="extraHeader">¿Qué es \'convoca!\'?</span>';
        html+='<p class="extraContent">Convoca es una plataforma para convocar convocatorias convocantes de convocadores para convocados</p>';
        display(html,200);
    }

    var menuCall=function(){
        console.log('At menuCall');
        var callSymbol = '%C2%A1';
        if(/Android/i.test(navigator.userAgent)){location = "twitter://post?message="+replyAccount+"%20"+callSymbol+"%20";}
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
//        html = '<a id="home" href="#"><img src="static/imgs/marker_white.png" width="20" height="30"></a><a id="tag" href="#">#TT</a><a id="call" href="#">¡C!</a>';
        html = '<a id="home" class="infomenu" href="#">H</a><a id="tag" class="infomenu" href="#">#</a><a id="call" href="#" class="infomenu">!</a><a id="help" href="#" class="infomenu">?</a><span class="infomenu">LOGO</span>';
        $('#infomenu').html(html);
        $('#home').on("click",menuHome);
        $('#tag').on("click",menuHash);
        $('#call').on("click", menuCall);
        $('#help').on("click", menuHelp);
    };
    //Map events handlers.
    var onLocationError=function(e){console.log('At onLocationError');alert(e.message);};
    var onLocationFound=function(e){
        console.log('At onLocationFound');
        console.log("Location found...");
        locLatLng = e.latlng;
        paintMapFirstTime();
        updateData();
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