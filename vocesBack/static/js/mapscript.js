// TODO: Probar el metodo de hacer layers y anyadir ahi los circulos, con el volumen de circulos esperado
// Para ver si ha desaparecido el bug del quitar una layer (lentisimo en android) y se puede quitar
// lo de mapa de usar y tirar



var replyAccount='@vote_outliers';

var mapStyle="22677";


var htFilter = "__all__";

var hashtagCount={};
var CIRCLE_SIZE=30;
var locLatLng;
var calls;
var checkins;
var callNode=null;
var firstLocate = true;
var callsLayerGroup;
var checkinsLayerGroup;



//Icons

var markerIcon = L.icon({
    iconUrl: 'static/imgs/markers/new/marker-icon.png',
    shadowUrl: 'static/imgs/markers/new/marker-shadow.png',
    shadowSize:   [50, 64],
    iconSize:     [25, 41], // size of the icon
    iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
    shadowAnchor: [12,64]
    }
);

var defaultIcon = L.icon({
    iconUrl: 'static/imgs/markers/call-marker.png',
    iconSize: [36, 36],
    iconAnchor: [17, 34],
    popupAnchor: [-3, -42]
});
var offIcons = [
    L.icon({
        iconUrl: 'static/imgs/markers/new/marker-0-off.png',
        iconSize: [37, 36],
        iconAnchor: [17, 34],
        popupAnchor: [-3, -42]}),
    L.icon({
        iconUrl: 'static/imgs/markers/new/marker-1-off.png',
        iconSize: [37, 36],
        iconAnchor: [17, 34],
        popupAnchor: [-3, -42]}),
    L.icon({
        iconUrl: 'static/imgs/markers/new/marker-2-off.png',
        iconSize: [37, 36],
        iconAnchor: [17, 34],
        popupAnchor: [-3, -42]}),
    L.icon({
        iconUrl: 'static/imgs/markers/new/marker-3-off.png',
        iconSize: [37, 36],
        iconAnchor: [17, 34],
        popupAnchor: [-3, -42]})

];

