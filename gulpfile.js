var path        = require("path"),
    gulp        = require('gulp'),
    gulpif      = require('gulp-if'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglify'),
    less        = require('gulp-less'),
    cleanCSS    = require('gulp-clean-css'),
    rework      = require('gulp-rework'),
    reworkUrl   = require('rework-plugin-url'),
    LessAutoprefix = require('less-plugin-autoprefix'),
    autoprefix  = new LessAutoprefix({ browsers: ['last 2 versions'] });

var browserSync = require('browser-sync').create();
var extender = require('gulp-html-extend');

var paths = {
  scripts: [
      'source/plugins/jquery/dist/jquery.js', 
      'source/js/bootstrap/bootstrap.js',
      'source/plugins/owl-carousel/owl.carousel.js',
      'source/js/app.js'
  ],
  bootstrapJs: [
      'source/js/bootstrap/transition.js',
      'source/js/bootstrap/alert.js',
      'source/js/bootstrap/button.js',
      'source/js/bootstrap/carousel.js',
      'source/js/bootstrap/collapse.js',
      'source/js/bootstrap/dropdown.js',
      'source/js/bootstrap/modal.js',
      'source/js/bootstrap/tooltip.js',
      'source/js/bootstrap/popover.js',
      'source/js/bootstrap/scrollspy.js',
      'source/js/bootstrap/tab.js',
      'source/js/bootstrap/affix.js'
  ],
  less : [
      'source/less/app.less'
  ]
};

var files = {
    bootstrapJs: "bootstrap.js",
    jsbundle : "app.bundle.min.js",
    cssbundle : "app.bundle.min.css"
};

var bases = {
    dist : "dist/",
    assets: 'dist/assets/',
    source : "source/"
};

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['']);

gulp.task('merge-assets', function(){

    var plugins = [

        {
            "name" : "app",
            "vendor" : "source/app/css/",
            "files" : [
                "app.less"
            ],
            "images" : ""
        },
        {
            "name" : "owl-carousel",
            "vendor" : "source/plugins/owl-carousel/",
            "files" : [
                "owl.carousel.css",
                "owl.theme.css",
                "owl.transitions.css"
            ]
        }

    ];

    function executePlugin(name, vendor, files, plugin)
    {
        files = files.map(function(file){

            return vendor + file;

        });

        gulp.src(files)
            .pipe(less())
            .pipe(rework(reworkUrl(function (url) {

                var fontRegex = /.+(eot|woff2|woff|ttf|svg)/,
                    imageRegex = /.+(jpg|jpeg|png|gif)/;

                var fontMatch = url.match(fontRegex),
                    imageMatch = url.match(imageRegex);

                if ( fontMatch || imageMatch )
                {
                    var destination = [];
                    var prevCount = (url.match(/\.\.\//g) || []).length;

                    var normalFilePath = path.normalize( vendor +  url );
                    var vendorPath = path.normalize( vendor + "../".repeat(prevCount) );

                    var cleanFilePath = normalFilePath.substring(vendorPath.length).replace(/\\/gm, "/");

                    if ( fontMatch )
                    {
                        cleanFilePath = cleanFilePath.replace(/^fonts\//, "");
                    }
                    else if ( imageMatch )
                    {
                        cleanFilePath = cleanFilePath.replace(/^img\//, "");
                    }

                    var cleanPathParse = path.parse(cleanFilePath);

                    if ( fontMatch )
                    {
                        destination.push("fonts", cleanPathParse.dir);

                        destination = destination.filter(function(str){ return str.length > 0 });

                        var normalFontPath = normalFilePath.match(fontRegex);

                        gulp.src( normalFontPath[0] )
                            .pipe(gulp.dest( "./dist/css/" + destination.join("/") ));

                        return destination.join("/") + "/" + cleanPathParse.base;
                    }

                    else if ( imageMatch )
                    {
                        destination.push("img", ("images" in plugin ? plugin.images : name),  cleanPathParse.dir);

                        destination = destination.filter(function(str){ return str.length > 0 });

                        gulp.src( normalFilePath )
                            .pipe(gulp.dest( "./dist/css/" + destination.join("/") ));

                        return destination.join("/") + "/" + cleanPathParse.base;
                    }
                }

                return url;

            })))
            .pipe(gulp.dest("./dist/css/"));
    }

    plugins.forEach(function(plugin){

        executePlugin(plugin.name, plugin.vendor, plugin.files, plugin);

    });

});

gulp.task('buildJs', ['buildBsJs','scripts']);

gulp.task('scripts',function () {

    gulp.src(paths.scripts)
        .pipe(uglify())
        .pipe(concat(files.jsbundle))
        .pipe(gulp.dest(bases.assets + 'js'));

});


gulp.task('buildBsJs',function () {

    gulp.src(paths.bootstrapJs)
        .pipe(concat(files.bootstrapJs))
        .pipe(gulp.dest(bases.source + 'js/bootstrap'));

});

gulp.task('styles',function () {
    gulp.src([
        'source/less/app.less',
        'source/plugins/owl-carousel/owl.carousel.css'
    ])
        .pipe(less({
            plugins : [autoprefix]
        }))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(concat(files.cssbundle))
        .pipe(gulp.dest(bases.assets + 'css'));
    
});

gulp.task('static-assets', function(){

    //gulp.src(bases.source + "/fonts/**/*")
        //.pipe(gulp.dest(bases.assets + "/fonts"));

    
    //gulp.src(bases.source + "/img/**/*")
        //.pipe(gulp.dest(bases.assets + "/img"));

});

gulp.task('static-images', function(){

    gulp.src(bases.source + "/images/**/*")
        .pipe(gulp.dest(bases.dist + "/images"));

});

gulp.task('static', function() {

    gulp.run(['static-assets', 'static-images']);

});

gulp.task('extend', function() {

    gulp.src('source/views/*.html')
        .pipe(extender({annotations:true,verbose:false})) // default options
        .pipe(gulp.dest(bases.dist));

});

gulp.task('browsersync',function () {

    browserSync.init({
        server: {
            baseDir: bases.dist
        }
    });

});

gulp.task('watch', function(){

    gulp.watch('source/views/**/*.html',['extend']);
    gulp.watch('source/js/**/*.js',['scripts']);
    gulp.watch('source/less/layouts/**/*.less',['styles']);
    // static
    gulp.watch(['source/fonts/**/*', 'source/img/**/*'], ['static-assets']);
    gulp.watch('source/images/**/*', ['static-images']);

    gulp.watch([bases.dist + "/*", bases.dist + "/**/*"], browserSync.reload);

});

gulp.task('live',['extend','styles','scripts','static','watch','browsersync']);