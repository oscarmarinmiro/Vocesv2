var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


// Draws a d3.js chordDiagram
// Parameters
// idName => DOM id for drawing diagram
// width => SVG width
// height => SVG height
// transTime => transitions time (milliseconds)
// chordPadding => padding between groups
// loadingMessage => message to display while loading data
// Copy functions
//    'quitaInfoChord'
//        'quitaInfoGroup'
//        'rellenaInfoChord'
//        'rellenaInfoGroup'
// myLog => logging function

// idInfo ==> html div id to display aux information (# of calls, # of messages and so on)
// colorScale ==> ordinal color scale to pick chord & groups colors from

tdviz.viz.chordDiagram = function (options)
{

    // Object

    var self = {};

    // Var to keep transition state

    self.onTransition = false;

    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#"+self.idName;

    self.init = function(){

        // svg init

        self.myLog("Iniciando chordChart... en ",3);
        self.myLog(self.parentSelect,3);
        self.svg = d3.select(self.parentSelect).append("svg")
            .attr("width",self.width)
            .attr("height",self.height)
            .append("g")
            .attr("transform", "translate("+(self.width/2)+","+(self.height/2)+")");

        // warning message

        self.warningMessage = self.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("class","chordChartTextWarning")
            .attr("x", 0)
            .attr("y",0)
            .text(self.loadingMessage);

        // elements svg

        self.groups = self.svg.append("g");
        self.chords = self.svg.append("g");
        self.texts = self.svg.append("g");

        // chord diagram dimensions

        self.chartWidth = (self.width)-(self.height/10);
        self.chartHeight = (self.height)-(self.height/10);
        self.innerRadius = Math.min(self.chartWidth, self.chartHeight) * .41;
        self.outerRadius = self.innerRadius * 1.1;

        // chord and arc functions

        self.arc_svg = d3.svg.arc().innerRadius(self.innerRadius).outerRadius(self.outerRadius);

        self.chord_svg = d3.svg.chord().radius(self.innerRadius);

        // d3.layout.chord object....

        self.chord = d3.layout.chord()
            .padding(self.chordPadding)
            .sortSubgroups(d3.ascending)
            .sortChords(d3.ascending);


    }

    self.render = function(data,data_label,color_rule,datum_label,legendDict)
    {

        self.warningMessage.remove();
        self.data = data;
        self.data_label = data_label;
        self.datum_label = datum_label;

        d3.selectAll(".bigLegend").remove();
        d3.selectAll(".smallLegend").remove();

        self.svg.append("text")
            .attr("text-anchor", "begin")
            .attr("class","bigLegend")
            .attr("x",-(self.chartWidth/2))
            .attr("y",-(self.height/2)+30)
            .text(legendDict['big']);

        self.svg.append("text")
            .attr("text-anchor", "begin")
            .attr("class","smallLegend")
            .attr("x", -(self.chartWidth/2))
            .attr("y",-(self.height/2)+50)
            .text(legendDict['small']);


        if (self.chord.matrix())
        {
            self.myLog("Segunda ejecucion",3);

        }
        else
        {
            self.myLog("Primera ejecucion",3);
        }


//      OJO: NO QUITAR, es un test interno para comprobar que las matrices ok
//        data[2][45] = 240;

//        console.log(data[17]);

//      FIN_OJO

        self.chord.matrix(data);

        var groupsBind = self.groups.selectAll(".groups").data(self.chord.groups);
        var textBind = self.texts.selectAll(".chordLegendText").data(self.chord.groups,function (d,i){return d.index;});
        var chordsBind = self.chords.selectAll(".chords").data(self.chord.chords,function(d,i){return getStringRepr(d.source.index, d.target.index)});


        // texto....

        textBind.exit().transition().duration(self.transTime).remove();

        textBind.transition()
            .duration(self.transTime)
            .attr("transform", function(d) {
                return "rotate(" + ( (d.startAngle + (d.endAngle - d.startAngle)/2) * 180 / Math.PI -90) + ")"
                    + "translate(" + (self.outerRadius + 16) + ")";
            });

        textBind.enter().append("text")
            .attr("dy", ".35em")
            .attr("class","chordLegendText")
            .attr("transform", function(d) {
                return "rotate(" + ( (d.startAngle + (d.endAngle - d.startAngle)/2) * 180 / Math.PI -90) + ")"
                    + "translate(" + (self.outerRadius + 16) + ")";
            })
            .text(function(d){return data_label[d.index];});


        // groups....

        groupsBind.exit().transition().duration(self.transTime).remove();

        groupsBind.transition()
            .duration(self.transTime)
            .attrTween("d", arcTween(self.arc_svg, self.old));

        groupsBind.enter().append("path")
            .attr("class","groups")
            .style("fill", function(d) {return self.colorScale(d.index); })
            .style("stroke", function(d) { return "#000"; })
            .attr("d", d3.svg.arc().innerRadius(self.innerRadius).outerRadius(self.outerRadius))
            .on("mouseover", fadeOut(.1))
            .on("mouseout", fadeIn(1));


        // chords....

        chordsBind.exit().transition().duration(self.transTime).style("opacity", 0).remove();

        chordsBind.transition()
            .duration(self.transTime)
            .style("fill", function(d) {return self.colorScale(chooseNodeRule(d,color_rule)); })
            .style("opacity",1)
            .attrTween("d", chordTween(self.chord_svg, self.old));

        chordsBind.enter()
            .append("path")
            .attr("class","chords")
            .attr("d", d3.svg.chord().radius(self.innerRadius))
            .style("fill", function(d) {return self.colorScale(chooseNodeRule(d,color_rule)); })
            .style("opacity", 0.1)
            .on("mouseover", function(d,i){self.rellenaInfoChord(d,i)})
            .on("mouseout",function(d,i){self.quitaInfoChord(d,i)})
            .transition()
            .each("start",function()
            {
                self.onTransition = true;
            }
        )
            .duration(self.transTime)
            .style("opacity",1)
            .each("end",function()
            {
                self.onTransition = false;
                self.old = {
                    groups: self.chord.groups(),
                    chords: chordsRepr(self.chord.chords())
                };
            });


        // Y ordeno las cuerdas....

        self.chords.selectAll(".chords").sort(function (a,b){return (a.target.value+ a.source.value)-(b.target.value+ b.source.value);});

    }

    // Main del objeto

    self.init();

    return self;

    function arcTween(arc_svg, old) {
        return function(d,i) {
            var i = d3.interpolate(old.groups[i], d);
            return function(t) {
                return arc_svg(i(t));
            }
        }
    }

    function chordTween(chord_svg, old) {
        return function(d,i) {
            var oldStrRepr = getStringRepr(d.source.index, d.target.index);
            var i = d3.interpolate(old.chords[oldStrRepr], d);
            return function(t) {
                return chord_svg(i(t));
            }
        }
    }

    function fadeIn(opacity) {
        return function (d, i) {
            self.quitaInfoGroup(d,i);
            self.svg.selectAll(".chords")
                .filter(function(d) { return d.source.index != i && d.target.index != i; })
                .style("opacity", opacity);
        };
    }

    function fadeOut(opacity) {
        return function (d, i) {
            self.rellenaInfoGroup(d,i);
            self.svg.selectAll(".chords")
                .filter(function(d) { return d.source.index != i && d.target.index != i; })
                .style("opacity", opacity);
        };
    }


    function chordsRepr(chords)
    {
        var repr = [];

        for(var i=0;i<chords.length;i++)
        {
            var stringRepr = getStringRepr(chords[i].source.index,chords[i].target.index);

            repr[stringRepr] = chords[i];
        }

        return repr;
    }

    function getStringRepr(i,j)
    {
        return (i>j) ? i.toString()+"*"+ j.toString(): j.toString()+"*"+ i.toString();
    }

    function chooseNodeRule(d,color_rule)
    {
        var bigger = d.source.value > d.target.value ? d.source.index: d.target.index;
        var smaller = d.source.value < d.target.value ? d.source.index: d.target.index;

        if (color_rule=='bigger')
        {
            return bigger;
        }
        else
        {
            return smaller;
        }

    }

}

