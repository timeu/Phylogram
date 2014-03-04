/*
  phylogram.js
  A D3-based phylogram visualization 
 
  The MIT License (MIT)
  
  Copyright (c) 2014 Ümit Seren
  
  Permission is hereby granted, free of charge, to any person obtaining a copy of
  this software and associated documentation files (the "Software"), to deal in
  the Software without restriction, including without limitation the rights to
  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
  the Software, and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
  FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE..
 
  DOCUMENTATION
 
  var data ... TREE DATA (newick or nested list)
  var metaInfo .... Lookup map key = name in nested list/newick and value = map with values
 
  var chart = phylogram().width(800).height(800).lookupMap(metaInfo);
  
  d3.select('#chart')
        .selectAll('svg')
        .data([data])
        .enter()
        .append('svg')
        .call(chart);
*/

function phylogram() {
  var margin = {top:20,right:20,bottom:20,left:20},
      width = null,
      height = null, 
      vis = null, 
      container = null,
      layout = null,
      data = null,
      nodes = null, 
      y = null,
      x = null,
      isRadial = false,
      xAxis = null,
      xAxisGroup = null,
      diagonal = null,
      zoom = null,
      lookupMap = null, 
      fill = null,
      colors60 = null,
      
      colorLegend = null,
      colorLegendMap = null,
      colorLegendType = '',
      colorLegendList = null,
      colorLegendScale = null,
      colorLegendDropDown = null,
      
      colorBandLegend =  null,
      colorBandLegendHeight = 50,
      colorBandScale = null,
      
      sizeLegend = null,
      sizeLegendMap = null,
      sizeLegendType = '',
      sizeLegendList = null,
      sizeLegendScale = null,
      sizeLegendDropDown = null,
      sizeCircleRadius = 25,
      sizeCircleLine = null,
      sizeCircleRadiusScale = null,
      scaleBranchLength = true,
      svg = null,
      gradient = null,
      tooltip = null,
      scale = 1,
      maxDist = 0,
      pointBaseScale = 1,
      scaleFactor = 0.15,
      radius = null,
      labelWidth = 0;
      
  
      
  function chart(selection) {
    selection.each(function(d) {
      container = d3.select(this).append("div").attr("id","chart").style("position","relative");
      data = d;
      chart.init();
      chart.draw();
    });
  }
  
  chart.init =  function() {
    
    colors60 = ['#e62e40', '#e62e53', '#e62e65', '#e62e77', '#e62e8a', '#e62e9c', '#e62eae', '#e62ec1', '#e62ed3', '#e62ee6', '#d32ee6', '#c12ee6', '#ae2ee6', '#9c2ee6', '#8a2ee6', '#772ee6', '#652ee6', '#532ee6', '#402ee6', '#2e2ee6', '#2e40e6', '#2e53e6', '#2e65e6', '#2e77e6', '#2e8ae6', '#2e9ce6', '#2eaee6', '#2ec1e6', '#2ed3e6', '#2ee6e6', '#2ee6d3', '#2ee6c1', '#2ee6ae', '#2ee69c', '#2ee68a', '#2ee677', '#2ee665', '#2ee653', '#2ee640', '#2ee62e', '#40e62e', '#53e62e', '#65e62e', '#77e62e', '#8ae62e', '#9ce62e', '#aee62e', '#c1e62e', '#d3e62e', '#e6e62e', '#e6d32e', '#e6c12e', '#e6ae2e', '#e69c2e', '#e68a2e', '#e6772e', '#e6652e', '#e6532e', '#e6402e', '#e62e2e']
    
    chart.prepareData();
    
    tooltip = d3.select("body")
        .append("div")
      .attr("class","popup")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden");
    tooltip.append("ul");
    
    
    svg = container.append("svg:svg")
          .attr("width", width + margin.right+margin.left)
          .attr("height", height + margin.top + margin.bottom)
          .attr("pointer-events", "all");
     
      gradient = svg.append("svg:defs").append("svg:linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");
     
     
      var outergroup = svg.append("svg:g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
   var clippath = outergroup.append("clipPath")
          .attr("id","clip")
          .append('svg:rect')
          .attr('width', width+margin.right + margin.left)
          .attr('height', height);
    
    
    outergroup.append("svg:rect")      
      .attr("width",width)
      .attr("height",height)
      .style("fill","white");
    
    xAxisGroup = outergroup.append("g")
      .attr("class", "x axis")
      .style({'stroke': '#dddddd','shape-rendering': 'crispEdges','fill': '#dddddd', 'stroke-width': '1px','font-size':'8px'})
      .call(xAxis);
        
    vis = outergroup.append("svg:g");
    
    chart.prepareLayout();
      
      
    chart.initLegendControls();
    //add legend          
    colorLegend = outergroup.append("g")
          .attr("class","colorlegend");
          
          //add legend          
    sizeLegend = outergroup.append("g")
          .attr("class","sizelegend");
          
    chart.initSizeLegend();
          
    colorBandLegend = outergroup.append("g")  
      .attr("class","colorbandlegend");
    chart.initColorBandLegend();
    chart.changeLegendType();
    
  };
  
  chart.prepareLayout = function() {
     if (!isRadial) {
      vis.attr("clip-path", "url(#clip)")
        .attr("transform",null);
      xAxisGroup.style("display","block");
      container.select('#scalebranchcontrol').style("display","none");
    }
    else {
      vis.attr("transform","translate(" + radius + "," + radius + ")")
      .attr("clip-path",null);
      xAxisGroup.style("display","none");
      container.select('#scalebranchcontrol').style("display","block");
    }
    svg.select("g").call(zoom);
  };
  
  chart.prepareData = function() {
      if (!isRadial) {
      diagonal = this.rightAngleDiagonal();
    }
    else {
      diagonal = this.radialRightAngleDiagonal();
    }
    
    if (isRadial) {
      layout = d3.layout.tree()
      .size([360, 1])
      .sort(function(node) { return node.children ? node.children.length : -1; })
      .children(function(node) {
        return node.branchset
      })
      .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });
    }
    else {
      layout = d3.layout.cluster()
          .size([height,width])
          .sort(function(node) { return node.children ? node.children.length : -1; })
          .children(function(node) {
            return node.branchset;
          });
    }
    
    nodes = layout(data);
    
    this.calculateBasePointSize();
    
    
    y = d3.scale.linear()
        .domain([0, height])
        .range([0, height]);
        
    maxDist = chart.calculateBranchLengths(nodes);
    
    
    
    if (isRadial) {
      var maxRange = 1;
      if (scaleBranchLength) {
        maxRange = maxDist;
      }
      x = d3.scale.linear().domain([0,maxRange]).range([0, radius]);
    }
    else {
      x = d3.scale.linear()
        .domain([0,maxDist])
        .range([0, width]);
    }
    
        
    
    xAxis = d3.svg.axis()
      .scale(x)
      .ticks(10)
      .orient("top")
      .innerTickSize(-height)
      .outerTickSize(0);
      
    if (isRadial) {
      zoom = d3.behavior.zoom()
        .scaleExtent([1,Infinity])
        .translate([radius,radius])
        .on("zoom", this.rescale);
    }
    else {
      zoom = d3.behavior.zoom()
        .x(x)
        .y(y)
        .scaleExtent([1,Infinity])
        .on("zoom", this.rescale);
    }
  };
  
  
  chart.initSizeLegend = function() {
    
     sizeLegendScale = d3.scale.ordinal()
          .range([1]);
    
     var sizeCircleAngleScale = d3.scale.linear()
        .domain([0,49])
        .range([-Math.PI/2,Math.PI/2]);
        
     sizeCircleRadiusScale = d3.scale.linear().range([0,sizeCircleRadius]);
      
     sizeCircleLine = d3.svg.line.radial()
        .radius(sizeCircleRadius)
        .angle(function(d, i) { return sizeCircleAngleScale(i); });
        
    sizeLegend.append("path").datum(d3.range(50))
      .attr("id","sizecircle")
      .attr("d",sizeCircleLine)
      .style({"fill":"none","stroke":"#AFAFAF","stroke-width":"1px"})
      .attr("transform",function(d) {return "translate(" +(sizeCircleRadius)+","+sizeCircleRadius+")";});
    sizeLegend.append("text")
      .attr("id","sizemaxvalue")
      .style({"fill":"#AFAFAF","font-size":"10px"});
      
    var highlightContainer = sizeLegend.append("g")
      .attr("id","highlightcontainer")
      .style("opacity","0")
      .attr("transform",function(d) {return "translate(" +(0)+","+sizeCircleRadius+")";});
      
    highlightContainer.append("path").datum(d3.range(50))  
      .attr("id","highlightcircle")
      .attr("d",sizeCircleLine)
      .style({"fill":"#ddd","stroke":"black","stroke-width":"1.5px"});

    var hightlightValueContainer = highlightContainer.append("g");
      
    hightlightValueContainer.append("svg:rect")
      .attr("x",0)
      .attr("y",0)
      .attr("height","18px")
      .attr("width","30px")
      .style({"fill":"white","stroke":"#C2BFBF",'shape-rendering':'crispEdges'});
      
    hightlightValueContainer.append("svg:text")
      .attr("x",0)
      .attr("y",0)
      .attr("transform","translate(2,12)")
      .style({"fill":"black",'font-size':'10px'});
  };
  
  chart.initColorBandLegend = function() {
    
        
    colorBandLegend.append("svg:rect")
      .attr("y",0)
      .attr("width","15px")
      .attr("height",colorBandLegendHeight)
      .style("fill", "url(#gradient)");
    colorBandLegend.append("svg:g")
      .attr("id","bandaxis")
      .attr("transform","translate(15,0)")
      .style({'font-size':'10px'});
      
    var highlightBox = colorBandLegend.append("svg:g")
      .attr("id","bandhighlightvalue")
      .attr("transform","translate(12,0)")
      .style("opacity",0);
    
    highlightBox.append("svg:rect")
      .attr("x",0)
      .attr("y",0)
      .attr("height","18px")
      .attr("width","30px")
      .style({"fill":"white","stroke":"#C2BFBF",'shape-rendering':'crispEdges'});
      
    highlightBox.append("svg:text")
      .attr("x",0)
      .attr("y",0)
      .attr("transform","translate(2,12)")
      .style({"fill":"black",'font-size':'10px'});
  };
  
  chart.initLegendControls = function() {
    
    var colorLegendControl = container.insert("div",":first-child").attr("id","colorlegendcontrol").style("position","absolute");
     colorLegendControl.append("div")
      .style("color","#ccc")
      .style("font-size","10px")
      .text("Color");
    
    
     colorLegendDropDown = colorLegendControl.
       append("select")
      .attr("id","colorlegendSelect")
      .on("change",function(d) {
         chart.colorLegendType(this.options[this.selectedIndex].__data__);
     });
     
     
     var sizeLegendControl = container.insert("div",":first-child").attr("id","sizelegendcontrol").style("position","absolute");
     sizeLegendControl.append("div")
      .style("color","#ccc")
      .style("font-size","10px")
      .text("Size");
    
     sizeLegendDropDown  = sizeLegendControl.append("select")
      .attr("id","sizelegendSelect")
      .on("change",function(d) {
         chart.sizeLegendType(this.options[this.selectedIndex].__data__);
     });
     
    var scaleControl = container.insert("div",":first-child")
      .attr("id","scalebranchcontrol")
      .style("position","absolute")
      .style("display","none");

     scaleControl.append("input")
      .attr("type","checkbox")
      .attr("checked",function(d) { return "checked" ? scaleBranchLength : null;})
      .attr("id","scalebranchcheckbox")
      .on("change",function(d) {
         chart.scaleBranchLength(this.checked);
     });
     scaleControl.append("span")
      .text("Scale branch-length");
      
    var filterMap = d3.set([]);
    var sampleEntry = d3.map(lookupMap.values()[0]);

    
    var legendTypes = [{'name':'','isNumber':true}]
    
    legendTypes = legendTypes.concat(d3.set(
        sampleEntry
          .keys()
          .filter(function(d) {return !filterMap.has(d);})
      )
      .values()
        .map(function(d) { return {'name':d,'isNumber':!isNaN(sampleEntry.get(d))};}));
        
    colorLegendType = legendTypes[0];
    
    var colorLegendTypeOptions = colorLegendDropDown.selectAll("option")
      .data(legendTypes,function(d) {return d.name;});
    colorLegendTypeOptions.enter()
      .append("option")
        .attr("value",function(d) {
            return d.name;
            }
         )
        .text(function(d) {
          if (d.name == '') {
            return 'same color';
          }
          return d.name;});
    colorLegendTypeOptions.exit().remove();
    
    sizeLegendType = legendTypes[0];
    
    var sizeLegendTypeOptions = sizeLegendDropDown.selectAll("option")
      .data(legendTypes.filter(function(d) {return d.isNumber;}),function(d) {return d.name;});
    sizeLegendTypeOptions.enter()
      .append("option")
        .attr("value",function(d) {return d.name;})
        .text(function(d) {
          if (d.name == '') {
            return 'same size';
          }
          return d.name;
          });
    sizeLegendTypeOptions.exit().remove();
  };
  
  chart.draw = function() {
    this.drawPaths();
    this.drawNodes();
    this.styleNodes();
    isRendered = true;
  };
  
  
  
  chart.calculateBasePointSize = function() {
    var leafNodes = nodes.filter(function(d) {
       return !d.children ;
    }).length;
    pointBaseScale = Math.ceil((height/leafNodes)/4);
  };
 
  chart.drawLabels = function() {
    vis.selectAll('g.inner.node')
    .append("svg:text")
    .attr("dx", -6)
    .attr("dy", -6)
    .attr("text-anchor", 'end')
    .attr('font-size', '8px')
    .attr('fill', '#ccc')
    .text(function(d) { return d.length; });

    vis.selectAll('g.leaf.node').append("svg:text")
    .attr("dx", 8)
    .attr("dy", 3)
    .attr("text-anchor", "start")
    .attr('font-family', 'Helvetica Neue, Helvetica, sans-serif')
    .attr('font-size', '10px')
    .attr('fill', 'black')
    .text(function(d) { return d.name + ' ('+d.length+')'; });
  };
  
  
  chart.highlightSizeLegend = function(item,highlight) {
    
    if (sizeLegendType.name == '')
      return;
    var highlightContainer = sizeLegend.select("#highlightcontainer");
    if (highlight)   {
      var value = d3.round(lookupMap.get(item.name)[sizeLegendType.name],2) || 0 ;
      var highlightCircle = sizeLegend.select("#highlightcircle");
      
      var highlightValueContainer = highlightContainer.select("g");
      var highlightValueBox = highlightContainer.select("text");
      highlightValueBox.text(value);
      highlightValueContainer.attr("transform",function(d) {return "translate("+(-sizeCircleRadiusScale(value)-highlightValueBox.node().getBBox().width/2)+",0)";});
      
      
      highlightContainer
        .attr("transform",function(d) {return "translate("+ sizeCircleRadiusScale(value)+","+(sizeCircleRadius)+")";})
        .style("opacity","1");
      sizeCircleLine.radius(sizeCircleRadiusScale(value));
      highlightCircle.datum(d3.range(50))
      .attr("d",sizeCircleLine);
    }
    else {
      highlightContainer.style("opacity","0");
    }
    
  };
  
  chart.highlightColorBand = function(item,highlight) {
     if (colorLegendType.name == '' || !colorLegendType.isNumber)
      return;
     var highlightBox = colorBandLegend.select("#bandhighlightvalue");
     if (highlight) {
      var value = d3.round(lookupMap.get(item.name)[colorLegendType.name],2);
      var pos = colorBandScale(value) - 10;
      var textBox = highlightBox.select("text");
      textBox.text(value);
      var bbox = textBox.node().getBBox();
      var boxWidth = bbox.width < 30 ? 30 : bbox.width;
      highlightBox.select("rect").attr("width",function(d) {return (boxWidth +5)});
      highlightBox.attr("transform",function(d) {return "translate(12,"+pos+")";})
      .style("opacity",1);
      
     }
     else {
       highlightBox.style("opacity",0);
     }
  };
  
  chart.highlightColorLegendItem = function(item,highlight) {
    var legendItem = colorLegend.selectAll("g.legendItem")
      .filter(function(d) {
        return lookupMap.get(item.name)[colorLegendType.name] == d;
      });
    
    legendItem.select("circle")
      .transition().duration(100)
       .attr("r",function(d) {return highlight ? "8" : "5";})
       .style("stroke", function(d) {return highlight ? "black" : "#ccc";})
       .style("stroke-width", function(d) {return highlight ? "2px":"1px";});   
    
    // highlight selected text
    legendItem.select("text")
      .transition().duration(100)
      .attr('font-size', function(d) {return highlight ? 15: 10 ;});
  };
  
  chart.leafover = function(l) {
    d3.select(this).select("circle")
      .transition().duration(100)
      .attr("r",function(d) {return chart.pointRadius(l) * 1.5;})
      .style("stroke-width", "2px");   
    
   if (!colorLegendType.isNumber)  {
     chart.highlightColorLegendItem(l,true);
   }
   else {
     chart.highlightColorBand(l,true);
   }
   
   chart.highlightSizeLegend(l,true);
    
    var item = lookupMap.get(l.name);
    if (item ==null) {
      item =  {'name':l.name};
    }
    item.depth = l.depth;
    var item =  d3.map(item);
    
    var itemList = d3.zip(item.keys(),item.values());
    
    var tooltipItems = tooltip.select("ul")
      .selectAll("li")
      .data(itemList,function(d) {return d[0];});
    
    
    tooltipItems.enter().append("li")
        .each(function(d,i) {
            d3.select(this).append("label")
              .attr("for",function(d) {return d[0];})
              .text(function(d) {return d[0];});
            d3.select(this).append("span")
            .attr("id",function(d) {return d[0];});
            });
    
    
    tooltipItems.each(function(d,i) {
      d3.select(this).select("span").text(d[1]);
    });
    
    
    tooltip
      .style("left", (d3.event.pageX + 10) + "px")     
      .style("top", (d3.event.pageY) + "px")
      .style("visibility", "visible");
    
  };
  
  chart.leafout = function(l) {
    d3.select(this).select("circle")
      .transition().duration(100)
      .attr("r",chart.pointRadius)
      .style("stroke-width", "1px");   
    
    if (!colorLegendType.isNumber) {
      chart.highlightColorLegendItem(l,false);
    }
    else {
      chart.highlightColorBand(l,false);
    }
    
    chart.highlightSizeLegend(l,false);
    
     tooltip.style("visibility", "hidden");
      
  };
  
  chart.colorlegendover = function(l) {
    var legendItems = colorLegend.selectAll("g.legendItem");
    
    // grey out all circles
    legendItems.selectAll("circle")
      .transition().duration(100)
      .attr("r","5")
      .style("fill","#ccc")
      .style("stroke","#ccc");
    
    //grey out all text
    legendItems.selectAll("text")
      .transition().duration(100)
      .attr('font-size', '10px')
      .style('fill', '#ccc');
    
    // highlight selected circle
    d3.select(this).select("circle")
      .transition().duration(100)
       .attr("r","8")
        .style("fill", colorLegendScale)
       .style("stroke", "black")
       .style("stroke-width", "2px");   
    
    // highlight selected text
    d3.select(this).select("text")
      .transition().duration(100)
      .attr('font-size', '15px')
      .style('fill',colorLegendScale);
    
    // grey all nodes
    vis.selectAll('g.leaf.node')
      .select("circle")
      .attr('fill', "#ccc")
    
    var selectedCircles = vis.selectAll('g.leaf.node')
      .filter(function(d) {
          var metaItem = lookupMap.get(d.name);
          if (metaItem) {
            return lookupMap.get(d.name)[colorLegendType.name] == l;
          }
          else {
            if (!l) return true;
          }
        return false;
      })
      .select("circle");
    var t0 = selectedCircles.transition().duration(500)
      .attr("r",function(d) {return 5 + scaleFactor*scale;})
      .attr('fill', chart.fill);
    var t1 = t0.transition().duration(500)
      .attr("r",chart.pointRadius);
  };
  
   chart.colorlegendout = function(l) {
      var legendItems = colorLegend.selectAll("g.legendItem");
      legendItems
        .selectAll("circle")
          .transition().duration(100)
          .attr("r","5")
          .style("fill",colorLegendScale)
          .style("stroke","#ccc")
          .style("stroke-width","1px");
     
     legendItems.selectAll("text")
       .transition().duration(100)
       .attr('font-size', '10px')
         .style('fill',colorLegendScale)
     
     vis.selectAll('g.leaf.node')
      .select("circle")
       .attr('fill', chart.fill);
  };
  
  chart.pointRadius = function(d) {
    var metaItem = lookupMap.get(d.name);
    var type;
    var value = 1;
    if (metaItem) {
      value = parseFloat(metaItem[sizeLegendType.name]) || 1;
    }
    
    return pointBaseScale + scaleFactor*pointBaseScale*scale*sizeLegendScale(value);
  }
  
  chart.drawNodes = function() {
    var nds = vis.selectAll("g.node")
        .data(nodes, function(d) {return d.name;});
    
    nds.enter().append("g")
        .attr("class", function(n) {
          if (n.children) {
            if (n.depth == 0) {
              return "root node";
            } else {
              return "inner node";
            }
          } else {
            return "leaf node";
          }
        });
    
    nds.attr("transform", chart.transformNode);
  };
  
  chart.transformNode = function(d) {
    if (isRadial) {
      if (scaleBranchLength) {
        return "rotate(" + (d.x - 90) + ")translate(" + x(d.rootDist) + ")"; 
      }
      else {
        return "rotate(" + (d.x - 90) + ")translate(" + x(d.y) + ")"; 
      }
    }
    else {
      if (scaleBranchLength) {
        return "translate(" + x(d.rootDist) + "," + y(d.x) + ")";
      }
      else {
        return "translate(" + x(d.rootDist) + "," + y(d.x) + ")";
      }
    }
  };
  
  chart.styleNodes = function() {
    var leafNodes = vis.selectAll('g.leaf.node')
      .append("svg:circle")
        .attr("class","leafNode")
        .attr("r",chart.pointRadius)
        .attr('fill', chart.fill)
        .attr('stroke-width', '1px');
    
    leafNodes
      .on("mouseover",chart.leafover)
      .on("mouseout",chart.leafout);
    
    
    var rootNode = vis.selectAll('g.root.node')
     .append('svg:circle')
        .attr("class","rootNode")
        .attr("r", 2.5)
        .attr('fill', 'steelblue')
        .attr('stroke', '#369')
        .attr('stroke-width', '2px');
    
    
  };
  
  chart.drawPaths = function() {
    var paths = vis.selectAll("path.link")
        .data(layout.links(nodes));
    
    paths.enter().append("svg:path")
        .attr("class", "link");
    
    paths.attr("d", diagonal);
  };
  
   
  chart.rescale = function() {
    var t = d3.event.translate;
    scale = d3.event.scale;
    console.log(t[1]);
    if (!isRadial) {
      t[0] = Math.min(0, t[0]);
      if (t[1] > 0) {
        t[1] = 0;
      }
      else {
       t[1] = Math.max(-height*(scale-1),t[1]);
      }
      zoom.translate(t);
    }
    else {
      if (scaleBranchLength) {
        x.domain([0,maxDist/scale]);
      }
      else {
        x.domain([0, 1/scale]);
      }
      vis.attr("transform","translate("+t+")");
    }
    chart.drawNodes();
    if (xAxisGroup != null) {
      xAxisGroup.call(xAxis);
    }
    chart.drawPaths();
    vis.selectAll('.leafNode')
    .attr("r",chart.pointRadius)
  };
  
  
  chart.changeColorLegend = function() {
      var maxNumberOfItemsPerCol = (height-40) / 20;
      
      colorLegendMap = d3.nest()
        .key(function(d) {return d[colorLegendType.name];})
      .map(lookupMap.values(),d3.map);
      colorLegendList = d3.set(colorLegendMap.keys());
      var legendValues = colorLegendList.values();
      var availableLegendSize = 50;
      
      var legendSize = colorLegendList.size();
      if (colorLegendType.isNumber) {
        legendValues = legendValues.map(function(d) {return parseFloat(d) || 0 ;}).sort(d3.ascending);
        legendSize = 1;
        if (colorLegendType.name != '') {
          colorLegendScale = d3.scale.linear().domain(d3.extent(legendValues));
          colorLegendScale = colorLegendScale
            .domain([1,.5,0].map(colorLegendScale.invert))
            .range([colorbrewer.RdYlBu[11][0],colorbrewer.RdYlBu[11][5],colorbrewer.RdYlBu[11][10]])
            .interpolate(d3.interpolateRgb);
            //colorbrewer.YlOrRd[3]
        }
        else {
          colorLegendScale = d3.scale.ordinal().range(['steelblue','steelblue','steelblue']);
          //function(d) {return 'steelblue';};
          //
        }
      }
      else {
        if (colorLegendList <= 10 ) {
          colorLegendScale = d3.scale.category10();
        }
        else if (legendSize <=20) {
          colorLegendScale = d3.scale.category20c();
        }
        else {
           colorLegendScale = d3.scale.ordinal()
             .domain(legendValues)
             .range(colors60);
        }
      }
    // calculate how many country legends fit into a column
    
    var numberOfColumns = Math.ceil(legendSize/maxNumberOfItemsPerCol);
    var numberOfItemsPerCol = Math.round(legendSize/numberOfColumns);
    
    
    
    
    if (colorLegendType.isNumber ) {
      
      gradient.selectAll("stop").remove();
      gradient.append("svg:stop")
        .attr("offset","0%")
        .attr("stop-color",function(d) {return colorLegendScale.range()[0];})
        .attr("stop-opacity", 1);
        
      gradient.append("svg:stop")
        .attr("offset","50%")
        .attr("stop-color",function(d) {return colorLegendScale.range()[1];})
        .attr("stop-opacity", 1);
        
      gradient.append("svg:stop")
        .attr("offset","100%")
        .attr("stop-color",function(d) {return colorLegendScale.range()[2];})
        .attr("stop-opacity", 1);
      
      colorBandLegend.style("display","block");
      colorLegend.style("display","none");
      colorBandScale = d3.scale.linear()
        .domain(d3.extent(legendValues))
        .range([availableLegendSize,0]);
      var colorBandAxis  = d3.svg.axis()
        .scale(colorBandScale)
        .innerTickSize(6)
        .outerTickSize(0)
        .tickValues(colorLegendScale.domain())
        .orient("right");
      colorBandLegend.select("#bandaxis").call(colorBandAxis);
      colorBandLegend.select("#bandaxis").selectAll('.tick line').style({'shape-rendering': 'crispEdges','stroke':'#A7A7A7','stroke-width':'1px'});
      colorBandLegend.select("#bandaxis").selectAll('.tick text').style('fill','#A7A7A7');
    }
    else {
      colorBandLegend.style("display","none");
      colorLegend.style("display","block");
      var legendItems = colorLegend.selectAll("g").data(legendValues,String);
     
      var newItems = legendItems.enter()
        .append("svg:g")
        .attr("class","legendItem")
        .style("opacity", 1e-6)
        .attr("transform", function(d,i) { 
             column = (Math.floor(i/numberOfItemsPerCol))
             return "translate(" + (column*100) + "," + (i-numberOfItemsPerCol*column)*20 + ")";
          })
        
          .on("mouseover",chart.colorlegendover)
          .on("mouseout",chart.colorlegendout);
      
      
      newItems.append("svg:circle")
          .attr("r","5")
          .style("fill",colorLegendScale).style("stroke","#ccc");
      
      newItems.append("svg:text")
          .attr("dx", 10)
          .attr("dy", 5)
          .attr("text-anchor", "start")
          .attr('font-family', 'Helvetica Neue, Helvetica, sans-serif')
          .attr('font-size', '10px')
          .style('fill', colorLegendScale)
          .text(function(d) { return d + " ["+colorLegendMap.get(d).length+"]";});
      
      legendItems.exit()
        .transition().duration(500)
        //.delay(function(d,i) {return i / legendSize * 100;})
        //.attr("transform", function(d) { return "translate(0,"+height+")";})
        .style("opacity", 1e-6)
        .remove();
      
      newItems.transition().duration(500)
            .delay(500)
            //.delay(function(d,i) { return 50 + i / legendSize * 100;})
            .style("opacity", 1);
    }
    colorLegend.attr("transform",function(d) { return "translate(" + ((width) - 100*numberOfColumns) + ", " + " 50 )";});
    container.select("#colorlegendcontrol")
      .style("left",function(d) { return ((width) - 100*numberOfColumns);})
      .style("top","20px");
    colorBandLegend.attr("transform",function(d) { return "translate(" + ((width) - 100*numberOfColumns) + ", " + " 50 )";});
    sizeLegend.attr("transform",function(d) {return "translate(" + ((width) - 100*numberOfColumns-150) + ", " + " 50 )";});
    container.select("#sizelegendcontrol")
      .style("left",function(d) { return ((width) - 100*numberOfColumns-150);})
      .style("top","20px");
    
    return {'numberOfColumns':numberOfColumns,'numberOfItemsPerCol':numberOfItemsPerCol};
  };
  
  chart.changeSizeLegend = function() {
      sizeLegendMap = d3.nest()
        .key(function(d) {return d[sizeLegendType.name];})
      .map(lookupMap.values(),d3.map);
      sizeLegendList = d3.set(sizeLegendMap.keys());

      var legendValues = sizeLegendList.values();
      legendValues = legendValues.map(function(d) {return parseFloat(d) || 0 ;}).sort(d3.ascending).sort(d3.ascending);
      
 
            
      var availableLegendSize = 100;
      
      if (sizeLegendType.name == '') {
        sizeLegend.style("display","none");
        sizeLegendScale = d3.scale.ordinal()
          .range([1]);
      }
      else {
        sizeLegend.style("display","block");
       var maxValueBox = sizeLegend.select("#sizemaxvalue");
       var maxValue = d3.round(d3.max(legendValues),2);
       
       maxValueBox.text(function(d){return maxValue});
       maxValueBox.attr("transform",function(d) {return "translate("+(sizeCircleRadius+maxValueBox.node().getBBox().width/2)+","+(sizeCircleRadius+10)+")";});
       sizeCircleRadiusScale.domain(d3.extent(legendValues)).range([0,sizeCircleRadius]);
       
       
       sizeLegendScale = d3.scale.linear()
          .domain(d3.extent(legendValues))
          .range([0,1]);
      }
  };
  
  chart.changeLegendType = function() {
    
    
    var legendMargins = chart.changeColorLegend();
    
    chart.changeSizeLegend();
    
     vis.selectAll('g.leaf.node circle')
       .transition().duration(100)
       .delay(function(d,i) {return i;})
       .attr('fill', chart.fill)
       .attr("r",chart.pointRadius);
  }
  
  
  chart.fill = function(d) {
    var metaItem = lookupMap.get(d.name);
    var type;
    if (metaItem)
      type = metaItem[colorLegendType.name];
    return colorLegendScale(type);
  };
  
  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _ - (margin.left + margin.right);
    radius = width/2;
    return chart;
  };
  
  chart.lookupMap = function(_) {
    if (!arguments.length) return lookupMap;
    lookupMap = _;
    return chart;
  };
  
   chart.height = function(_) {
    if (!arguments.length) return height;
    height = _ - (margin.top + margin.bottom);
    return chart;
  };
  
  chart.colorLegendType = function(_) {
    if (!arguments.length) return colorLegendType;
    colorLegendType = _;
    if (chart.isRendered()) {
      chart.changeLegendType();
    }
    return chart;    
  };
  
  chart.sizeLegendType = function(_) {
    if (!arguments.length) return sizeLegendType;
    sizeLegendType = _;
    if (chart.isRendered()) {
      chart.changeLegendType();
    }
    return chart;    
  };
  
  chart.isRadial = function(_) {
    if (!arguments.length) return isRadial;
    if (isRadial == _)
      return chart;
    isRadial = _;
    if (chart.isRendered()) {
      scale = 1;
      this.prepareData();
      this.prepareLayout();
      this.drawPaths();
      this.drawNodes();
      vis.selectAll('.leafNode')
        .attr("r",chart.pointRadius)
    }
    return chart;
  };
  
   chart.scaleBranchLength = function(_) {
    if (!arguments.length) return scaleBranchLength;
    if (scaleBranchLength == _)
      return chart;
    scaleBranchLength = _;
    if (chart.isRendered()) {
      scale = 1;
      this.prepareData();
      this.prepareLayout();
      this.drawPaths();
      this.drawNodes();
      vis.selectAll('.leafNode')
        .attr("r",chart.pointRadius)
    }
    return chart;
  };
  
  chart.rightAngleDiagonal = function() {
    var projection = function(d) { return [x(d.rootDist), y(d.x)]; };
    
    var path = function(pathData) {
      return "M" + pathData[0] + ' ' + pathData[1] + " " + pathData[2];
    };
    
    function diagonal(diagonalPath, i) {
      var source = diagonalPath.source,
          target = diagonalPath.target,
          pathData = [source, {x: target.x, y:source.y,rootDist: source.rootDist}, target];
      pathData = pathData.map(projection);
      return path(pathData);
    }
    
    diagonal.projection = function(x) {
      if (!arguments.length) return projection;
      projection = x;
      return diagonal;
    };
    
    
    diagonal.path = function(x) {
      if (!arguments.length) return path;
      path = x;
      return diagonal;
    };
    
    return diagonal;
  };
  
  chart.radialRightAngleDiagonal = function() {
    return chart.rightAngleDiagonal()
      .path(function(pathData) {
        var src = pathData[0],
            mid = pathData[1],
            dst = pathData[2],
            radius = Math.sqrt(src[0]*src[0] + src[1]*src[1]),
            srcAngle = chart.coordinateToAngle(src, radius),
            midAngle = chart.coordinateToAngle(mid, radius),
            clockwise = Math.abs(midAngle - srcAngle) > Math.PI ? midAngle <= srcAngle : midAngle > srcAngle,
            rotation = 0,
            largeArc = 0,
            sweep = clockwise ? 0 : 1;
        return 'M' + src + ' ' +
          "A" + [radius,radius] + ' ' + rotation + ' ' + largeArc+','+sweep + ' ' + mid +
          'L' + dst;
      })
      .projection(function(d) {
        var r = 0;
        if (scaleBranchLength) {
          r = x(d.rootDist);
        }
        else {
          r = x(d.y);
        }
        var  a = (d.x - 90) / 180 * Math.PI;
        return [r * Math.cos(a), r * Math.sin(a)];
      })
  };
  
  chart.calculateBranchLengths = function(nodes) {
    var visitPreOrder = function(root, callback) {
      callback(root)
      if (root.children) {
        for (var i = root.children.length - 1; i >= 0; i--){
          visitPreOrder(root.children[i], callback)
        };
      }
    }
    visitPreOrder(nodes[0], function(node) {
      node.rootDist = (node.parent ? node.parent.rootDist : 0) + (node.length || 0);
    })
    var rootDists = nodes.map(function(n) { return n.rootDist; });
    return d3.max(rootDists);
  }
  
  chart.coordinateToAngle = function(coord, radius) {
    var wholeAngle = 2 * Math.PI,
        quarterAngle = wholeAngle / 4
    
    var coordQuad = coord[0] >= 0 ? (coord[1] >= 0 ? 1 : 2) : (coord[1] >= 0 ? 4 : 3),
        coordBaseAngle = Math.abs(Math.asin(coord[1] / radius))
    
    // Since this is just based on the angle of the right triangle formed
    // by the coordinate and the origin, each quad will have different 
    // offsets
    switch (coordQuad) {
      case 1:
        coordAngle = quarterAngle - coordBaseAngle
        break
      case 2:
        coordAngle = quarterAngle + coordBaseAngle
        break
      case 3:
        coordAngle = 2*quarterAngle + quarterAngle - coordBaseAngle
        break
      case 4:
        coordAngle = 3*quarterAngle + coordBaseAngle
    }
    return coordAngle
  };

  
  chart.isRendered = function() {
    return container != null && container.select("svg");
  };
  return chart;
}
