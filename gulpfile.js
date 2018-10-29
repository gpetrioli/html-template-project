 const gulp           = require("gulp"),
    sass            = require("gulp-sass"),
    concat          = require("gulp-concat"),
    watch           = require("gulp-watch"),
    plumber         = require("gulp-plumber"),
    uglify          = require("gulp-uglify"),
    prefix          = require("gulp-autoprefixer"),
    sourcemaps      = require("gulp-sourcemaps"), 
    notify          = require("gulp-notify"),
    browserSync     = require("browser-sync"),
    source          = require('vinyl-source-stream'), //creates a vinyl stream  from readable stream you get from browserify 
    streamify       = require('gulp-streamify'),
    browserify      = require("browserify"),
    rename          = require('gulp-rename'),
    cssImport       = require('gulp-cssimport'), //Parses a CSS file, finds imports, grabs the content of the linked file and replaces the import statement with it.
    fileinclude     = require('gulp-file-include');
	
// -----------------------------------------------------------------------------

const config = {
    dest        : 'dist',
    dest_js     : 'dist/assets/js',
    dest_css    : 'dist/assets/css',
    dest_img    : 'dist/assets/images',
    dest_fonts  : 'dist/assets/fonts',
    dest_html   : 'dist/*.html',
    dest_assets : 'assets',
    src         : 'src',
    src_html    : 'src/*.html',
    src_partials: 'src/**/*.html',
    src_sass    : 'src/sass/**/*.{scss,css}',
    src_js      : 'src/js/*.js',
    src_img     : 'src/images/*.**',
    src_fonts   : 'src/fonts/*.**'
}


// -----------------------------------------------------------------------------
// SASS TO CSS
// -----------------------------------------------------------------------------
function sass_task(){
  return gulp.src(config.src_sass)
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(sass())
    .pipe(cssImport())
    .pipe(prefix('last 4 versions'))
    .pipe(concat('main.css'))
	  .pipe(rename('main.min.css'))
    .pipe(gulp.dest(config.dest_css))
    .pipe(browserSync.reload({stream:true}));
};

// -----------------------------------------------------------------------------
// Fonts
// -----------------------------------------------------------------------------
 function fonts_task() {
    return gulp.src(config.src_fonts)
        .pipe(gulp.dest(config.dest_fonts));
};

// -----------------------------------------------------------------------------
// Browserify
// -----------------------------------------------------------------------------
function browserify_task() {
  const bundleStream = browserify('src/js/main.js').bundle()

  return bundleStream
    .pipe(source('index.js'))
    .pipe(streamify(uglify()))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest(config.dest_js))
    .pipe(browserSync.reload({stream:true}));
};

// -----------------------------------------------------------------------------
// Images
// -----------------------------------------------------------------------------
 function images_task() {
    return gulp.src(config.src_img)
        .pipe(gulp.dest(config.dest_img));
};

// -----------------------------------------------------------------------------
// Fileinclude
// -----------------------------------------------------------------------------
function fileinclude_task() {
   return gulp.src(config.src_html)
    .pipe(fileinclude({
      prefix: '@@',
      basepath: config.src+'/includes/'
    }))
    .pipe(gulp.dest(config.dest));
};

// -----------------------------------------------------------------------------
// Watch
// -----------------------------------------------------------------------------
function watch_task(){
  browserSync.init({
    server: './dist',
    injectChanges: true,
    proxy: "",
    host: ""
  });

  gulp.watch(config.src_html, {cwd: './'}, fileinclude_task);
  gulp.watch(config.src_partials, {cwd: './'}, fileinclude_task);
  gulp.watch(config.src_js, {cwd: './'}, browserify_task);
  gulp.watch(config.src_sass, {cwd: './'}, sass_task);
  gulp.watch(config.src_img, {cwd: './'}, images_task);
  
  gulp.watch(config.dest_css).on('change',browserSync.reload);
  gulp.watch(config.dest_js).on('change',browserSync.reload);
  gulp.watch(config.dest_img).on('change',browserSync.reload);
  gulp.watch(config.dest_html).on('change',browserSync.reload);
  
};


// -----------------------------------------------------------------------------
//Default
// -----------------------------------------------------------------------------
gulp.task('default',gulp.series(watch_task));
gulp.task('init',gulp.series(gulp.series(fileinclude_task, browserify_task, sass_task,fonts_task,images_task), watch_task));