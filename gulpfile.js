var path        = require("path"),
    gulp        = require('gulp'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglify'),
    less        = require('gulp-less'),
    cleanCSS    = require('gulp-clean-css'),
    extender    = require('gulp-html-extend'),
    builder     = require('./builder');

var root = path.resolve(__dirname);
var browserSync = require('browser-sync').create();

var LessAutoprefix  = require('less-plugin-autoprefix'),
    autoprefix      = new LessAutoprefix({ browsers: ['last 2 versions'] });

var files = {

    style: [
        // App
        './dist/assets/css/app.css',
        // Components
        './dist/assets/css/lib.css'
    ],

    script: [
        // Components
        './dist/assets/js/lib.js',
        // App
        './dist/assets/js/app.js'
    ],

    bundle: {
        style : "bundle.min.css",
        script : "bundle.min.js"
    }

};

gulp.task('styles', function(){

    [

        // Internal Styles
        {
            "vendor" : "source/app/",
            "files" : [
                "css/app.less"
            ],
            "images" : "",
            "concat" : "app.css"
        },

        // External Styles
        {
            "vendor" : "source/plugins/",
            "files" : [
                "owl-carousel/owl.transitions.css",
                "owl-carousel/owl.carousel.css",
                "date-range/datetime.less"
            ],
            "concat" : "lib.css"
        }

    ].forEach(function(plugin){

        var files = plugin.files.map(function(file){

            return plugin.vendor + file;

        });

        gulp.src(files)
            .pipe(less({
                plugins : [autoprefix]
            }))
            .pipe(builder(plugin, root, {
                dist: "dist/assets/css",
                images: "dist/assets/img",
                fonts: "dist/assets/fonts"
            }))
            .pipe(concat(plugin.concat))
            .pipe(gulp.dest("dist/assets/css"));
        
    });

});

gulp.task('scripts', function(){

    gulp.src([
        // jQuery
        './source/plugins/jquery/dist/jquery.js',
        // Moment
        './source/plugins/moment/moment.min.js',
        // Date Range
        './source/plugins/date-range/datetime.js',
        // Owl Carousel
        './source/plugins/owl-carousel/owl.carousel.js',
        // Bootstrap
        './source/app/js/bootstrap/transition.js',
        './source/app/js/bootstrap/alert.js',
        './source/app/js/bootstrap/button.js',
        './source/app/js/bootstrap/carousel.js',
        './source/app/js/bootstrap/collapse.js',
        './source/app/js/bootstrap/dropdown.js',
        './source/app/js/bootstrap/modal.js',
        './source/app/js/bootstrap/tooltip.js',
        './source/app/js/bootstrap/popover.js',
        './source/app/js/bootstrap/scrollspy.js',
        './source/app/js/bootstrap/tab.js',
        './source/app/js/bootstrap/affix.js'
    ])
        .pipe(concat("lib.js"))
        .pipe(gulp.dest("dist/assets/js"));

    gulp.src([
        // App
        './source/app/js/app.js'
    ])
        .pipe(concat("app.js"))
        .pipe(gulp.dest("dist/assets/js"));

});

gulp.task('production', function(){

    gulp.src(files.style)
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(concat(files.bundle.style))
        .pipe(gulp.dest("dist/css"));

    gulp.src(files.script)
        .pipe(uglify())
        .pipe(concat(files.bundle.script))
        .pipe(gulp.dest("dist/js"));

});

gulp.task('static', function(){

    gulp.src("./source/images/**/*")
        .pipe(gulp.dest("dist/images"));

});

gulp.task('extend', function() {

    gulp.src("./source/app/views/*.html")
        .pipe(extender({
            annotations:true,
            verbose:false
        })) // default options
        .pipe(gulp.dest("dist"));

});

gulp.task('watch', function(){

    // html and javascript files
    gulp.watch('./source/app/views/**/*.html', ['extend']);
    gulp.watch('./source/app/js/**/*.js', ['scripts']);

    // stylesheet files
    gulp.watch([
        './source/app/css/**/*.less',
        './source/plugins/**/*.css',
        './source/plugins/**/*.less'
    ], ['styles']);

    // static images
    gulp.watch('./source/images/**/*', ['static']);

});

gulp.task('live', ['default'], function(){

    // init browser sync
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });

    // reload browser sync
    gulp.watch(["./dist/*", "./dist/**/*"], function () {

        if ( browserSync.active ) browserSync.reload();

    });

});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['extend', 'styles', 'scripts', 'static'], function(){

    // start watch
    gulp.start('watch');

});