tdviz.viz.wordCloud= function (options)
{

    // Object

    var self = {};


    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#"+self.idName;

    self.init = function(){

        // svg init

        self.myLog("Iniciando wordcloud...",3);


        self.fontScale = d3.scale.linear().domain([0,1]).range([3, 35]);



        self.myLog("Iniciando chordChart... en ",3);
        self.myLog(self.parentSelect,3);
        self.svg = d3.select(self.parentSelect).append("svg")
            .attr("width",self.width)
            .attr("height",self.height)
            .append("g")
            .attr("transform", "translate("+(self.width/2)+","+(self.height/2)+")");

        // warning message

        self.warningMessage = self.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("class","wordChartTextWarning")
            .attr("x", 0)
            .attr("y", 0)
            .text(self.loadingMessage);

        // Si es un layout, lo invoco
        // d3.layout.chord object....

//        self.chord = d3.layout.chord()
//            .padding(self.chordPadding)
//            .sortSubgroups(d3.ascending)
//            .sortChords(d3.ascending);


    }

    self.buildUrl = function (nowDate, text)
    {
        console.log("4444444");
        console.log(nowDate.toDate().getTime());

        // OJO: se le añaden 12 horas por el desplazamiento GMT (así, a ojo....)

        var firstDate = nowDate.clone().add('h',12);
        var secondDate = firstDate.clone().add('s', 86400);


        //http://topsy.com/s?type=tweet&mintime=1354316400&maxtime=1356994800&q=rajoy

        var finalUrl = "http://topsy.com/s?type=tweet&mintime="+firstDate.toDate().getTime()/1000+"&maxtime="+secondDate.toDate().getTime()/1000+"&q="+encodeURIComponent(text);


        console.log("4444445");
        console.log(finalUrl);


        // This is a trick!!

        window.open(finalUrl, '_blank');
        window.focus();

    }

    self.render = function(data, nowDate)
    {

        self.warningMessage.remove();
        self.data = data;
        self.nowDate = nowDate;

        console.log("Me llegan los datos");
        console.log(data);

        var wordData = data.slice(0,20);

        self.myLog("wordData",3);
        self.myLog(wordData,3);


        var cloudData = [];


        if(wordData.length==0)
        {
            alert("NO HAY DATOS, CHATO");
        }
        else
        {
            var maxSize = wordData[0].count;


            for(i=0;i<wordData.length;i++)
            {
                var unDato = {};

                unDato.text = wordData[i].name;
                unDato.size = self.fontScale (wordData[i].count/maxSize);

                cloudData.push(unDato);

            }

//            console.log("cloudData");

            self.myLog("cloudData",2);
            self.myLog(cloudData,2);

            d3.layout.cloud().size([self.width, self.height])
                .words(cloudData)
                .rotate(function() { return 0; })
                .fontSize(function(d) { return d.size; })
                .font(self.font)
                .on("end", draw)
                .padding(self.padding)
                .start();
        }

        function draw(words) {

            self.myLog("words",2);
            self.myLog(words,2);

            var text = self.svg
                .selectAll("text")
                .data(words,function(d) { return d.text;});

            text.transition()
                .duration(self.transTime)
                .style("fill",function(d){return d.text.charAt(0)=="#" ? "#25A":"#222";})
                .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
                .style("font-size", function(d) { return d.size + "px"; })
                .style("opacity", function(d) { return self.opacityScale(d.size); })
//                .style("fill", "#000");

            text.enter().append("text")
                .attr("text-anchor", "middle")
                .attr("class","cloudText")
                .on("click", function(d){self.buildUrl(self.nowDate,d.text);})
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.text; })
                .style("font-size", function(d) { return d.size + "px"; })
                .style("font-family",self.font)
                .style("fill",function(d){return d.text.charAt(0)=="#" ? "#25A":"#222";})
                .style("opacity",1e-6)
                .transition()
                .duration(self.transTime)
                .style("opacity", function(d) { return self.opacityScale(d.size); });
//                .style("fill", "#000");

            text.exit().transition().duration(self.transTime).style("opacity",1e-6).remove();
        }



//            d3.layout.cloud().size([WC_W, WC_H])
//                .words(cloudData)
//                .rotate(function() { return 0; })
//                .fontSize(function(d) { return d.size; })
//                .font(WC_FONT)
//                .on("end", draw)
//                .padding(WC_PADDING)
//                .start();




        // Aqui hago el bind

        //var textBind = self.texts.selectAll(".chordLegendText").data(self.chord.groups,function (d,i){return d.index;});


        // Y aqui hago exit, transicion y enter

//        textBind.exit().transition().duration(self.transTime).remove();
//
//        textBind.transition()
//            .duration(self.transTime)
//            .attr("transform", function(d) {
//                return "rotate(" + ( (d.startAngle + (d.endAngle - d.startAngle)/2) * 180 / Math.PI -90) + ")"
//                    + "translate(" + (self.outerRadius + 16) + ")";
//            });
//
//        textBind.enter().append("text")
//            .attr("dy", ".35em")
//            .attr("class","chordLegendText")
//            .attr("transform", function(d) {
//                return "rotate(" + ( (d.startAngle + (d.endAngle - d.startAngle)/2) * 180 / Math.PI -90) + ")"
//                    + "translate(" + (self.outerRadius + 16) + ")";
//            })
//            .text(function(d){return data_label[d.index];});



    }

    // Main del objeto

    self.init();

    return self;

}


tdviz.viz.circlePacking= function (options)
{

    // Object

    var self = {};


    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#"+self.idName;

    self.init = function(){

        // svg init

        self.myLog("Iniciando chordChart... en ",3);
        self.myLog(self.parentSelect,3);
        self.svg = d3.select(self.parentSelect).append("svg")
            .attr("width",self.width)
            .attr("height",self.height)
            .append("g");
//            .attr("transform", "translate("+(self.width/2)+","+(self.height/2)+")");

        // warning message

        self.warningMessage = self.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("class","wordChartTextWarning")
            .attr("x", 0)
            .attr("y",0)
            .text(self.loadingMessage);

        // Si es un layout, lo invoco
        // d3.layout.chord object....

//        self.chord = d3.layout.chord()
//            .padding(self.chordPadding)
//            .sortSubgroups(d3.ascending)
//            .sortChords(d3.ascending);


    }

    self.render = function(data)
    {

        self.warningMessage.remove();
        self.data = data;

        // Aqui hago el bind

        //var textBind = self.texts.selectAll(".chordLegendText").data(self.chord.groups,function (d,i){return d.index;});


        // Y aqui hago exit, transicion y enter

//        textBind.exit().transition().duration(self.transTime).remove();
//
//        textBind.transition()
//            .duration(self.transTime)
//            .attr("transform", function(d) {
//                return "rotate(" + ( (d.startAngle + (d.endAngle - d.startAngle)/2) * 180 / Math.PI -90) + ")"
//                    + "translate(" + (self.outerRadius + 16) + ")";
//            });
//
//        textBind.enter().append("text")
//            .attr("dy", ".35em")
//            .attr("class","chordLegendText")
//            .attr("transform", function(d) {
//                return "rotate(" + ( (d.startAngle + (d.endAngle - d.startAngle)/2) * 180 / Math.PI -90) + ")"
//                    + "translate(" + (self.outerRadius + 16) + ")";
//            })
//            .text(function(d){return data_label[d.index];});



    }

    // Main del objeto

    self.init();

    return self;

}


tdviz.viz.esqueletoDiagram_WORD= function (options)
{

    // Object

    var self = {};


    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#"+self.idName;

    self.init = function(){

        // svg init

        self.myLog("Iniciando chordChart... en ",3);
        self.myLog(self.parentSelect,3);
        self.svg = d3.select(self.parentSelect).append("svg")
            .attr("width",self.width)
            .attr("height",self.height)
            .append("g");
//            .attr("transform", "translate("+(self.width/2)+","+(self.height/2)+")");

        // warning message

        self.warningMessage = self.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("class","wordChartTextWarning")
            .attr("x", 0)
            .attr("y",0)
            .text(self.loadingMessage);

        // Si es un layout, lo invoco
        // d3.layout.chord object....

//        self.chord = d3.layout.chord()
//            .padding(self.chordPadding)
//            .sortSubgroups(d3.ascending)
//            .sortChords(d3.ascending);


    }

    self.render = function(data)
    {

        self.warningMessage.remove();
        self.data = data;

        // Aqui hago el bind

        //var textBind = self.texts.selectAll(".chordLegendText").data(self.chord.groups,function (d,i){return d.index;});


        // Y aqui hago exit, transicion y enter

//        textBind.exit().transition().duration(self.transTime).remove();
//
//        textBind.transition()
//            .duration(self.transTime)
//            .attr("transform", function(d) {
//                return "rotate(" + ( (d.startAngle + (d.endAngle - d.startAngle)/2) * 180 / Math.PI -90) + ")"
//                    + "translate(" + (self.outerRadius + 16) + ")";
//            });
//
//        textBind.enter().append("text")
//            .attr("dy", ".35em")
//            .attr("class","chordLegendText")
//            .attr("transform", function(d) {
//                return "rotate(" + ( (d.startAngle + (d.endAngle - d.startAngle)/2) * 180 / Math.PI -90) + ")"
//                    + "translate(" + (self.outerRadius + 16) + ")";
//            })
//            .text(function(d){return data_label[d.index];});



    }

    // Main del objeto

    self.init();

    return self;

}


// Draws a d3.js mapDiagram
// Parameters
// idName => DOM id for drawing diagram
// width => SVG width
// transTime => transitions time (milliseconds)
// loadingMessage => message to display while loading data
// myLog => logging function
// displayCountryInfo ==> callback to fill info div
// removeCountryInfo ==> callback to remove info div

