var doT = require('dot'),
    fs  = require('fs');
    path = require('path');

// cache variables
var _cache = {},
    _partialsCache = {};

var globals = {
    load: function (file) {
        var template = null;
        // let's try loading content from cache
        if (_globals.partialCache == true)
            template = _partialsCache[file];

        // no content so let's load from file system
        if (template == null) {
            template = fs.readFileSync(path.join(path.dirname(process.argv[1]), file));
        }

        // let's cache the partial
        if (_globals.partialCache == true)
            _partialsCache[file] = template;

        return template;
    }
 };

hexo.extend.renderer.register('dot', 'html', function(data, context){
    var template = _partialsCache[data.path] ? _partialsCache[data.path] : doT.template(data.text, null, _globals);
    return template(context);
}, true);
