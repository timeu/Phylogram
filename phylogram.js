function phylogram() {
  var margin = {top:20,right:20,bottom:20,left:20},
      width = null,
      height = null, 
      vis = null, 
      container = null,
      layout = null,
      nodes = null, 
      y = null,
      yscale = null,
      diagonal = null,
      zoom = null,
      x = null,
      lookupMap = null, 
      fill = null,
      colors60 = null,
      legend = null,
      legendMap = null,
      legendType = 'country',
      legendList = null,
      legendScale = null,
      tooltip = null,
      legendDropDown = null,
      scale = 1,
      pointBaseScale = 1,
      scaleFactor = 0.15;
        
  
      
  function chart(selection) {
    selection.each(function(d) {
      container = d3.select(this).append("div").attr("id","chart");
      chart.init(d);
      chart.draw();
    });
  }
  
  chart.init =  function(d) {
    
    colors60 = ['#e62e40', '#e62e53', '#e62e65', '#e62e77', '#e62e8a', '#e62e9c', '#e62eae', '#e62ec1', '#e62ed3', '#e62ee6', '#d32ee6', '#c12ee6', '#ae2ee6', '#9c2ee6', '#8a2ee6', '#772ee6', '#652ee6', '#532ee6', '#402ee6', '#2e2ee6', '#2e40e6', '#2e53e6', '#2e65e6', '#2e77e6', '#2e8ae6', '#2e9ce6', '#2eaee6', '#2ec1e6', '#2ed3e6', '#2ee6e6', '#2ee6d3', '#2ee6c1', '#2ee6ae', '#2ee69c', '#2ee68a', '#2ee677', '#2ee665', '#2ee653', '#2ee640', '#2ee62e', '#40e62e', '#53e62e', '#65e62e', '#77e62e', '#8ae62e', '#9ce62e', '#aee62e', '#c1e62e', '#d3e62e', '#e6e62e', '#e6d32e', '#e6c12e', '#e6ae2e', '#e69c2e', '#e68a2e', '#e6772e', '#e6652e', '#e6532e', '#e6402e', '#e62e2e']
    
    layout = d3.layout.cluster()
        .size([height,width])
        .sort(function(node) { return node.children ? node.children.length : -1; })
        .children(function(node) {
          return node.branchset;
        });
    
    nodes = layout(d);
    
    chart.calculateBasePointSize();
    
    x = d3.scale.linear()
        .domain([0, width])
        .range([0, width]);
    yscale = d3.scale.linear()
        .domain([0, height])
        .range([0, height]);
    y = this.scaleBranchLengths(nodes, width);
    
    
    
    
    zoom = d3.behavior.zoom().x(x).y(yscale)
      .on("zoom", this.rescale);
    
    
    tooltip = d3.select("body")
	    .append("div")
      .attr("class","popup")
	    .style("position", "absolute")
	    .style("z-index", "10")
	    .style("visibility", "hidden");
    tooltip.append("ul");
    
    
    var outergroup = container.append("svg:svg")
        .attr("width", width + 300)
        .attr("height", height + 30)
        .attr("pointer-events", "all")
        .append("svg:g")
          .call(zoom);;
    
    outergroup.append('svg:rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'white');
    
    vis = outergroup.append("svg:g")
          .attr("transform", "translate(20, 20)")
          
    legend = outergroup.append("g")
          .attr("class","legend")
          .attr("transform",function(d) {return "translate(" + ((width+300)) + "," + "10)"; });
    
    // create dropdown box
    legendDropDown = container.append("select")
      .attr("id","legendSelect")
      .on("change",function(d) {
         chart.legendType(this.value);
    });
    
    var filterMap = d3.set(['longitude','latitude','id','tg_ecotypeid','name']);
    var keys= d3.set(
        d3.map(lookupMap.values()[0])
          .keys()
            .filter(function(d) {return !filterMap.has(d);}));
  
    var legendTypes = keys.values();
    legendType = legendTypes[0];
    var legendTypeOptions = legendDropDown.selectAll("option")
      .data(legendTypes,String);
  
    legendTypeOptions.enter()
      .append("option")
        .attr("value",function(d) {return d;})
        .text(function(d) {return d;});
    legendTypeOptions.exit().remove();
    
    
    diagonal = this.rightAngleDiagonal();
    chart.changeLegendType();
  };
  
  chart.draw = function() {
    this.drawTicks();
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
  
  
  chart.leafover = function(l) {
    d3.select(this).select("circle")
      .transition().duration(100)
      .attr("r",function(d) {return pointBaseScale + 0.3*scale;})
      .style("stroke-width", "2px");   
    
    var legendItem = legend.selectAll("g.legendItem")
      .filter(function(d) {
        return lookupMap.get(l.name)[legendType] == d;
      });
    
    legendItem.select("circle")
      .transition().duration(100)
       .attr("r","8")
        .style("fill", legendScale)
       .style("stroke", "black")
       .style("stroke-width", "2px");   
    
    // highlight selected text
    legendItem.select("text")
      .transition().duration(100)
      .attr('font-size', '15px')
    
    var item = lookupMap.get(l.name);
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
    
     var legendItem = legend.selectAll("g.legendItem")
      .filter(function(d) {
        return lookupMap.get(l.name)[legendType] == d;
      });
    
     legendItem.select("circle")
       .transition().duration(100)
         .attr("r","5")
         .style("stroke","#ccc")
         .style("stroke-width","1px");    
    
    // highlight selected text
    legendItem.select("text")
      .transition().duration(100)
      .attr('font-size', '10px');
    
    tooltip.style("visibility", "hidden");
      
  };
  
  chart.legendover = function(l) {
    var legendItems = legend.selectAll("g.legendItem");
    
    // grey out all circles
    legendItems.selectAll("circle")
      .transition()
        .duration(100)
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
        .style("fill", legendScale)
       .style("stroke", "black")
       .style("stroke-width", "2px");   
    
    // highlight selected text
    d3.select(this).select("text")
      .transition().duration(100)
      .attr('font-size', '15px')
      .style('fill',legendScale);
    
    // grey all nodes
    vis.selectAll('g.leaf.node')
      .select("circle")
      .transition().duration(100)
      .attr('fill', "#ccc")
    
    var selectedCircles = vis.selectAll('g.leaf.node')
      .filter(function(d) {
          var metaItem = lookupMap.get(d.name);
          if (metaItem) {
            return lookupMap.get(d.name)[legendType] == l;
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
  
   chart.legendout = function(l) {
      var legendItems = legend.selectAll("g.legendItem");
      legendItems
        .selectAll("circle")
          .transition().duration(100)
          .attr("r","5")
          .style("fill",legendScale)
          .style("stroke","#ccc")
          .style("stroke-width","1px");
     
     legendItems.selectAll("text")
       .transition().duration(100)
       .attr('font-size', '10px')
         .style('fill',legendScale)
     
     vis.selectAll('g.leaf.node')
      .select("circle")
      .transition().duration(100)
       .attr('fill', chart.fill)
       .attr('r',chart.pointRadius);
   
     
  };
  
  chart.pointRadius = function() {
    return pointBaseScale + scaleFactor*pointBaseScale*scale;
  }
  
  chart.drawNodes = function() {
    var nds = vis.selectAll("g.node")
        .data(nodes);
    
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
    nds.attr("transform", function(d) { return "translate(" + x(d.y) + "," + yscale(d.x) + ")"; });
  };
  
  chart.styleNodes = function() {
    var leafNodes = vis.selectAll('g.leaf.node');
    
      leafNodes.append("svg:circle")
        .attr("class","leafNode")
        .attr("r",chart.pointRadius)
        .attr('fill', chart.fill)
        .attr('stroke-width', '1px');
    
    leafNodes
      .on("mouseover",chart.leafover)
      .on("mouseout",chart.leafout);
    
    
    vis.selectAll('g.root.node')
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
  
  chart.drawTicks = function() {
    var ticksData = y.ticks(10);
    ticks = vis.selectAll('line')
          .data(ticksData);
    ticks.enter().append('svg:line')
          .attr("stroke", "#ddd");
    
    ticks.attr('y1', 0)
          .attr('y2', height)
          .attr('x1', function(d) { return x(y(d));})
          .attr('x2', function(d) { return x(y(d));});
    ticks.exit().remove();
 
    ticksText = vis.selectAll("text.rule")
          .data(ticksData);
    
    ticksText.enter().append("svg:text")
          .attr("class", "rule")
          .attr("y", 0)
          .attr("dy", -3)
          .attr("text-anchor", "middle")
          .attr('font-size', '8px')
          .attr('fill', '#ccc');
    ticksText
      .text(function(d) { return Math.round(d*100) / 100; })
      .attr("x", function(d) { return x(y(d));});
    
    ticksText.exit().remove();
  };
  
  chart.rescale = function() {
    scale = d3.event.scale;
    console.log(d3.event.scale);
    chart.drawNodes();
    chart.drawTicks();
    chart.drawPaths();
    vis.selectAll('.leafNode')
    .attr("r",chart.pointRadius)
    //chart.drawNodes();
  };
  
  
  chart.changeLegendType = function() {
    legendMap = d3.nest()
      .key(function(d) {return d[legendType];})
      .map(lookupMap.values(),d3.map);
    
    legendList = d3.set(legendMap.keys());
    
    var legendSize = legendList.size();
    if (legendSize <= 10 ) {
      legendScale = d3.scale.category10();
    }
    else if (legendSize <=20) {
      legendScale = d3.scale.category20c();
    }
    else {
       legendScale = d3.scale.ordinal()
         .domain(legendList.values())
         .range(colors60);
    }
    
     // calculate how many country legends fit into a column
    var maxNumberOfCountrysPerCol = (height-40) / 20;
    var numberOfColumns = Math.ceil(legendSize/maxNumberOfCountrysPerCol);
    var numberOfCountrysPerCol = Math.round(legendSize/numberOfColumns);
    
    legend.attr("transform",function(d) {return "translate(" + ((width+200) - 100*numberOfColumns) + "," + "10)"; });
    
    var legendItems = legend.selectAll("g").data(legendList.values(),String);
     
    var newItems = legendItems.enter()
      .append("svg:g")
      .attr("class","legendItem")
      .style("opacity", 1e-6)
      .attr("transform", function(d,i) { 
           column = (Math.floor(i/numberOfCountrysPerCol))
           return "translate(" + (column*100) + "," + (i-numberOfCountrysPerCol*column)*20 + ")";
        })
      
        .on("mouseover",chart.legendover)
        .on("mouseout",chart.legendout);
    
    
    newItems.append("svg:circle")
        .attr("r","5")
        .style("fill",legendScale).style("stroke","#ccc");
    
    newItems.append("svg:text")
        .attr("dx", 10)
        .attr("dy", 5)
        .attr("text-anchor", "start")
        .attr('font-family', 'Helvetica Neue, Helvetica, sans-serif')
        .attr('font-size', '10px')
        .style('fill', legendScale)
        .text(function(d) { return d + " ["+legendMap.get(d).length+"]";});
    
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
    
    
    
    
     vis.selectAll('g.leaf.node circle')
       .transition().duration(100)
       .delay(function(d,i) {return i;})
       .attr('fill', chart.fill);
  }
  
  
  chart.fill = function(d) {
    var metaItem = lookupMap.get(d.name);
    var type;
    if (metaItem)
      type = metaItem[legendType];
    return legendScale(type);
  };
  
  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };
  
  chart.lookupMap = function(_) {
    if (!arguments.length) return lookupMap;
    lookupMap = _;
    return chart;
  };
  
   chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };
  
  chart.legendType = function(_) {
    if (!arguments.length) return legendType;
    legendType = _;
    if (chart.isRendered) {
      chart.changeLegendType();
    }
    return chart;    
  };
  
  chart.rightAngleDiagonal = function() {
    var projection = function(d) { return [x(d.y), yscale(d.x)]; };
    
    var path = function(pathData) {
      return "M" + pathData[0] + ' ' + pathData[1] + " " + pathData[2];
    };
    
    function diagonal(diagonalPath, i) {
      var source = diagonalPath.source,
          target = diagonalPath.target,
          pathData = [source, {x: target.x, y: source.y}, target];
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
  
  chart.scaleBranchLengths = function(nodes, w) {
    // Visit all nodes and adjust y pos width distance metric
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
    var yscale = d3.scale.linear()
      .domain([0, d3.max(rootDists)])
      .range([0, w]);
    visitPreOrder(nodes[0], function(node) {
      node.y = yscale(node.rootDist);
    })
    return yscale;
  };
  
  chart.isRendered = function() {
    return container != null && container.select("svg");
  };
  return chart;
}