tdviz.viz.mapDiagram = function (options)
{

    // Object

    var self = {};

    // Internal variable to store connections to draw on mouseOver ("out"/"in")

    self.connType ="out";

    self.onTransition = false;

    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#"+self.idName;

    self.init = function(){

        self.height = ((self.width/960)*500)*2;

        self.myLog("Iniciando mapDiagram... en ",3);
        self.myLog(self.parentSelect,3);

        self.svg = d3.select(self.parentSelect).append("svg")
            .attr("width",self.width)
            .attr("height",self.height)
            .style("background-color","#FFF")
            .attr("class","mapaSVG")
            .on("click",function(d,i){if(!self.onTransition){self.removeChords()}});


        self.mapG = self.svg.append("g");

        self.legendG = self.svg.append("g").attr("id","grupoleyenda");

        self.legendColor = self.svg.append("g").attr("id","grupoleyendacolor")
            .attr("transform","translate("+self.width*0.85+","+self.height*0.3+")");

        // El rect de la leyenda

        self.legendG.append("rect")
            .attr("rx", 6)
            .attr("ry", 6)
            .attr("x", self.width*0.01)
            .attr("y", self.height*0.01)
            .attr("width", self.width*0.25)
            .attr("height", self.height*0.05)
            .attr("class","rectLegend");

        // El rect de la leyenda de colores

        self.legendColor.append("rect")
            .attr("rx", 6)
            .attr("ry", 6)
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", self.width*0.13)
            .attr("height", self.height*0.26)
            .attr("class","rectLegendColor");

        // Su texto inicial

        self.legendColor.append("text")
            .attr("text-anchor","begin")
            .attr("class","bigLegendColor")
            .attr("x",self.width*0.02)
            .attr("y",self.height*0.03)
            .text("Legend");


//        // La leyenda del heatmap incluida en el rect anterior
//
//        self.legendG.append("rect")
//            .attr("x", self.width*0.02)
//            .attr("y", self.height*0.06)
//            .attr("width", self.width*0.28)
//            .attr("height", self.height*0.03)
//            .attr("class","rectLegendFill");

        // warning message

        self.warningMessage = self.mapG.append("text")
            .attr("text-anchor", "middle")
            .attr("class","mapChartTextWarning")
            .attr("x", self.height/2)
            .attr("y",self.width/4)
            .text(self.loadingMessage);


    }

    self.drawMap = function(polyData)
    {
        self.warningMessage.style("opacity",1.0).transition().duration(self.transTime).style("opacity",0.1).remove();

        self.polyData = polyData;

        self.projection = d3.geo.mercator();

        self.translation = self.projection.translate([self.width/2,(self.height/2)-100]);
        self.scale = self.projection.scale(self.width);

        self.path = d3.geo.path().projection(self.projection);



        self.mapG.selectAll("path")
            .data(self.polyData)
            .enter().insert("path",".mapChartTextWarning")
            .attr("class","geoPath")
            .attr("acronym",function(d,i){return d.properties.ISO3;})
            .on("click",function(d,i){if(!self.slider.playing){self.drawMapChords(d,i);}})
            .on("mouseover",function(d,i){d3.select(this).classed("geoPathOn",true);self.displayCountryInfo(d,i);})
            .on("mouseout",function(d,i){d3.select(this).classed("geoPathOn",false);self.removeCountryInfo(d,i);})
            .attr("stroke-dasharray", "5,5")
            .style("fill",function(d){
                return self.colorScale['init'](0);
            })
            .attr("d", self.path);


        self.svg.call(d3.behavior.zoom().scaleExtent([self.width,self.width*10])
            .translate(self.projection.translate())
            .scale(self.projection.scale())
            .on("zoom", redraw));


        self.centroids = self.mapG.append("g").attr("id", "centroids");
        self.arcs = self.mapG.append("g").attr("id", "arcs");



    }

    self.drawHeatMap = function(heatData,connData,mode,legendDict,sliderObj)
    {
        self.conData = connData;
        self.mode = mode;
        self.slider = sliderObj;


        self.removeChords();

        // Quito los textos de leyenda

        d3.selectAll(".bigLegend").remove();
        d3.selectAll(".smallLegend").remove();

        d3.selectAll(".legendSquares").remove();
        d3.selectAll(".legendSquareTexts").remove();

        // Dibujo los textos de leyenda

        self.legendG.append("text")
            .attr("text-anchor","middle")
            .attr("class","bigLegend")
            .attr("x",self.width*0.13)
            .attr("y",self.height*0.043)
            .text(legendDict['big']);

        self.legendG.append("text")
            .attr("text-anchor", "begin")
            .attr("class","smallLegend")
            .attr("x",self.width*0.00)
            .attr("y",self.height*0.06)
            .text(legendDict['small']);


        var scaleValues = self.colorScale[mode].domain();

        for(var i=0;i<scaleValues.length;i++)
        {
            self.legendColor.append("rect")
                .attr("y",self.height*0.055+(self.height*0.0375*i))
                .attr("x",self.width*0.02)
                .attr("width",self.width*0.025)
                .attr("height",self.height*0.025)
                .attr("class","legendSquares")
                .style("fill",self.colorScale[mode](scaleValues[i]));

            self.legendColor.append("text")
                .attr("y",self.height*0.075+(self.height*0.0375*i))
                .attr("x",self.width*0.055)
                .attr("text-anchor","begin")
                .text(scaleValues[i])
                .attr("class","legendSquareTexts");
        }


        // Dibujo la escala de calor

//        self.legendG.append("rect")
//            .attr("x", self.width*0.02)
//            .attr("y", self.height*0.06)
//            .attr("width", self.width*0.28)
//            .attr("height", self.height*0.03)
//            .attr("class","rectLegendFill");

        // Voy con un bucle de pixeles

//        var colorLegendX = self.width*0.02;
//        var colorLegendW = self.width*0.28;
//
//        var customScale = d3.scale.linear().domain([colorLegendX,colorLegendX+colorLegendW]).range([0,self.colorScale[mode].ticks(10)[9]]);
//
//        //var ticks = self.colorScale[mode].ticks(10);
//
//        for(var i=colorLegendX;i<colorLegendX+colorLegendW;i++)
//        {
//            console.log(i);
//            console.log(self.colorScale[mode](customScale(i)));
//
//            self.legendG.append("rect")
//                .attr("x",i)
//                .attr("y",self.height*0.06)
//                .attr("width",1)
//                .attr("height",self.height*0.03)
//                .style("fill",self.colorScale[mode](customScale(i)));
//
//            console.log(self.colorScale[mode].domain())
//        }


        var cambios = self.mapG.selectAll(".geoPath").data(self.polyData);

        cambios.transition().duration(self.transTime).style("fill",function(d,i){
            return self.colorScale[mode](heatData[i]['internacionales']['salientes'][mode]+heatData[i]['internacionales']['entrantes'][mode]+heatData[i]['nacionales'][mode]);

        });
    }

    self.drawMapChords = function(d,i)
    {
        var arc = d3.geo.greatArc().precision(3);
        var ISOName = d.properties.ISO3;
        var countryCon = self.conData[ISOName];


        self.removeChords();

        var totalNumber = 0;

        var sourceCountry = null;

        if(countryCon)
        {

            // Apaño los arcos...

            var dataArcs = [];

            var direccion = self.connType == 'out' ? 'salientes':'entrantes';

            for(var j=0;j<countryCon.length;j++)
            {
                if(countryCon[j][direccion])
                {
                    // OJO no vienen salientes ==> bug de los datos?
                    var number = countryCon[j][direccion][self.mode];
                    if (number!=0)
                    {
                        totalNumber+=number;

                        var source = [self.polyData[i].properties.LON,self.polyData[i].properties.LAT];

                        sourceCountry = source;

                        var target = [self.polyData[countryCon[j].index].properties.LON,self.polyData[countryCon[j].index].properties.LAT];
                        dataArcs.push({'source':source,'target':target,'number':number,'countryName':self.polyData[countryCon[j].index].properties.NAME});

                    }
                }
            }

            if(dataArcs.length>0)
            {
                self.onTransition = true;
                var arcNodes = self.arcs.selectAll("line")
                    .data(dataArcs)
                    .enter().append("line")
                    .attr("class","arcos")
                    .attr("stroke", "#000")
                    .attr("stroke-width","1")
                    .attr("x1",function(d,i){return self.projection(d.source)[0];})
                    .attr("y1",function(d,i){return self.projection(d.source)[1];})
                    .attr("x2",function(d,i){return self.projection(d.source)[0];})
                    .attr("y2",function(d,i){return self.projection(d.source)[1];})
                    //.style("opacity",function(d,i){console.log(self.colorScale['c'+self.mode](d.number));return self.colorScale['c'+self.mode](d.number);})
                    .attr("stroke-dasharray", "5,5")
                    .transition()
                    .duration(self.transTime)
                    .attr("x2",function(d,i){return self.projection(d.target)[0];})
                    .attr("y2",function(d,i){return self.projection(d.target)[1];});

                // Voy con el nodo de origen

                var dataNode = [];

                dataNode.push( {
                    'source': [sourceCountry[0],sourceCountry[1]],
                    'number': totalNumber,
                    'countryName': d.properties.NAME
                });


                self.arcs.selectAll("circle.nodosOrigen")
                    .data(dataNode)
                    .enter().append("circle")
                    .attr("class","nodosOrigen")
                    .attr("title", function(d,i){return self.displayCountryConnections(d.countryName,d.number);})
                    .attr("cx",function(d,i){return self.projection(d.source)[0];})
                    .attr("cy",function(d,i){return self.projection(d.source)[1];})
                    .attr("r",function(d,i){return self.colorScale['c'+self.mode](d.number)*7;});


                $('circle.nodosOrigen').tipsy({
                    gravity: 's',
                    opacity: 1.0,
                    html: true
                });


                var arcEnds = self.arcs.selectAll("circle.nodosDestino")
                    .data(dataArcs)
                    .enter().append("circle")
                    .attr("class","nodosDestino")
                    .attr("cx",function(d,i){return self.projection(d.source)[0];})
                    .attr("cy",function(d,i){return self.projection(d.source)[1];})
                    .attr("r",function(d,i){return self.colorScale['c'+self.mode](d.number)*7;})
                    //.style("opacity",function(d,i){console.log(self.colorScale['c'+self.mode](d.number));return self.colorScale['c'+self.mode](d.number);})
                    .transition()
                    .duration(self.transTime)
                    .attr("title", function(d,i){return self.displayCountryConnections(d.countryName,d.number);})
                    .attr("cx",function(d,i){return self.projection(d.target)[0];})
                    .attr("cy",function(d,i){return self.projection(d.target)[1];})
                    .each("end",function()
                    {
                        self.onTransition = false;
                    });

                $('circle.nodosDestino').tipsy({
                    gravity: 's',
                    opacity: 1.0,
                    html: true
                });


            }
        }

    }

    self.removeChords = function()
    {
        // Borro todos los arcos anteriores

        self.arcs.selectAll("line").remove();

        // Y los nodos

        self.arcs.selectAll("circle").remove();
    }

    // Main del objeto

    self.init();

    return self;

    // Funciones auxiliares

    function redraw() {


        if (d3.event) {
            var myScale = d3.event.scale;
            self.projection
                .translate(d3.event.translate)
                .scale(d3.event.scale);
        }

        // cambio las nuevas coordenadas de los arcos

        self.arcs.selectAll("line")
            .attr("x1",function(d,i){return self.projection(d.source)[0];})
            .attr("y1",function(d,i){return self.projection(d.source)[1];})
            .attr("x2",function(d,i){return self.projection(d.target)[0];})
            .attr("y2",function(d,i){return self.projection(d.target)[1];});

        // Y la de los nodos

        self.arcs.selectAll("circle.nodosDestino")
            .attr("cx",function(d,i){return self.projection(d.target)[0];})
            .attr("cy",function(d,i){return self.projection(d.target)[1];});

        self.arcs.selectAll("circle.nodosOrigen")
            .attr("cx",function(d,i){return self.projection(d.source)[0];})
            .attr("cy",function(d,i){return self.projection(d.source)[1];});

        self.svg.selectAll("path").attr("d", function(d,i){return self.path(d);});


    }


}

