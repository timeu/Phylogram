#Phylogram


A [D3](http://d3js.org) chart for visualizing phylogetic trees.

It's based on [kueda's](https://github.com/kueda) [right angle phylograms](http://bl.ocks.org/kueda/1036776) but some additional features like: 

* Iteractive [Semnatic zooming](http://bl.ocks.org/mbostock/3680957)
* Visualizing meta-information (quantitive and categorical)
* Support for tooltip and mouseover functionality

Phylogram requires two input data sets:  

1. Tree structure as a nested list.    
2. Meta-information as a lookup map.    

### Simple Example

```Javascript

var data = [
            {'name':'node1',
             'branchset':[
                {'name':'subnode1',
                 'branchset':[
                    {'name':'leafNode1'},
                    {'name':'leafNode2']
                  ]
                },
                {'name':'subnode2',
                 'branchset':[]
                }
              ]
            }
          ];

var meta = {'leafNode1':
              {'country':'AUS','size':10},
            'leafNode2':
              {'country':'USA','size':20}
           };
var chart = phylogram().width(800).height(800)lookupMap(meta);

d3.select('#chart')
		.selectAll('svg')
		.data([data])
		.enter()
		.append('svg')
		.call(chart);
```

[DEMO](http://timeu.github.io/Phylogram/)

###Implementation

The implementation follows the [reusable charts](http://bost.ocks.org/mike/chart/) convention proposed by Mike Bostock

##Configuration

The chart can be configured in a number of ways (The default value is **bold**): 

* **circular**: Render a circular Dendrogram instead of a linear Phylogram [**false**, true]
* **orientation**: The orientiation of the chart [**LEFT**, BOTTOM, TOP, RIGHT]
