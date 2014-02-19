var newickNodes = [];
function buildNewickNodes(node, callback) {
  newickNodes.push(node);
  if (node.branchset) {
    for (var i=0; i < node.branchset.length; i++) {
      buildNewickNodes(node.branchset[i]);
    }
  }
}

function loadAndParseNewickFile(url) {
  return Q.nfcall(d3.text,url,'text/plain').then(function(text) {
    var data = {};
    var newick = buildNewick(text);
    data['newickNodes'] = newick;
    data['idlist'] = retrieveIdList(newickNodes);
    return data;
  });
}

function buildNewick(text) {
    newick = Newick.parse(text);
    buildNewickNodes(newick);
    return newick;
}

function retrieveIdList(newick) {
  var idlist = newickNodes.filter(filterLeaf).map(function(node) {
         return node.name;
  });  
  return idlist;
}

function filterLeaf(node) {
  return !node.branchset;
}

function loadMetaFile(url) {
   return Q.nfcall(d3.json,url);
}