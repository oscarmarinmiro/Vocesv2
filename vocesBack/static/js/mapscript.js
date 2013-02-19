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

var CIRCLE_SIZE = 20;

var locLatLng;

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
    function fillInfobox()
    {
        var myHtml="";

        myHtml = '<a id="home" href="#">Home</a> | <a id="tag" href="#">#</a> | <a id="at" href="#">@</a>';

        $('#infomenu').html(myHtml);

        $('#home').on("click",menuHome);
        $('#tag').on("click",menuHash);
        $('#at').on("click",menuAt);

    }

    function putInfo(html)
    {
        extendInfobox();

        html+='<a id="close" href="#">Cerrar</a>';

        $('#infoextra').html(html);

        $('#close').on("click",function(){contractInfobox();});

    }
    function circleClick(e)
    {

        var tweetId = e.target._popup._source.__data__;

        e.target.closePopup();

        console.log(tweetId);



        var myUrl="getPointDetail/"+tweetId;

        $.getJSON(myUrl,
            function(data)
            {
            console.log(data);

            var myHtml = "";

            myHtml+=data.stamp+"<br>";

            myHtml+="@"+data.userNick+"<br>";

            myHtml+='<img src="'+data.userImg+'"><br>';

            myHtml+=data.userName+"<br>";

            myHtml+=data.text+"<br>";

            myHtml+=data.hashTag+"<br>";

            myHtml+='<img width="100" height="100" src="'+data.media+'"><br>';

            putInfo(myHtml);

            });
    }
        function loadMarkersFirst()
          {
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
        L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/997/256/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'An idea of <a href="https://twitter.com/_JuanLi">@_juanli</a> y <a href="https://twitter.com/oscarmarinmiro">@oscarmarinmiro</a>. Implemented by <a href="http://www.outliers.es">Outliers Collective </a> and <a href="https://twitter.com/nihilistBird"> @nihilistbird</a> <br>Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
        }).addTo(map);

        L.marker(locLatLng).addTo(map);

            map.on('locationfound', onLocationFound);

            map.on('locationerror', onLocationError);

            map.on('moveend',loadMarkersFirst);
            map.on('zoomend',loadMarkersFirst);
            map.on('dragend',loadMarkersFirst);


//
//
//
//        $("<div id='cargando' class='ui-loader ui-body-b modalwindow'></div>").appendTo("body");
//
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
//
//
//                first = false;
//
//                console.log(data.tweets.length);
//
//                for (var i=0;i<data.tweets.length;i++)
//                {
//                    var tweet = data.tweets[i];
//
//                    var circle = L.circle([tweet.lat, tweet.long], 50, {
//                        color: "black",
//                        weight:1,
//                        stroke:true,
//                        fillColor: tweet.color,
//                        //fillOpacity: tweet.opacity,
//                        //opacity:tweet.opacity
//                        fillOpacity: 1.0,
//                        opacity: 1.0
//
//                    });
//
//                    circle.bindPopup("Cargando....................................................");
//                    circle.__data__= tweet.tweetId;
//
//                    circle.on('click',circleClick);
//                    circle.on('mousedown',circleClick);
//
//
//                    circle.addTo(map);
//
//
//                }
//
//                var legendHtml="";
//
//
//                var tuitPopHtml ='';
//                tuitPopHtml+= '<span style="font-size:20px;color:#FFF">Click on your chosen hashtag</span><span style="font-size:15px"><br>Remember to open your Twitter mobile app before<br> and to activate geolocation<br></span>';
//
//                var tag;
//
//                for (tag in data.colores)
//                {
//
//                    legendHtml+="&nbsp;<font color='"+data.colores[tag]+"'>#"+tag+"</font>";
//                    tuitPopHtml+="&nbsp;<a style='font-size:30px;' href='https://twitter.com/intent/tweet?text="+"%23globalnoise%20%23"+tag+"'><font  color='"+data.colores[tag]+"'>#"+tag+"</font></a><br>";
//
//                }
//                //console.log(legendHtml);
//
//                tuitPopHtml+="";
//
//                legendHtml+="<br><a style='background-color: #000;color:#FFF;font-size:20px;' href='#' onclick='abrePop();'>Tweet pressing here</a>";
//
//
//                $('#mensaje').html();
//                $('#mensaje').html(legendHtml+"<span style='line-height:1px;font-size:10px'><br><a href='http://voces25s.wordpress.com/'>voces25s.wordpress.com</a><br>"+moment().format('D') +" Oct 2012 "+moment().format("h.mm a")+"</span>");
//
//                $('#popupTuitContent').html(tuitPopHtml);
//
//
               }).complete(function() {
//                $('#cargando').remove();});
            console.log("Carga completada...");});

    }

	function onLocationError(e) {

        alert(e.message);
	}

	function onLocationFound(e)
	{
        console.log("Location found...");
        locLatLng = e.latlng;

        loadMarkersFirst();
    }

    var  L_PREFER_CANVAS =true;

	var map = L.map('map',{touchZoom:true}).locate({setView:true,maxZoom:18});


	map.on('locationfound', onLocationFound);

	map.on('locationerror', onLocationError);


    L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/997/256/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
    }).addTo(map);

    fillInfobox();


    var refreshId = setInterval(function()
    {

        loadMarkersFirst();


    }, 60000);

});


