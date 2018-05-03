const url = require('url');
const fetch = require('./fetch');

function mapVariant(variant) {
  return Object.assign({}, variant);
}

function serveRealmsIndex() {
  return function (req, res) {
    var promiseForRealms = Promise.resolve(req.realms.map(function (realm) {
        return {
          url: realm.url,
          realm: realm.realm,
          title: realm.title || realm.realm,
          variants: realm.variants.map(mapVariant)
        };
      }));
    
    if ('refs' in req.query) {
      var origin = 'http://' + req.headers.host;
      promiseForRealms = promiseForRealms.then(realms => {
        var promisesForVariantReferences = [];
        
        realms.forEach(realm => {
          realm.variants.map(variant => {
            if (variant.type && variant.type.indexOf("application/lynx+json") === -1) return Promise.resolve([]);
            var target = url.resolve(origin, variant.url);
            return fetch.fetchReferences(target)
              .then(refs => {
                if (!refs) return;
                variant.refs = refs;
              });
          })
          .forEach(p => promisesForVariantReferences.push(p));
        });
        
        return Promise.all(promisesForVariantReferences).then( () => realms );
      });
    }
    
    promiseForRealms.then(realms => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(realms));
    });
  };
}

exports.serveRealmsIndex = serveRealmsIndex;