var onIcons = [
    L.icon({
        iconUrl: 'static/imgs/markers/new/marker-0-on.png',
        iconSize: [37, 36],
        iconAnchor: [17, 34],
        popupAnchor: [-3, -42]}),
    L.icon({
        iconUrl: 'static/imgs/markers/new/marker-1-on.png',
        iconSize: [37, 36],
        iconAnchor: [17, 34],
        popupAnchor: [-3, -42]}),
    L.icon({
        iconUrl: 'static/imgs/markers/new/marker-2-on.png',
        iconSize: [37, 36],
        iconAnchor: [17, 34],
        popupAnchor: [-3, -42]}),
    L.icon({
        iconUrl: 'static/imgs/markers/new/marker-3-on.png',
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

    var decideIconOff=function(level){
        console.log('At decideIcon');
        if(level>75){return offIcons[3];}
        else if(level<=75 && level>50){return offIcons[2];}
        else if(level<=50 && level>25){return offIcons[1];}
        else{return offIcons[0];}
    };


    var decideIconOn=function(level){
        console.log('At decideIcon');
        if(level>75){return onIcons[0];}
        else if(level<=75 && level>50){return onIcons[0];}
        else if(level<=50 && level>25){return onIcons[0];}
        else{return onIcons[0];}
    };


    var mapMe=function(){
        console.log('At mapMe');
        if(/Android/i.test(navigator.userAgent)){location = 'twitter://post?in_reply_to_status_id='+callNode.id+'&message='+replyAccount+'%20['+callNode.callId+']%20';}
        //if(/Android/i.test(navigator.userAgent)){location = 'https://twitter.com/intent/tweet?text='+replyAccount+'%20['+callNode.callId+']%20';}
        else{
//            310785997703090177
            if(/iPad/i.test(navigator.userAgent)){location = 'twitter://post?in_reply_to_status_id='+callNode.id+'&message='+replyAccount+'%20['+callNode.callId+']%20';}
//            if(/iPad/i.test(navigator.userAgent)){goto = 'twitter://post?in_reply_to_status_id='+callNode.id;alert(goto);location=goto;}
            else{
                if(/iPhone/i.test(navigator.userAgent)){location = 'twitter://post?in_reply_to_status_id='+callNode.id+'&message='+replyAccount+'%20['+callNode.callId+']%20';}
                else{location = 'https://twitter.com/intent/tweet?in_reply_to_status_id='+callNode.id+'&text='+replyAccount+'%20['+callNode.callId+']%20';}
            }
        }
    };
    var checkinMe=function(){
        var checkinSymbol='*';
        console.log('At checkinMe');
        if(/Android/i.test(navigator.userAgent)){location = 'twitter://post?in_reply_to_status_id='+callNode.id+'&message='+replyAccount+'%20'+checkinSymbol+'%20['+callNode.callId+']%20';}
        //if(/Android/i.test(navigator.userAgent)){location = 'https://twitter.com/intent/tweet?text='+replyAccount+'%20'+checkinSymbol+'%20['+callNode.callId+']%20';}
        else{
            if(/iPad/i.test(navigator.userAgent)){location = 'twitter://post?in_reply_to_status_id='+callNode.id+'&message='+replyAccount+'%20'+checkinSymbol+'%20['+callNode.callId+']%20';}
            else{
                if(/iPhone/i.test(navigator.userAgent)){location = 'twitter://post?in_reply_to_status_id='+callNode.id+'&message='+replyAccount+'%20'+checkinSymbol+'%20['+callNode.callId+']%20';}
                else{location = 'https://twitter.com/intent/tweet?in_reply_to_status_id='+callNode.id+'&text='+replyAccount+'%20'+checkinSymbol+'%20['+callNode.callId+']%20';}
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
        html+='<div class="close closeleft" href="#">Cerrar</div>';
        $('#infoextra').html("<br/>"+html+"<div class='marginbot'></div>");
        $('.close').on('click',function(){closeInfobox();});
        $('.closeup').on('click',function(){closeInfobox();});
    };
    var callInfo = function(){
        console.log('At callInfo');
        callId=callNode.id;
        var url="getPointDetail/"+callId+"/";
        var data = null;
        $.getJSON(url, function(datos){
            data = datos;
        }).complete(function(){
                var html = '<div class="tweet">';
                html+='<div>';
                html+='<div class="picture"><img class="picture" src="'+data.userImg+'"></div>';
                html+='<div class="author">'+data.userName+"</div>";
                html+='<div class="nick"><a href="https://www.twitter.com/'+data.userNick+'">@'+data.userNick+'</a></div>';
                html+='<div class="birddate"><img src="static/imgs/bird_blue_16.png"><span class="date">'+moment(data.stamp,"YYYYMMDDHHmmss").format("DD.MM.YYYY HH:mm:ss")+"</span></div>";
                html+='</div';
                html+='<div class="botonera"><div class="checkin" id="checkin">Checkin</div><div class="mapping" id="mapea">Mapea</div><div class="close" href="#">Cerrar</div></div>';
                html+='<div style="clear:both;" id="checkinsCount">Checkin count: '+data.votes+'</div>';

                //            html+='<span id="checkinsCount">CheckIns count: '+data.relevanceFirst+'</span>';
                html+='<div class="tweetText">'+normalizeTweet(data.text)+"</div>";
                if(data.media!=null)
                {
                    html+='<a href="http://twitter.com/'+data.userNick+"/status/"+data.userId+"/photo/1"+' target="_blank">';
                    html+='<img src="'+data.media+'"></a>';
                }
                html+='<div class="htoninfo">Tag:'+data.hashTag+"</div>";
                html+='</div>';
                display(html,430);

                $("#checkin").on("click", checkinMe);
                $("#mapea").on("click", mapMe);

            });
    };
    var replyInfo = function(id){
        console.log('At replyInfo');
        var url="getPointDetail/"+id+"/";
        var data = null;
        $.getJSON(url, function(datos){
            data = datos;
        }).complete(function(){
                var html = '<div class="tweet">';
                html+='<div class="picture"><img class="picture" src="'+data.userImg+'"></div>';
                html+='<div class="author">'+data.userName+"</div>";
                html+='<div class="nick"><a href="https://www.twitter.com/'+data.userNick+'">@'+data.userNick+'</a></div>';
                html+='<div class="birddate"><img src="static/imgs/bird_blue_16.png"><span class="date">'+moment(data.stamp,"YYYYMMDDHHmmss").format("DD.MM.YYYY HH:mm:ss")+"</span></div>";
                html+='<div class="botonera"><div class="closeup" href="#">Cerrar</div></div>';

                //            html+='<span id="checkinsCount">CheckIns count: '+data.relevanceFirst+'</span>';
                html+='<div style="clear:both" class="tweetText">'+normalizeTweet(data.text)+"</div>";
                if(data.media!=null)
                {
                    html+='<a href="http://twitter.com/'+data.userNick+"/status/"+data.userId+"/photo/1"+' target="_blank">';
                    html+='<img src="'+data.media+'"></a>';
                }
                html+='<div class="htoninfo">Tag:'+data.hashTag+"</div>";
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
        map = L.map('map',{touchZoom:true}).locate({setView:false,enableHighAccuracy:true,maximumAge:60000}).setView(myLatLng, myZoom);
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
        L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/'+mapStyle+'/256/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'App by <a href="http://www.outliers.es">Outliers</a>, Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
        }).addTo(map);
    }
    var paintMap=function(){
        console.log('At paintMap');
        paintMapFirstTime();
        paintUserPosition();
    };
    var paintUserPosition=function(){
        console.log('At paintUserPosition');
        L.marker(locLatLng, {icon: markerIcon}).setZIndexOffset(-100).addTo(map);
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
                    marker=L.marker([call.lat, call.lng], {icon: decideIconOn(call['votes'])});
                }else{
                    // BUG? NO hay que decidir dependiendo de los votos independientemente de si es la seleccionada o no?
                    //marker=L.marker([call.lat, call.lng], {icon: defaultIcon});
                    marker=L.marker([call.lat, call.lng], {icon: decideIconOff(call['votes'])});
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
                color: "#000",
                weight:3,
                stroke:true,
                fillColor: "#ffe174",
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
        //if(/Android/i.test(navigator.userAgent)){location = "https://twitter.com/intent/tweet?text="+replyAccount+"%20"+callSymbol+"%20";}
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
        html+= '<ul class="button">';
        html+='<li id="home"><a style="border-left:none;" href="#"><img src="static/imgs/home.png" width="22" height="20" /></a></li>';
        html+='<li id="tag"><a href="#"><img src="static/imgs/tags.png" width="23" height="21" /></a></li>';
        html+='<li id="call"><a href="#"><img src="static/imgs/C.png" width="26" height="22" /></a></li>';
        html+='<li id="help"><a style="border-right:none;" href="#"><img src="static/imgs/info.png" width="16" height="22" /></a></li>';
        html+='<div style="clear:both"></div>';
        html+='</ul>';
        $('#infomenu').html(html);
        $('#home').on("click",menuHome);
        $('#tag').on("click",menuHash);
        $('#call').on("click", menuCall);
        $('#help').on("click", menuHelp);
    };
    //Map events handlers.
    var onLocationError=function(e){
        if(!locLatLng)
        {
            console.log('At onLocationError');
            alert(e.message);
        }
    };
    var onLocationFound=function(e){
        console.log('At onLocationFound');
        console.log("Location found...");
        locLatLng = e.latlng;
        console.log("New location:"+locLatLng);
        if(firstLocate)
        {
            paintMapFirstTime();
            updateData();
            firstLocate = false;
        }
    };
    //First time run.
    var L_PREFER_CANVAS=true;
    map = L.map('map',{touchZoom:true}).locate({setView:true,maxZoom:18,enableHighAccuracy:true,maximumAge:60000});
    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/'+mapStyle+'/256/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'App by <a href="www.outliers.es">Outliers</a> Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
    }).addTo(map);
    menu();
    var refresher = setInterval(function(){updateData();},60000);
});

