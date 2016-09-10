/**
 * Created by efe.sozen on 3.09.2016.
 */
var gulp        = require('gulp'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglify'),
    less        = require('gulp-less'),
    cleanCSS    = require('gulp-clean-css'),
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
    gulp.src(['source/less/app.less', 'source/plugins/owl-carousel/owl.carousel.css'])
        .pipe(less({
            plugins : [autoprefix]
        }))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(concat(files.cssbundle))
        .pipe(gulp.dest(bases.assets + 'css'));
    
});

gulp.task('static-assets', function(){

    gulp.src(bases.source + "/fonts/**/*")
        .pipe(gulp.dest(bases.assets + "/fonts"));

    gulp.src(bases.source + "/img/**/*")
        .pipe(gulp.dest(bases.assets + "/img"));

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