tdviz.controller.chord = function(options)
{

    // Referencia a esta instancia

    var self = {};

    // Global vars

    self.DATA_FILE = "chordDataset.json";
    self.EVENTS_FILE = "events.json";

    self.countryDict = {"HND": "Honduras", "BEL": "Belgium", "DOM": "Dominican Republic", "ISR": "Israel", "SWE": "Sweden", "DEU": "Germany", "PER": "Peru", "IDN": "Indonesia", "BOL": "Bolivia", "CAN": "Canada", "CRI": "Costa Rica", "COL": "Colombia", "PAN": "Panama", "PAK": "Pakistan", "USA": "United States", "SGP": "Singapore", "MYS": "Malaysia", "PRT": "Portugal", "ECU": "Ecuador", "NLD": "Netherlands", "HKG": "Hong Kong", "SAU": "Saudi Arabia", "LBN": "Lebanon", "FRA": "France", "CHE": "Switzerland", "ESP": "Spain", "CHL": "Chile", "GTM": "Guatemala", "CHN": "China", "AUS": "Australia", "VNM": "Viet Nam", "IRL": "Ireland", "AUT": "Austria", "RUS": "Russian Federation", "VEN": "Venezuela", "URY": "Uruguay", "THA": "Thailand", "NZL": "New Zealand", "AND": "Andorra", "NPL": "Nepal", "MAR": "Morocco", "JPN": "Japan", "PHL": "Philippines", "ITA": "Italy", "ARE": "United Arab Emirates", "ARG": "Argentina", "IND": "India", "GBR": "United Kingdom", "MEX": "Mexico", "BRA": "Brazil"};

    self.minDate = "21000101";
    self.maxDate = "19900101";
    self.nowDate = null;
    self.numDays = 0;

    // Copies

    //self.MORE_INFO = "Mouseover the chart for more info";

    self.MORE_INFO = [
        'Width of the chord is relative to the total number of calls of the chosen service type during the day<br><br>',
        'Mouse over the chord to see the exact number of communications.<br><br>',
        'Mouse over the outer sector of graph (near country label) to see  number of comms. per country<br>',
        '<br><a href="img/countries.png" target="_blank">Here</a> you can find the full list of countries involved in the dataset'
    ].join('\t');

    self.NO_EVENT_STRING = "None";

    // Datos iniciales de las opciones de render

    self.dataIn = "mens";
    self.dataOut = "bigger";

    // Stack de timeouts vacio

    self.toStack = [];

    // Pongo lo que me venga por opciones en el self

    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#"+self.idName;


    // Funciones auxiliares

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }

    // Copy functions

    self.datumLabel = {
        'mens':"messages",
        'voip':"calls"
    }

    self.detailText = "Detailed Info";

    self.idInfo = "chordInfo";
    self.idInfoHeader = "chordInfoHeader";
    self.eventInfo = "newsContent";

    self.quitaInfoChord = function (d,i)
    {
        $("#"+self.idInfo).html(self.MORE_INFO);
    }

    self.quitaInfoGroup = function (d,i)
    {
        $("#"+self.idInfo).html(self.MORE_INFO);
    }

    self.rellenaInfoChord = function(d,i)
    {
        var html="<div class='chordInfoHeader'>"+self.detailText+"</div>";



        html+= self.datumLabel[self.dataIn].charAt(0).toUpperCase() + self.datumLabel[self.dataIn].slice(1)+ " from <b>"+ self.countryDict[self.labelData[d.source.index]] + "</b> to <b>" +self.countryDict[self.labelData[d.source.subindex]]+ "</b> : "+ d.source.value+"<br>";
        html+= self.datumLabel[self.dataIn].charAt(0).toUpperCase() + self.datumLabel[self.dataIn].slice(1)+ " from <b>"+ self.countryDict[self.labelData[d.target.index]] + "</b> to <b>" +self.countryDict[self.labelData[d.target.subindex]]+ "</b> : "+ d.target.value+"<br><br>";

        $("#"+self.idInfo).html(html);
    }

    self.rellenaInfoGroup = function(d,i)
    {
        var html="<div class='chordInfoHeader'>"+self.detailText+"</div>";

        html+="<b>"+self.countryDict[self.labelData[i]]+"</b><br>"+d.value.toFixed(0)+" external "+self.datumLabel[self.dataIn]+"<br>";

        var number = self.chordData['data'][self.nowDate.clone().format("YYYYMMDD")]['count'][self.labelData[i]]['nacionales'][self.dataIn].toFixed(0);
        html+= number +" internal "+self.datumLabel[self.dataIn]+"<br>";

        $("#"+self.idInfo).html(html);
    }

    self.rellenaEventInfo = function(message)
    {
        var html="";

        $("#"+self.eventInfo).html(message);

        if(message=="")
        {
            $("#"+self.eventInfo).toggleClass("activeEvent",false);
        }
        else
        {
            $("#"+self.eventInfo).toggleClass("activeEvent",true);
        }

    }

    // Construccion de la leyenda del chart

    self.buildLegendDict = function()
    {
        var dict = {};

        var total = 0;
        var totalOut = 0;
        var type = self.dataIn;

        for (var pais in self.chordData['data'][self.nowDate.clone().format("YYYYMMDD")]['count'])
        {
            var countryData =self.chordData['data'][self.nowDate.clone().format("YYYYMMDD")]['count'][pais];

            total+= countryData['nacionales'][type];
            total+= countryData['internacionales']['salientes'][type];
            total+= countryData['internacionales']['entrantes'][type];

            totalOut+= countryData['internacionales']['salientes'][type];
            totalOut+= countryData['internacionales']['entrantes'][type];

        }

        dict['big'] = total + " "+self.datumLabel[type].charAt(0).toUpperCase() + self.datumLabel[type].slice(1);

        var percentage = ((totalOut/total)*100).toFixed(2);
        //dict['small'] = totalOut + " "+self.datumLabel[type].charAt(0).toUpperCase() + self.datumLabel[type].slice(1);
        dict['small'] = percentage + " % Intl. "+self.datumLabel[type].charAt(0).toUpperCase() + self.datumLabel[type].slice(1);

        return dict;
    }

    // El document ready

    $(document).ready(function()
    {
        // El cache del servidor manda

        $.ajaxSetup({cache: true});

        // Inyecto el html en el div padre

        var injectString =
            ['<div id="contenedorTodo" class="contenedorTodo">',
                '<div id="zonaFecha" class="zonaFecha">',
                '</div>',
                '<div id="contenedorCI" class="contenedorCI">',
                '<div id="zonaChart" class="zonaChart">',
                '<div id="chartContent" class="chartContent"></div>',
                '</div>',
                '<div id="zonaInfo" class="zonaInfo">',
                '<div class="news">',
                '<div class="newsHeader">',
                '<div id="newsContent" class="newsContent">',
                '</div>',
                '</div>',
                '</div>',
                '<div class="opcionesHeader">Service type</div>',
                '<div class="opcionesContent">',
                '<form>',
                '<label><input type="radio" name="dataIn" value="mens" checked>Instant Message</label><br>',
                '<label><input type="radio" name="dataIn" value="voip"> VoIP call</label>',
                '</form>',
                '</div>',
                '<div class="chordInfoContent" id="chordInfo">'+self.MORE_INFO+'</div>',
                '</div>',
                '</div>',
                '<div id="footer" class="footer"></div>'
            ].join('\n');


        $(self.parentSelect).html(injectString);

        self.colorScale = d3.scale.category20();

        // Instancio el objeto chordChart

        self.chordChart = tdviz.viz.chordDiagram(
            {
                'idName':"chartContent",
                'idInfo': self.idInfo,
                'width':800,
                'height':700,
                'transTime':1000,
                'chordPadding':0.05,
                'loadingMessage':"Loading data...",
                'colorScale': self.colorScale,
                'myLog':myLog,
                // Funciones de copy
                'quitaInfoChord':self.quitaInfoChord,
                'quitaInfoGroup':self.quitaInfoGroup,
                'rellenaInfoChord':self.rellenaInfoChord,
                'rellenaInfoGroup':self.rellenaInfoGroup
            });

        // Pido el fichero de datos

        d3.json(self.baseJUrl+self.DATA_FILE, function(chordData)
        {
            if(chordData!=null)
            {
                self.chordData = chordData;

                // Pido el fichero de eventos

                d3.json(self.baseJUrl+self.EVENTS_FILE, function(eventsData)
                {

                    if(eventsData!=null)
                    {
                        self.eventsData = eventsData;

                        self.dataDict = self.chordData['data'];

                        // Recorro los datos y apunto la fecha minima y maxima

                        for (var key in self.dataDict){

                            if (key<self.minDate){
                                self.minDate = key;
                            }
                            if(key>self.maxDate){
                                self.maxDate = key;
                            }
                        }


                        // paso la minDate y maxDate a moment format

                        self.minDate = moment(self.minDate, "YYYYMMDD");

                        self.maxDate = moment(self.maxDate, "YYYYMMDD");

                        self.nowDate = self.minDate.clone();

                        // Y calculo el número de días

                        self.numDays = self.maxDate.diff(self.minDate.clone(),'days');

                        function dateCallBack(nowDate)
                        {

                            // Limpio el stack de timeouts

                            for(i=0;i<self.toStack.length;i++)
                            {
                                clearTimeout(self.toStack[i]);
                            }

                            self.toStack = [];

                            // Si no estoy en una trasicion del chordChart...

                            if(!self.chordChart.onTransition)
                            {

                                self.nowDate = nowDate;

                                // Actualizo el chordChart

                                self.matrixData = self.chordData['data'][self.nowDate.clone().format("YYYYMMDD")][self.dataIn];
                                self.labelData = self.chordData['data_label'];

                                var legendDict = self.buildLegendDict();

                                self.chordChart.render(self.matrixData,self.labelData,self.dataOut,self.datumLabel[self.dataIn],legendDict);

                                // Actualizo el div de eventos

                                if(self.eventsData[nowDate.clone().format("YYYYMMDD")])
                                {
                                    self.rellenaEventInfo(self.eventsData[nowDate.clone().format("YYYYMMDD")]);
                                }
                                else
                                {
                                    self.rellenaEventInfo("");
                                }

                            }
                            // Si estoy en una transicion, genero un 'sleep' de 100 ms y meto el timer
                            // en el stack de timeouts
                            else
                            {

                                var newTimeOut= setTimeout(dateCallBack,100,nowDate);
                                self.toStack.push(newTimeOut);
                            }

                        }

                        // Instancio el objeto Slider

                        self.mySlider = tdviz.extras.dateSlider(
                            {
                                'parentId': "zonaFecha",
                                'className': "chord",
                                'imgPath': self.imgPath,
                                'beginDate': self.minDate,
                                'endDate': self.maxDate,
                                'callBack': dateCallBack,
                                'interval':2000,
                                'myLog': myLog
                            });


                        // Primer render con nowDate = primer dia

                        self.nowDate = self.minDate.clone();

                        dateCallBack(self.nowDate);

                        // Opciones de render. Si se modifican se llama al callBack

                        $('input[name="dataIn"]').change(function(){

                            self.dataIn = this.value;

                            dateCallBack(self.nowDate);
                        });

                        $('input[name="dataOut"]').change(function(){

                            self.dataOut = this.value;

                            dateCallBack(self.nowDate);
                        });

                    }
                    else
                    {
                        myLog("Could not load file: "+self.baseJUrl+self.EVENTS_FILE,1);
                    }
                });
            }
            else
            {
                myLog("Could not load file: "+self.baseJUrl+self.DATA_FILE,1);
            }
        });

    });
}

