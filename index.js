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
        // get compiled template
        var template = _cache[file] ? _cache[file] : doT.template(loaderFunc.load(file), null, loaderFunc);
        // cache template
        _cache[caller] = template;

        return template(context);
    };
}

hexo.extend.renderer.register('dot', 'html', function(data, context){
    context.__loadPartial = __loadPartial(data.path, context);

    try {
        var template = _cache[data.path] ? _cache[data.path] : doT.template(data.text, null, partialLoader(data.path));
        _cache[data.path] = template;
        return template(context);
    } catch (error) {
        console.log(data.path)
        console.error(error);
    }

}, true);
