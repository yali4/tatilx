'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var through = require('through2');
var gutil = require('gulp-util');
var rework = require('rework');
var func = require('rework-plugin-function');

module.exports = function(plugin, root, config)
{
    var options = {};

    var dist = config.dist.split("/");

    dist.unshift(root);

    var imagePath = config.images.split("/");

    imagePath.unshift(root);

    var fontPath = config.fonts.split("/");

    fontPath.unshift(root);

    return through.obj(function (file, enc, cb) {

        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError('builder', 'Streaming not supported'));
            return;
        }

        try {

            //
            var filePath = file.path,
                fileDir = path.dirname(filePath);
            //

            var vendorPath = path.normalize(root + path.sep + plugin.vendor);
            var cleanPath = filePath.substring(vendorPath.length);
            //

            var splittedPath = cleanPath.split(path.sep);

            //
            var extensionName = ("images" in plugin ? plugin.images : splittedPath.shift());

            var extensionDir = path.normalize([vendorPath, extensionName]
                .filter(function(value){
                    return value.length > 0
                }).join(path.sep));

            var extensionFile = splittedPath.pop();

            //
            var imagePattern = /(.+(jpg|jpeg|png|gif))(.+)?/;
            var fontPattern = /(.+(eot|woff2|woff|ttf|svg))(.+)?/;

            //
            var ret = rework(file.contents.toString(), {source: file.path});

            ret.use(func({
                url: function(url){

                    var imageMatch = url.match(imagePattern),
                        fontMatch = url.match(fontPattern);

                    if ( imageMatch || fontMatch )
                    {
                        //
                        var savePath = (imageMatch ? imagePath : fontPath).concat([extensionName])
                            .filter(function(value){
                                return value.length > 0
                            })
                            .join(path.sep);

                        var sourceFile = path.normalize(fileDir + path.sep + (imageMatch ? imageMatch[1] : fontMatch[1]));

                        var sourceFileParse = path.parse(sourceFile.substring(extensionDir.length)
                            .replace(/^(img|fonts)/, ""));

                        if ( fs.existsSync(sourceFile) )
                        {
                            var targetDir = savePath + sourceFileParse.dir;

                            mkdirp.sync(targetDir);

                            var targetFileName = targetDir + path.sep + sourceFileParse.base;

                            fs.writeFileSync(targetFileName, fs.readFileSync(sourceFile));

                            url = path.relative(dist.join(path.sep), targetFileName)
                                .replace(/\\/gm, "/");

                            if ( imageMatch && imageMatch[3] !== undefined ) url = url + imageMatch[3];
                            else if ( fontMatch && fontMatch[3] !== undefined ) url = url + fontMatch[3];
                        }
                    }

                    return 'url("' + url + '")';

                }
            }, false));

            file.contents = new Buffer(ret.toString(options));

            cb(null, file);

        } catch (err) {
            cb(new gutil.PluginError('builder', err, {fileName: err.filename || file.path}));
        }
        
    });

};