tdviz.controller.map = function(options)
{

    // Referencia a esta instancia

    var self = {};

    // Global vars

    self.DATA_FILE = "mapDataset.json";
    self.EVENTS_FILE = "events.json";
    self.ACTIVE_USERS_FILE = "activeUsers.json";


    self.minDate = "21000101";
    self.maxDate = "19900101";
    self.nowDate = null;
    self.numDays = 0;



    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#"+self.idName;


    // Copies

    self.MORE_INFO = [
        'Mouse over a country to see the exact number of communications.<br><br>',
        'Click on a country to explore international connections. You can mouse over every connection aftwerwards<br>',
        '<br><a href="img/countries.png" target="_blank">Here</a> you can find the full list of countries involved in the dataset'
    ].join('\t');

    self.NO_EVENT_STRING = "None";

    self.dataIn = "mens";
    self.dataOut = "bigger";

    self.datumLabel = {
        'mens':"messages",
        'voip':"calls"
    }


    self.detailText = "Detailed Info";

    self.idInfo = "mapInfo";
    self.classInfoHeader = "mapInfoHeader";
    self.eventInfo = "newsContent";

    // Funciones de copies

    self.displayCountryConnections = function (country,conNumber)
    {
        var html="";

        html+="<b>"+country+"</b><br>";
        html+=conNumber +" "+self.datumLabel[self.dataIn]+"<br>";
        return html;
    }

    self.removeCountryInfo = function(d,i)
    {

        $("#"+self.idInfo).html(self.MORE_INFO);
    }

    self.displayCountryInfo = function(d,i)
    {
        var countryISO = d.properties.ISO3;
        var countryName = d.properties.NAME;
        var dayVolume = self.dataVolume[self.nowDate.clone().format("YYYYMMDD")];
        var numComms = dayVolume[i]['internacionales']['salientes'][self.dataIn]+dayVolume[i]['internacionales']['entrantes'][self.dataIn]+dayVolume[i]['nacionales'][self.dataIn];
        var itlComms = dayVolume[i]['internacionales']['salientes'][self.dataIn]+dayVolume[i]['internacionales']['entrantes'][self.dataIn];
        var itlPercent = itlComms==0 ? 0: ((itlComms/numComms)*100).toFixed(2);
        var incoming = dayVolume[i]['internacionales']['entrantes'][self.dataIn];
        var outgoing = dayVolume[i]['internacionales']['salientes'][self.dataIn];
        var activeUsers = self.activeData[self.nowDate.clone().format("YYYYMMDD")][countryISO];

        // Los usuarios activos pueden venir vacios...

        if(!activeUsers) activeUsers=0;

        var html="";

        html+='<span class="'+self.classInfoHeader+'">'+self.detailText+'</span><br><br>';

        html+='<b>'+countryName+'</b> ('+countryISO+')<br><br>';

        html+="Total "+self.datumLabel[self.dataIn]+": "+numComms+'<br>';
        html+="International "+self.datumLabel[self.dataIn]+": "+itlPercent+"%"+'<br>';
        html+="Incoming "+self.datumLabel[self.dataIn]+": "+incoming+'<br>';
        html+="Outgoing "+self.datumLabel[self.dataIn]+": "+outgoing+'<br><br>';

        html+="<b>Active Users: " + activeUsers+"</b>";

        $("#"+self.idInfo).html(html);
    }

    // Funciones auxiliares

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }

    self.rellenaEventInfo = function(message)
    {
        var html="";

        $("#"+self.eventInfo).html(message);

        if(message=="")
        {
            $("#"+self.eventInfo).toggleClass("activeEvent",false);
        }
        else
        {
            $("#"+self.eventInfo).toggleClass("activeEvent",true);
        }

    }

    // Construccion de la leyenda del chart

    self.buildLegendDict = function()
    {
        var dict = {};

        var total = 0;
        var totalOut = 0;
        var type = self.dataIn;

        var datos = self.dataVolume[self.nowDate.clone().format("YYYYMMDD")];

        for (i=0;i<datos.length;i++)
        {
            total+= datos[i]['internacionales']['salientes'][type];
            total+= datos[i]['internacionales']['entrantes'][type];
            total+= datos[i]['nacionales'][type];

        }

        dict['big'] = total + " "+self.datumLabel[type].charAt(0).toUpperCase() + self.datumLabel[type].slice(1);

        dict['small'] = "";

        return dict;
    }

    // El document ready

    $(document).ready(function()
    {
        // El cache del servidor manda

        $.ajaxSetup({cache: true});

        // Inyecto el html

        var injectString =
            ['<div id="contenedorTodo" class="contenedorTodo">',
                '<div id="zonaFecha" class="zonaFecha">',
                '</div>',
                '<div id="contenedorCI" class="contenedorCI">',
                '<div id="zonaChart" class="zonaChart">',
//                        '<div id="chartHeader" class="chartHeader">Chart</div>',
            '<div id="chartContent" class="chartContent"></div>',
            '</div>',
            '<div id="zonaInfo" class="zonaInfo">',
            '<div class="news">',
            '<div class="newsHeader">',
            '<div id="newsContent" class="newsContent">',
            '</div>',
            '</div>',
            '</div>',
            '<div class="opcionesHeader">Service type</div>',
            '<div class="opcionesContent">',
            '<form>',
            '<label><input type="radio" name="dataIn" value="mens" checked> Instant Message</label><br>',
            '<label><input type="radio" name="dataIn" value="voip"> VoIP call</label>',
            '</form>',
            '</div>',
            '<div class="opcionesHeader">Connection flow</div>',
            '<div class="opcionesContent">',
            '<form>',
            '<label><input type="radio" name="connType" value="out" checked> Outgoing</label><br>',
            '<label><input type="radio" name="connType" value="in"> Incoming</label>',
            '</form>',
            '</div>',
            '<div class="mapInfoContent" id="mapInfo">'+self.MORE_INFO+'</div>',
            '</div>',
            '</div>',
            '<div id="footer" class="footer"></div>'
        ].join('\n');


        $(self.parentSelect).html(injectString);


        // Escalas y tablas auxiliares

//        var aScale = ["#FEEBE2","#FBB4B9","#F768A1","#C51B8A","#7A0177"];
//        var bScale = ["#FFFFB2","#FECC5C","#FD8D3C","#F03B20","#BD0026"];
//        var cScale = ["#FEF0D9","#FDCC8A","#FC8D59","#E34A33","#B30000"];
//        var dScale = ["#EEE","#FBB4B9","#F768A1","#C51B8A","#7A0177"];


        var aScale = ["#EEE0E0","#FEEBE2","#FBB4B9","#F768A1","#C51B8A"];
        var bScale = ["#FFFFB2","#FECC5C","#FD8D3C","#F03B20","#BD0026"];
        var cScale = ["#EEE0D7","#FEF0D9","#FDCC8A","#FC8D59","#E34A33"];
        var dScale = ["#EEE","#FBB4B9","#F768A1","#C51B8A","#7A0177"];


        self.colorScale =
        {

            'init':d3.scale.linear().domain([0,1000]).range(["#DDD","#F00"]),
            'mens':d3.scale.linear().domain([0,10,100,1000,10000]).range(aScale).clamp(true),

            'voip':d3.scale.linear().domain([0,10,100,1000,2000]).range(cScale).clamp(true),

            'cmens':d3.scale.linear().domain([1,100]).range([0.5,1]).clamp(true),
            'cvoip':d3.scale.log().domain([1,200]).range([0.5,1]).clamp(true)

        }


        self.mapChart = tdviz.viz.mapDiagram(
            {
                'idName':"chartContent",
                'idInfo': self.idInfo,
                'width':760,
                'transTime':1500,
                'loadingMessage':"Loading data...",
                'colorScale': self.colorScale,
                'displayCountryInfo': self.displayCountryInfo,
                'removeCountryInfo': self.removeCountryInfo,
                'displayCountryConnections':self.displayCountryConnections,
                'myLog':myLog
            });

        d3.json(self.baseJUrl+self.DATA_FILE, function(mapData)
        {
            if(mapData!=null)
            {
                self.dataMap = mapData['data_label'];
                self.dataVolume = mapData['data']['volume'];
                self.dataConnection = mapData['data']['connections'];

                // Pido el fichero de eventos

                d3.json(self.baseJUrl+self.EVENTS_FILE, function(eventsData)
                {

                    if(eventsData!=null)
                    {
                        self.eventsData = eventsData;

                        // Pido el fichero de usuarios activos

                        d3.json(self.baseJUrl+self.ACTIVE_USERS_FILE,function(activeData)
                        {

                            if(activeData!=null)
                            {

                                self.activeData = activeData

                                // Recorro los datos y apunto la fecha minima y maxima

                                for (var key in self.dataVolume)
                                {

                                    if (key<self.minDate)
                                    {
                                        self.minDate = key;
                                    }

                                    if(key>self.maxDate)
                                    {
                                        self.maxDate = key;
                                    }
                                }


                                // paso la minDate y maxDate a moment format

                                self.minDate = moment(self.minDate, "YYYYMMDD");

                                self.maxDate = moment(self.maxDate, "YYYYMMDD");

                                self.nowDate = self.minDate.clone();

                                // Y calculo el número de días

                                self.numDays = self.maxDate.diff(self.minDate.clone(),'days');


                                function dateCallBack(nowDate)
                                {
                                    self.nowDate = nowDate;

                                    var datosC = self.dataConnection[self.nowDate.clone().format("YYYYMMDD")];


                                    self.mapChart.drawHeatMap(self.dataVolume[self.nowDate.clone().format("YYYYMMDD")],self.dataConnection[self.nowDate.clone().format("YYYYMMDD")],self.dataIn,self.buildLegendDict(),self.mySlider);

                                    // Actualizo el div de eventos

                                    if(self.eventsData[nowDate.clone().format("YYYYMMDD")])
                                    {
                                        self.rellenaEventInfo(self.eventsData[nowDate.clone().format("YYYYMMDD")]);
                                    }
                                    else
                                    {
                                        self.rellenaEventInfo("");
                                    }

                                }

                                // Instancio el objeto Slider

                                self.mySlider = tdviz.extras.dateSlider(
                                    {
                                        'parentId': "zonaFecha",
                                        'className': self.className,
                                        'imgPath': self.imgPath,
                                        'beginDate': self.minDate,
                                        'endDate': self.maxDate,
                                        'callBack': dateCallBack,
                                        'interval':2000,
                                        'myLog': myLog
                                    });

                                self.nowDate = self.minDate.clone();

                                // Dibujo los polys del mapa

                                self.mapChart.drawMap(self.dataMap);

                                dateCallBack(self.nowDate);

                                // Opciones de render

                                $('input[name="dataIn"]').change(function(){

                                    self.dataIn = this.value;

                                    self.mapChart.drawHeatMap(self.dataVolume[self.nowDate.clone().format("YYYYMMDD")],self.dataConnection[self.nowDate.clone().format("YYYYMMDD")],self.dataIn,self.buildLegendDict(),self.mySlider);

                                });

                                $('input[name="connType"]').change(function(){

                                    self.mapChart.connType = this.value;
                                    self.mapChart.removeChords();
                                });

                            }
                            else
                            {
                                myLog("Could not load file: "+self.baseJUrl+self.ACTIVE_USERS_FILE,1);
                            }

                        });

                    }
                    else
                    {
                        myLog("Could not load file: "+self.baseJUrl+self.EVENTS_FILE,1);
                    }

                });

            }
            else
            {
                myLog("Could not load file: "+self.baseJUrl+self.DATA_FILE,1);
            }

        });


    });

    return self;
}


