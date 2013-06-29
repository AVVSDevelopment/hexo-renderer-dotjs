var doT = require('dot'),
    fs  = require('fs'),
    path = require('path'),
    _ = require('lodash');

// cache variables
var _cache = {},
    _partialsCache = {},
    _globals = {
        //tmp function -- disables overwriting via setGlobals
        load: function(){}
    };

var globalGenerator = function(caller){
    var instance =  {
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
    return _.extend({},_globals, instance);
};

var _settings = doT.templateSettings;

exports.setGlobals = function (globals) {
    'use strict';
    for (var f in _globals) {
        if (globals[f] == null) {
            globals[f] = _globals[f];
        }
        else
            throw new Error("Your global uses reserved utility: " + f);
    }
    _globals = globals;
};

exports.setTemplateSettings = function (settings) {
    'use strict';
    for (var f in settings) {
        _settings[f] = settings[f];
    }
};

function __loadPartial(caller, context){
    return function(file){

        // generate loader function
        var globals = globalGenerator(caller);
        // get template, no caching - otherwise will pollute global env
        var template = doT.template(globals.load(file), null, globals);

        return template.call(globals, context);
    };
}


hexo.extend.renderer.register('dot', 'html', function(data, context){

    var globals = globalGenerator(data.path);
    context.__loadPartial = __loadPartial(data.path, context);

    // generating template if not exists
    var template = _cache[data.path] ? _cache[data.path] : doT.template(data.text, null, globals);

    // trying to cache
    _cache[data.path] = template;

    return template.call(globals, context);

}, true);
