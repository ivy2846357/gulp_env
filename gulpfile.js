// 引用 gulp plugin
const gulp = require('gulp');
// 引用 gulp del
const del = require('del');
// 引用 gulp-sass
const sass = require('gulp-sass')(require('sass'));
// 引用 gulp-postcss
const postcss = require('gulp-postcss');
// 引用 autoprefixer
const autoprefixer = require('autoprefixer');
// 引用 cssnano
const cssnano = require('cssnano');
// 引用 gulp-babel
const babel = require('gulp-babel');
// 引用 gulp-sourcemaps
const sourcemaps = require('gulp-sourcemaps');
// 引用 browserSync
const browserSync = require('browser-sync').create();
// 引用 gulp-htmlmin、gulp-clean-css、gulp-uglify 壓縮 HTML、CSS、JavaScript 代碼
const htmlmin = require('gulp-htmlmin'); // 載入 gulp-htmlmin 套件
const cleanCSS = require('gulp-clean-css'); // 載入 gulp-clean-css 套件
const uglify = require('gulp-uglify'); // 載入 gulp-uglify 套件
// 引用 gulp-imagemin
// 使用時要降版號，Node.js 改為 8.17.0、gulp-imagemin 改為 7.1.0（我是改後者）
const gulpImagemin = require('gulp-imagemin');
// 引用 gulp-html-replace
const htmlreplace = require('gulp-html-replace');
// 引用 gulp-plumber
const gulpPlumber = require('gulp-plumber');
// 引用 gulp-gh-pages
const ghPages = require('gulp-gh-pages');

// 複製 index 檔案（工作名稱：copyFile）
gulp.task('copyHTML', () => 
    gulp.src('./src/index.html')
        .pipe(htmlreplace({         // 引入 css 及 js
            'css': 'css/all.css', 
            'js': 'js/all.js'
        }))
        .pipe(gulp.dest('./public'))
        .pipe(browserSync.stream()) // <= 注入更改內容
);

// 編譯 SCSS 檔案（工作名稱：styles）
gulp.task('sass', ()=> 
    gulp.src('src/style/**/*.scss')    // 指定要處理的 Scss 檔案目錄
        .pipe(gulpPlumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed',         // 壓縮 Scss
            includePaths: ['node_modules/bootstrap/scss/'], // 導入 sass 模塊可能路徑
        }).on('error', sass.logError))        // 編譯 Scss
        .pipe(postcss([autoprefixer(), cssnano()]))    // 使用 postcss 及 autoprefixer 進行 css 的編譯，另外引用 .browserslistrc 做網頁兼容性
        .pipe(gulp.dest('public/css'))  // 指定編譯後的 css 檔案目錄
        .pipe(browserSync.stream()) // <= 注入更改內容
);

// 編譯 JS ES6（工作名稱：babel）
gulp.task('babel', () =>
    gulp.src('src/js/all.js')
        .pipe(gulpPlumber())
        .pipe(sourcemaps.init())
        .pipe(babel())         // 相關設定可查看 .babelrc
        .pipe(gulp.dest('public/js'))
        .pipe(browserSync.stream()) // <= 注入更改內容
);

// 複製圖片（工作名稱：image）
gulp.task('image', function() {
  return gulp.src('./src/img/*')
    .pipe(gulp.dest('./public/img'))
  ;
});

// 壓縮圖片大小（工作名稱：image）
gulp.task('minify-image', function () {
  gulp.src('src/img/**')
      .pipe(gulpImagemin())
      .pipe(gulp.dest('public/img'));
});

// 複製檔案（工作名稱：copyFile）
gulp.task('copyFile', gulp.parallel('image'));

// 使用 watch 加入監看工作（工作名稱：watch）
// 加入 browserSync 的瀏覽器同步測試工具
gulp.task('watch', () => 
    // 網頁同步測試工具設定
    browserSync.init({
        browser: 'google chrome',   // 瀏覽器預設使用 google chrome
        server: {
        baseDir: './public', // <= 指向虛擬伺服器需存取的資料夾
        },
        port: 6600,     // 端口號碼
        reloadDelay: 2000,      // 瀏覽器重新加載時間
    }),
    gulp.watch('./src/*.html', gulp.series('copyHTML')),
    gulp.watch('./src/style/**/*.scss', gulp.series('sass')),
    gulp.watch('./src/js/**/*.js', gulp.series('babel')),
    gulp.watch('./src/img/**/*', gulp.series('copyFile'))
);

// 自動清除指定目錄檔案（工作名稱：clean）
gulp.task('clean', () => {
    return del(['./public']); // 需刪除檔案或目錄
});

// 壓縮 HTML（工作名稱：minify-html）
gulp.task('minify-html', () => {
    return gulp
      .src('src/*.html')
      .pipe(htmlmin({ collapseWhitespace: false, removeComments: true }))
      .pipe(gulp.dest('public/'));
});

// 壓縮 CSS（工作名稱：minify-css）
gulp.task('minify-css', () => {
    return gulp
      .src('src/style/*.css')
      .pipe(cleanCSS({ compatibility: 'ie8' }))
      .pipe(gulp.dest('public/css'));
});
  
// 壓縮 JavaScript（工作名稱：minify-js）
gulp.task('minify-js', () => {
    return gulp
      .src('src/js/*.js')
      .pipe(
        babel({
          presets: ['@babel/env'], // 使用 Babel 將 ES6+ 版本代碼編譯成 ES5 代碼
        })
      )
      .pipe(uglify()) // 進行 gulp-uglify 壓縮並優化 JavaScript
      .pipe(gulp.dest('public/js')); //
});

// 統一壓縮任務（工作名稱：minify）
gulp.task('minify', gulp.parallel('minify-html', 'minify-css', 'minify-js'));

// 定義名稱為 default 的 gulp 工作集（ gulp 的預設工作集）
// 指令：gulp
gulp.task('default', gulp.series('clean', 'copyHTML', 'copyFile', 'sass', 'babel', 'minify', 'watch'));

// 上傳至 github page（工作名稱：deploy）
gulp.task('deploy', function() {
  return gulp.src('./public/**/*')
    .pipe(ghPages());
});