tdviz.controller.wordCloud = function(options)
{

    // Referencia a esta instancia

    var self = {};

    // Global vars


    self.minDate = "21000101";
    self.maxDate = "19900101";
    self.nowDate = null;
    self.numDays = 0;



    for (key in options){
        self[key] = options[key];
    }

    self.DATA_FILE = self.dataFile;

    self.parentSelect = "#"+self.idName;


    // Copies

    self.MORE_INFO = [
        'Opciones concretas'
    ].join('\t');

    self.NO_EVENT_STRING = "None";


    self.detailText = "Detailed Info";

    self.idInfo = "wordInfo";
    self.classInfoHeader = "wordInfoHeader";
    self.eventInfo = "newsContent";

    // Funciones auxiliares

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }

    // El document ready

    $(document).ready(function()
    {
        // El cache del servidor manda

        $.ajaxSetup({cache: true});

        // Inyecto el html

        var injectString =
            ['<div id="contenedorTodo" class="contenedorTodo">',
                '<div id="zonaFecha" class="zonaFecha">',
                '</div>',
                '<div id="contenedorCI" class="contenedorCI">',
                '<div id="zonaChart" class="zonaChart">',
//                        '<div id="chartHeader" class="chartHeader">Chart</div>',
            '<div id="chartContent" class="chartContent"></div>',
            '</div>',
            '<div id="zonaInfo" class="zonaInfo">',
            '<div class="news">',
            '<div class="newsHeader">',
            '<div id="newsContent" class="newsContent">',
            '</div>',
            '</div>',
            '</div>',
            '<div class="opcionesHeader">Opciones</div>',
            '<div class="opcionesContent">',
            '<form>',
//            '<label><input type="radio" name="dataIn" value="mens" checked> Instant Message</label><br>',
//            '<label><input type="radio" name="dataIn" value="voip"> VoIP call</label>',
            '</form>',
            '</div>',
            '<div class="opcionesHeader">Información</div>',
            '<div class="opcionesContent">',
            '</div>',
            '<div class="mapInfoContent" id="mapInfo">'+self.MORE_INFO+'</div>',
            '</div>',
            '</div>',
            '<div id="footer" class="footer"></div>'
        ].join('\n');


        $(self.parentSelect).html(injectString);


//        var aScale = ["#EEE0E0","#FEEBE2","#FBB4B9","#F768A1","#C51B8A"];
//        var bScale = ["#FFFFB2","#FECC5C","#FD8D3C","#F03B20","#BD0026"];
//        var cScale = ["#EEE0D7","#FEF0D9","#FDCC8A","#FC8D59","#E34A33"];
//        var dScale = ["#EEE","#FBB4B9","#F768A1","#C51B8A","#7A0177"];


//        self.colorScale =
//        {
//
////            'one':d3.scale.linear().domain([0,1000]).range(["#DDD","#F00"]),
////            'two':d3.scale.linear().domain([0,10,100,1000,10000]).range(aScale).clamp(true),
////
////            'three':d3.scale.linear().domain([0,10,100,1000,2000]).range(cScale).clamp(true),
////
////            'four':d3.scale.linear().domain([1,100]).range([0.5,1]).clamp(true),
//
//        }

          self.colorScale = d3.scale.linear().domain([0,1000]).range(["#DDD","#F00"]);

          self.opacityScale = d3.scale.linear().domain([7,40]).range([0.3, 1.0]);


        self.cloudChart = tdviz.viz.wordCloud(
            {
                'idName':"chartContent",
                'idInfo': self.idInfo,
                'width':600,
                'height':300,
                'transTime':1500,
                'opacityScale': self.opacityScale,
                'loadingMessage':"Loading data...",
                'colorScale': self.colorScale,
                'font': self.font,
                'padding': self.padding,
                'myLog':myLog
            });

        d3.json(self.baseJUrl+self.DATA_FILE, function(wordData)
        {
                    if(wordData!=null)
                    {
                            self.wordData = wordData;

                            // Recorro los datos y apunto la fecha minima y maxima

                            for (var key in self.wordData)
                            {

                                if (key<self.minDate)
                                {
                                    self.minDate = key;
                                }

                                if(key>self.maxDate)
                                {
                                    self.maxDate = key;
                                }
                            }


                            // paso la minDate y maxDate a moment format

                            self.minDate = moment(self.minDate, "YYYYMMDD");

                            self.maxDate = moment(self.maxDate, "YYYYMMDD");

                            self.nowDate = self.minDate.clone();

                            // Y calculo el número de días

                            self.numDays = self.maxDate.diff(self.minDate.clone(),'days');


                            function dateCallBack(nowDate)
                            {
                                self.nowDate = nowDate;

                                console.log("En el callback");

                                console.log(self.nowDate.clone().format("YYYYMMDD"));

                                //Aqui hago un render con   self.nowDate.clone().format("YYYYMMDD")];

                                self.cloudChart.render(self.wordData[self.nowDate.clone().format("YYYYMMDD")]['instant'],self.nowDate.clone());


                            }

                            // Instancio el objeto Slider

                            self.mySlider = tdviz.extras.dateSlider(
                                {
                                    'parentId': "zonaFecha",
                                    'className': self.className,
                                    'imgPath': self.imgPath,
                                    'beginDate': self.minDate,
                                    'endDate': self.maxDate,
                                    'callBack': dateCallBack,
                                    'interval':2000,
                                    'myLog': myLog
                                });


                            self.nowDate = self.minDate.clone();

                            // AQui instacio el objeto

                            dateCallBack(self.nowDate);

                    }
                    else
                    {
                        myLog("Could not load file: "+self.baseJUrl+self.DATA_FILE,1);
                    }
        });

    });

}

