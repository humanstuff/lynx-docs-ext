const http = require('http');
const url = require('url');
const lynxParser = require('@lynx-json/lynx-parser');

function fetch(target) {
  return new Promise( (resolve,reject) => {
    let req = http.get(target, res => {
      var content = '';
      res.on('data', data => content += data);
      res.on('end', () => {
        resolve({
          type: res.headers['content-type'],
          data: content
        });
      });
      res.on('error', reject);
    });
    
    req.on('error', reject);
  });
}

function fetchReferences(target) {
  return fetch(target)
    .then(content => {
      if (content.type.indexOf('application/lynx+json') === -1) throw new Error(`ignoring ${target} of type ${content.type}`);
      return lynxParser.parse(content.data);
    })
    .then(doc => getReferences(doc))
    .catch(err => {
      console.log('error', target, err);
      return [];
    });
}

function getReferences(node) {
  var references = [];
  accumulateReferences(node, references);
  return references;
}

function accumulateReferences(node, acc) {
  if (!node || !node.value || typeof node.value !== 'object') return;
  
  function doChildren() {
    for (var p in node.value) {
      accumulateReferences(node.value[p], acc);
    }
  }
  
  function is(hint) {
    return node.spec.hints.indexOf(hint) > -1;
  }
  
  if (is('link')) {
    acc.push({
      href: node.value.href
    });
  } else if (is('submit')) {
    acc.push({
      action: node.value.action,
      method: node.value.method || "GET"
    });
  } else if (is('content') && node.value.src) {
    acc.push({
      src: node.value.src
    });
  }
  
  doChildren();
}

exports.fetchReferences = fetchReferences;
