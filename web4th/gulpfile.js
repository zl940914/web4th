/**
 * gulp demo
 *
 * by kele527
 */

var del=require('del');
var gulp=require('gulp');
var uglify=require('gulp-uglify'); //js压缩
var mincss=require('gulp-clean-css');//压缩css
var inline=require('gulp-inline-source'); //资源内联 （主要是js，css，图片）
var include=require('gulp-include'); //资源内联（主要是html片段）
var sequence=require('gulp-sequence');
var useref=require('gulp-useref'); //合并文件
var gulpif=require('gulp-if');
var print=require('gulp-print'); //打印命中的文件
var connect=require('gulp-connect'); //本地服务器

var jshint=require('gulp-jshint'); //js 代码校验
var livereload=require('gulp-livereload'); //页面刷新

var concat = require('gulp-concat');//文件合并
var rename = require('gulp-rename');//文件更名
var notify = require('gulp-notify');//提示信息
var imagemin = require('gulp-imagemin');//图片压缩
var pngcrush = require('imagemin-pngcrush');
var spriter=require('gulp-css-spriter');
//清理构建目录
gulp.task('clean',function (cb) {
    del(['dist']).then(function () {
        cb()
    })
});


//合并 压缩 css
gulp.task('mincss',function () {
    return gulp.src('./src/css/*.css')
        .pipe(concat('min.css'))
        .pipe(mincss())
        .pipe(gulp.dest('dist/css'))
});
//合并,压缩 js
gulp.task('minjs',function () {
    return gulp.src('./src/js/*.js')
        .pipe(concat('min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
});

// 检查js
gulp.task('hint', function() {
    return gulp.src('src/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// 压缩图片
gulp.task('image', function() {    
    return gulp.src('src/images/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngcrush()]
        }))
        .pipe(gulp.dest('./dist/images'));
});

//雪碧图合成
gulp.task('spriter', function() {
    return gulp.src('./src/css/sp.css')//目标css
        .pipe(spriter({
            'spriteSheet': './dist/images/spritesheet.png',
            'pathToSpriteSheetFromCSS': '../images/spritesheet.png' //这是在css引用的图片路径，很重要
        }))
        .pipe(gulp.dest('./dist/css')); //最后生成出来
});

//资源嵌入
gulp.task('html', function () {
    return gulp.src('./src/*.html')
        .pipe(inline())//把js内联到html中
        .pipe(include())//把html片段内联到html主文件中
        .pipe(useref())//根据标记的块  合并js或者css
        .pipe(gulpif('*.js',uglify()))
        .pipe(gulpif('*.css',mincss()))
        .pipe(gulpif('*.images',imagemin()))
        .pipe(connect.reload()) //重新构建后自动刷新页面
        .pipe(gulp.dest('dist'));
});


//本地服务器  支持自动刷新页面
gulp.task('connect', function() {
    connect.server({
        root: './dist', //本地服务器的根目录路径
        port:8080,
        livereload: true
    });
});

//sequence的返回函数只能运行一次 所以这里用function cb方式使用
gulp.task('watchlist',function (cb) {
    sequence('clean',['hint','mincss','minjs','html','image'])(cb)
});

gulp.task('watch',function () {
    gulp.watch(['./src/**'],['watchlist']);
});


//中括号外面的是串行执行， 中括号里面的任务是并行执行。
gulp.task('default',function (cb) {
    sequence('clean',['hint','mincss','minjs','html','image','connect','spriter'],'watch')(cb)
});