tdviz.controller.circlePacking = function(options)
{

    // Referencia a esta instancia

    var self = {};

    // Global vars


    self.minDate = "21000101";
    self.maxDate = "19900101";
    self.nowDate = null;
    self.numDays = 0;



    for (key in options){
        self[key] = options[key];
    }

    self.DATA_FILE = self.dataFile;

    self.parentSelect = "#"+self.idName;


    // Copies

    self.MORE_INFO = [
        'Opciones concretas'
    ].join('\t');

    self.NO_EVENT_STRING = "None";


    self.detailText = "Detailed Info";

    self.idInfo = "wordInfo";
    self.classInfoHeader = "wordInfoHeader";
    self.eventInfo = "newsContent";

    // Funciones auxiliares

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }

    // El document ready

    $(document).ready(function()
    {
        // El cache del servidor manda

        $.ajaxSetup({cache: true});

        // Inyecto el html

        var injectString =
            ['<div id="contenedorTodo" class="contenedorTodo">',
                '<div id="zonaFecha" class="zonaFecha">',
                '</div>',
                '<div id="contenedorCI" class="contenedorCI">',
                '<div id="zonaChart" class="zonaChart">',
//                        '<div id="chartHeader" class="chartHeader">Chart</div>',
            '<div id="chartContent" class="chartContent"></div>',
            '</div>',
            '<div id="zonaInfo" class="zonaInfo">',
            '<div class="news">',
            '<div class="newsHeader">',
            '<div id="newsContent" class="newsContent">',
            '</div>',
            '</div>',
            '</div>',
            '<div class="opcionesHeader">Opciones</div>',
            '<div class="opcionesContent">',
            '<form>',
//            '<label><input type="radio" name="dataIn" value="mens" checked> Instant Message</label><br>',
//            '<label><input type="radio" name="dataIn" value="voip"> VoIP call</label>',
            '</form>',
            '</div>',
            '<div class="opcionesHeader">Información</div>',
            '<div class="opcionesContent">',
            '</div>',
            '<div class="mapInfoContent" id="mapInfo">'+self.MORE_INFO+'</div>',
            '</div>',
            '</div>',
            '<div id="footer" class="footer"></div>'
        ].join('\n');


        $(self.parentSelect).html(injectString);


//        var aScale = ["#EEE0E0","#FEEBE2","#FBB4B9","#F768A1","#C51B8A"];
//        var bScale = ["#FFFFB2","#FECC5C","#FD8D3C","#F03B20","#BD0026"];
//        var cScale = ["#EEE0D7","#FEF0D9","#FDCC8A","#FC8D59","#E34A33"];
//        var dScale = ["#EEE","#FBB4B9","#F768A1","#C51B8A","#7A0177"];


//        self.colorScale =
//        {
//
////            'one':d3.scale.linear().domain([0,1000]).range(["#DDD","#F00"]),
////            'two':d3.scale.linear().domain([0,10,100,1000,10000]).range(aScale).clamp(true),
////
////            'three':d3.scale.linear().domain([0,10,100,1000,2000]).range(cScale).clamp(true),
////
////            'four':d3.scale.linear().domain([1,100]).range([0.5,1]).clamp(true),
//
//        }

        self.colorScale = d3.scale.linear().domain([0,1000]).range(["#DDD","#F00"]);

//        self.wordChart = tdviz.viz.wordDiagram(
//            {
//                'idName':"chartContent",
//                'idInfo': self.idInfo,
//                'width':760,
//                'transTime':1500,
//                'loadingMessage':"Loading data...",
//                'colorScale': self.colorScale,
//                'myLog':myLog
//            });

        d3.json(self.baseJUrl+self.DATA_FILE, function(wordData)
        {
            if(wordData!=null)
            {
                self.wordData = wordData;

                // Recorro los datos y apunto la fecha minima y maxima

                for (var key in self.wordData)
                {

                    if (key<self.minDate)
                    {
                        self.minDate = key;
                    }

                    if(key>self.maxDate)
                    {
                        self.maxDate = key;
                    }
                }


                // paso la minDate y maxDate a moment format

                self.minDate = moment(self.minDate, "YYYYMMDD");

                self.maxDate = moment(self.maxDate, "YYYYMMDD");

                self.nowDate = self.minDate.clone();

                // Y calculo el número de días

                self.numDays = self.maxDate.diff(self.minDate.clone(),'days');


                function dateCallBack(nowDate)
                {
                    self.nowDate = nowDate;

                    //Aqui hago un render con        self.nowDate.clone().format("YYYYMMDD")];

                    console.log("En el callback");

                }

                // Instancio el objeto Slider

                self.mySlider = tdviz.extras.dateSlider(
                    {
                        'parentId': "zonaFecha",
                        'className': self.className,
                        'imgPath': self.imgPath,
                        'beginDate': self.minDate,
                        'endDate': self.maxDate,
                        'callBack': dateCallBack,
                        'interval':2000,
                        'myLog': myLog
                    });


                self.nowDate = self.minDate.clone();

                // AQui instacio el objeto

                dateCallBack(self.nowDate);

            }
            else
            {
                myLog("Could not load file: "+self.baseJUrl+self.DATA_FILE,1);
            }
        });

    });

}


