var doT = require('dot'),
    fs  = require('fs'),
    path = require('path');

// cache variables
var _cache = {},
    _partialsCache = {};

var partialLoader = function(caller){
    return {
        load: function (file){
            var template = null;

            // let's try loading content from cache
            template = _partialsCache[file];

            // no content so let's load from file system
            if (template == null) {
                var route = path.join(path.dirname(caller), file+".dot");
                template = fs.readFileSync(route, "utf-8");
                _partialsCache[file] = template;
            }

            return template;
        }
    };
};

function __loadPartial(caller, context){
    return function(file){

        // generate loader function
        var loaderFunc = partialLoader(caller);
        // get template, no caching - otherwise will pollute global env
        var template = doT.template(loaderFunc.load(file), null, loaderFunc);

        return template(context);
    };
}


hexo.extend.renderer.register('dot', 'html', function(data, context){

    context.__loadPartial = __loadPartial(data.path, context);

    var template = _cache[data.path] ? _cache[data.path] : doT.template(data.text, null, partialLoader(data.path));
    _cache[data.path] = template;
    return template(context);

}, true);
