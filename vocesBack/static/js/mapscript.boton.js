    var markerGroup;

    var newMarkers=[];

    var map;

    var firstTime = true;

    var locationMarker;

    var mapLayer;

    var myLong = 0.0;

    var myLat = 0.0;

    var globalLang;

    var circles=[];

    var first = true;


    function loadMarkersFirst()
    {

        myUrl="tweets.json";


        var i;

        var myZoom = map.getZoom();
        var myLatLng = map.getCenter();

        $("#map").remove();
        $("#mapPage").append("<div id='map' style='height:400px;'></div>");
//        map = L.map('map',{touchZoom:true}).setView([40.415750595628374, -3.6977791786193848], 14);
        map = L.map('map',{touchZoom:true}).setView(myLatLng, myZoom);
        L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/22677/256/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'An idea of <a href="https://twitter.com/_JuanLi">@_juanli</a> y <a href="https://twitter.com/oscarmarinmiro">@oscarmarinmiro</a>. Implemented by <a href="http://www.outliers.es">Outliers Collective </a> and <a href="https://twitter.com/nihilistBird"> @nihilistbird</a> <br>Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
        }).addTo(map);



        $("<div id='cargando' class='ui-loader ui-body-b modalwindow'></div>").appendTo("body");

        $.getJSON(myUrl,
                {
                    'minutes':60
                },
                function(data) {


                    first = false;

		    console.log(data.tweets.length);

                    for (var i=0;i<data.tweets.length;i++)
                    {
                        var tweet = data.tweets[i];

                        var circle = L.circle([tweet.lat, tweet.long], 50, {
                            color: "black",
                            weight:1,
                            stroke:true,
                            fillColor: tweet.color,
                            //fillOpacity: tweet.opacity,
                            //opacity:tweet.opacity
			    fillOpacity: 1.0,
			    opacity: 1.0
			    
                        });

                        circle.bindPopup("Cargando....................................................");
                        circle.__data__= tweet.tweetId;

                        circle.on('click',circleClick);
                        circle.on('mousedown',circleClick);


                        circle.addTo(map);


                    }

                    var legendHtml="";


		    var tuitPopHtml ='';
		    tuitPopHtml+= '<span style="font-size:20px;color:#FFF">Click on your chosen hashtag</span><span style="font-size:15px"><br>Remember to open your Twitter mobile app before<br> and to activate geolocation<br></span>';

                    var tag;

                    for (tag in data.colores)
                    {

                        legendHtml+="&nbsp;<font color='"+data.colores[tag]+"'>#"+tag+"</font>";
			tuitPopHtml+="&nbsp;<a style='font-size:30px;' href='https://twitter.com/intent/tweet?text="+"%23globalnoise%20%23"+tag+"'><font  color='"+data.colores[tag]+"'>#"+tag+"</font></a><br>";

                    }
                    //console.log(legendHtml);

		    tuitPopHtml+="";

		    legendHtml+="<br><a style='background-color: #000;color:#FFF;font-size:20px;' href='#' onclick='abrePop();'>Tweet pressing here</a>";


                    $('#mensaje').html();
                    $('#mensaje').html(legendHtml+"<span style='line-height:1px;font-size:10px'><br><a href='http://voces25s.wordpress.com/'>voces25s.wordpress.com</a><br>"+moment().format('D') +" Oct 2012 "+moment().format("h.mm a")+"</span>");

		    $('#popupTuitContent').html(tuitPopHtml);


                }).complete(function() {
                    $('#cargando').remove();});
    }

    function abrePop()
    {
        $('#popuptuit').popup();
        $('#popuptuit').popup( "open" );
    }

    function circleClick(e)
    {
        $('#popupContent').html("Loading tweet.........");

        $('#popup').popup();
        $('#popup').popup( "open" );


        var tweetId = e.target._popup._source.__data__;

        e.target.closePopup();

        myUrl="tweets/"+tweetId.charAt( tweetId.length-1 )+"/"+tweetId+".json";

        var html="";

        $.getJSON(myUrl,
                {
                },
                function(data) {



                  html+="<div style='font-size:15px;padding-bottom:3px;'><img src='css/images/bird_blue_16.png'>"+data.created_easy+"(GMT Time)"+"</div>";
                  html+="<div>"+"<img src='"+data.user.profile_image_url+"'>"+"</div>";
                  html+="<div style='font-size:20px;'><b>"+data.user.name+"</b></div><div>"+ "<a href='https://twitter.com/"+data.user.screen_name+"/status/"+data.id_str+"' target='_black'>@"+data.user.screen_name+"</a></div>";

                  var texto = URI.withinString(data.text, function(url) {
                        return "<a href='"+url+"' target='_blank'>" + url + "</a>";
                    });

                  html+="<div>"+texto+"</div>";

                  if(data.thumbnail!="None")
                  {
                      html+="<div><a href='"+data.thumblink+"' target='_blank'><img src='"+data.thumbnail+"'></a></div>"
                  }



                  $('#popupContent').html(html);



                }
        );



    }

    $(document).ready(function()
    {


	function onLocationError(e) {

            mapLayer = L.layerGroup();

            map.addLayer(mapLayer);

            loadMarkersFirst();

	    map.setView([40.415750595628374, -3.6977791786193848], 2,true);



	}

	function onLocationFound(e)
	{
            mapLayer = L.layerGroup();

            map.addLayer(mapLayer);

            loadMarkersFirst();



	}

        function jqmSimpleMessage(message,pageX,pageY) {
            $("<div id='mensaje' class='ui-loader ui-body-b'>" + message + "</div>")
                    .css({
                        padding: "10px 10px 10px 10px",
                        "background": "#000",
                        "color": "#CCC",
                        display: "block",
                        position: "absolute",
                        "font-size": "14px",
                        opacity:1.0,
                        width: "200px",
                        "min-height": "30px",
                        "border":"0px solid",
                        "border-radius":"5px",
                        //top: window.pageYOffset+100
                        top: pageY,
                        left:pageX,
			"z-index": "0"
            })
                    .appendTo("body");}


        jqmSimpleMessage("",70,12);

        moment.lang('es'); // default the language to English
        globalLang = moment();

        $.ajaxSetup({ cache: false });

        //map = L.map('map',{touchZoom:true}).setView([40.415750595628374, -3.6977791786193848], 16);

	map = L.map('map',{touchZoom:true}).locate({setView:true,maxZoom:6});


	map.on('locationfound', onLocationFound);

	map.on('locationerror', onLocationError);

        L.tileLayer('http://{s}.tile.cloudmade.com/4a708528dd0e441da7e211270da4dd33/22677/256/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
        }).addTo(map);

        //map.scrollWheelZoom.disable();


            var refreshId = setInterval(function()
	   {

	       loadMarkersFirst();


           }, 900000);


    });