tdviz.controller.esqueleto_WORD = function(options)
{

    // Referencia a esta instancia

    var self = {};

    // Global vars


    self.minDate = "21000101";
    self.maxDate = "19900101";
    self.nowDate = null;
    self.numDays = 0;



    for (key in options){
        self[key] = options[key];
    }

    self.DATA_FILE = self.dataFile;

    self.parentSelect = "#"+self.idName;


    // Copies

    self.MORE_INFO = [
        'Opciones concretas'
    ].join('\t');

    self.NO_EVENT_STRING = "None";


    self.detailText = "Detailed Info";

    self.idInfo = "wordInfo";
    self.classInfoHeader = "wordInfoHeader";
    self.eventInfo = "newsContent";

    // Funciones auxiliares

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }

    // El document ready

    $(document).ready(function()
    {
        // El cache del servidor manda

        $.ajaxSetup({cache: true});

        // Inyecto el html

        var injectString =
            ['<div id="contenedorTodo" class="contenedorTodo">',
                '<div id="zonaFecha" class="zonaFecha">',
                '</div>',
                '<div id="contenedorCI" class="contenedorCI">',
                '<div id="zonaChart" class="zonaChart">',
//                        '<div id="chartHeader" class="chartHeader">Chart</div>',
            '<div id="chartContent" class="chartContent"></div>',
            '</div>',
            '<div id="zonaInfo" class="zonaInfo">',
            '<div class="news">',
            '<div class="newsHeader">',
            '<div id="newsContent" class="newsContent">',
            '</div>',
            '</div>',
            '</div>',
            '<div class="opcionesHeader">Opciones</div>',
            '<div class="opcionesContent">',
            '<form>',
//            '<label><input type="radio" name="dataIn" value="mens" checked> Instant Message</label><br>',
//            '<label><input type="radio" name="dataIn" value="voip"> VoIP call</label>',
            '</form>',
            '</div>',
            '<div class="opcionesHeader">Información</div>',
            '<div class="opcionesContent">',
            '</div>',
            '<div class="mapInfoContent" id="mapInfo">'+self.MORE_INFO+'</div>',
            '</div>',
            '</div>',
            '<div id="footer" class="footer"></div>'
        ].join('\n');


        $(self.parentSelect).html(injectString);


//        var aScale = ["#EEE0E0","#FEEBE2","#FBB4B9","#F768A1","#C51B8A"];
//        var bScale = ["#FFFFB2","#FECC5C","#FD8D3C","#F03B20","#BD0026"];
//        var cScale = ["#EEE0D7","#FEF0D9","#FDCC8A","#FC8D59","#E34A33"];
//        var dScale = ["#EEE","#FBB4B9","#F768A1","#C51B8A","#7A0177"];


//        self.colorScale =
//        {
//
////            'one':d3.scale.linear().domain([0,1000]).range(["#DDD","#F00"]),
////            'two':d3.scale.linear().domain([0,10,100,1000,10000]).range(aScale).clamp(true),
////
////            'three':d3.scale.linear().domain([0,10,100,1000,2000]).range(cScale).clamp(true),
////
////            'four':d3.scale.linear().domain([1,100]).range([0.5,1]).clamp(true),
//
//        }

        self.colorScale = d3.scale.linear().domain([0,1000]).range(["#DDD","#F00"]);

//        self.wordChart = tdviz.viz.wordDiagram(
//            {
//                'idName':"chartContent",
//                'idInfo': self.idInfo,
//                'width':760,
//                'transTime':1500,
//                'loadingMessage':"Loading data...",
//                'colorScale': self.colorScale,
//                'myLog':myLog
//            });

        d3.json(self.baseJUrl+self.DATA_FILE, function(wordData)
        {
            if(wordData!=null)
            {
                self.wordData = wordData;

                // Recorro los datos y apunto la fecha minima y maxima

                for (var key in self.wordData)
                {

                    if (key<self.minDate)
                    {
                        self.minDate = key;
                    }

                    if(key>self.maxDate)
                    {
                        self.maxDate = key;
                    }
                }


                // paso la minDate y maxDate a moment format

                self.minDate = moment(self.minDate, "YYYYMMDD");

                self.maxDate = moment(self.maxDate, "YYYYMMDD");

                self.nowDate = self.minDate.clone();

                // Y calculo el número de días

                self.numDays = self.maxDate.diff(self.minDate.clone(),'days');


                function dateCallBack(nowDate)
                {
                    self.nowDate = nowDate;

                    //Aqui hago un render con        self.nowDate.clone().format("YYYYMMDD")];

                    console.log("En el callback");

                }

                // Instancio el objeto Slider

                self.mySlider = tdviz.extras.dateSlider(
                    {
                        'parentId': "zonaFecha",
                        'className': self.className,
                        'imgPath': self.imgPath,
                        'beginDate': self.minDate,
                        'endDate': self.maxDate,
                        'callBack': dateCallBack,
                        'interval':2000,
                        'myLog': myLog
                    });


                self.nowDate = self.minDate.clone();

                // AQui instacio el objeto

                dateCallBack(self.nowDate);

            }
            else
            {
                myLog("Could not load file: "+self.baseJUrl+self.DATA_FILE,1);
            }
        });

    });

}


// dateSlider implementation w/ configurable step
// params:
// parentId: Id of DOM Container
// className: Class of DOM Container
// imgPath: path to image access
// beginDate: first day
// endDate: last day
// callback: Function to call on date change
// myLog: Custom log from parent [w/ logging levels]
// interval: ms between auto date change
// increment: day step between slider change

tdviz.extras.dateSlider = function(options)
{
    var self = {};

    // Pillo los parametros como global vars

    // Pongo lo que me venga por opciones en el self

    for (key in options){
        self[key] = options[key];
    }

    self.increment = self.increment || 1;

    self.parentSelect = "#" + self.parentId;

    // Global de playing

    self.playing = false;



    self.init = function ()
    {

        var injectString =
            ['<div class="play"><img class="playImg" src="'+self.imgPath+'play-on.gif" height="25" width="25"></div>',
                '<div class="slider"></div>',
                '<div class="fechaText"></div>'
            ].join('\n');

        $(self.parentSelect).html(injectString);

        // Inserto el componente slider

        var sliderSelect = self.parentSelect + " .slider";

        // Y calculo el número de días

        self.numDays = self.endDate.clone().diff(self.beginDate.clone(),'days')+1;

        self.nowDate = self.beginDate.clone();

        self.slider = $(sliderSelect).slider({
            value:1,
            min: 1,
            max: self.numDays,
            step: self.increment,
            disabled: false
        });

        // Pongo el contenido de la fecha inicial

        $(self.parentSelect+" .fechaText").html(self.nowDate.format("DD.MM.YYYY"));



        // Ato el evento del cambio de slider

        self.slider.bind( "slidechange", function(event, ui)
        {

            self.nowDate = self.beginDate.clone().add('days',ui.value-1);

            $(self.parentSelect+" .fechaText").html(self.nowDate.format("DD.MM.YYYY"));

            // Y llamo al callback

            self.callBack(self.nowDate.clone());
        });

        // Voy con las alarmas y los clicks

        self.avanzaPlay = function ()
        {

            if((self.playing==true) && (self.nowDate<self.endDate))
            {


                self.nowDate = self.nowDate.clone().add('days',self.increment);


                $( self.parentSelect + " .slider" ).slider('value', $( self.parentSelect + " .slider" ).slider('value') + self.increment);
            }

            // Es el ultimo dia: me paro y pongo a play el boton (estoy en pause)

            var myDiff = self.endDate.clone().diff(self.nowDate,'days');


            if ((self.playing==true) && (self.endDate.clone().diff(self.nowDate,'days')<1))
            {
                $(self.parentSelect+" .play").html('<img src="'+self.imgPath+'play-on.gif" height="25" width="25">');
                self.playing = false;
            }

        }

        // Manejo de play/pause


        $(self.parentSelect+" .play").click(function (){

            self.myLog("pinchadoDate",3);

            if(self.playing==false)
            {

                // Si esta parado, pero estoy en el ultimo dia...

                if((self.endDate.clone().diff(self.nowDate.clone(),'days')<1))
                {
                    clearInterval(self.refreshId);

                    self.nowDate = self.beginDate.clone().add('days',0);

                    $(self.parentSelect + " .slider" ).slider('value', 1);

                    self.refreshId = setInterval(self.avanzaPlay, self.interval);
                }

                self.playing = true;

                $(self.parentSelect+" .play").html('<img src="'+self.imgPath+'pause-on.gif" height="25" width="25">');

            }
            else
            {

                self.playing = false;

                $(self.parentSelect+" .play").html('<img src="'+self.imgPath+'play-on.gif" height="25" width="25">');

            }

        });

        self.refreshId = setInterval(self.avanzaPlay, self.interval);

        // NOOOOO--> Condicion de carrera

        // Llamo al callback para la fecha de ahora [primer render]

        //this.callBack.call(this.nowDate.clone());


        // Bug del setInterval de javascript: Cuando me cambio de ventana, me paro

        window.addEventListener('blur', function() {
            self.playing = false;

            $(self.parentSelect+" .play").html('<img src="'+self.imgPath+'play-on.gif" height="25" width="25">');

        });

    }

    self.init();

    return self;
}
