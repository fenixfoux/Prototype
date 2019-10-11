//подключение модуля
var gulp         = require('gulp');
var concat       = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');  
var cleanCss     = require('gulp-clean-css');
var uglify       = require('gulp-uglify');
var del          = require('del');
var browserSync  = require('browser-sync').create();

var sourcemaps   = require('gulp-sourcemaps');
var stylus       = require('gulp-stylus');

var imagemin =require('gulp-imagemin');
var rename   =require('gulp-rename');

//я еще не знаю зачем мне переменные плагинов верстки но пусть пока будут xD
var jquery   =require('jquery'); 

//указывается в каком порядке объеденять фаилы и фаилы
const cssFiles = [
	'./src/css/main.styl',
	'./src/css/color.styl' 
],
	jsFiles = [
	'./src/js/lib.js',
	'./src/js/main.js'
],
	jsLibs = [
	'node_modules/jquery/dist/jquery.min.js',
	'node_modules/slick-carousel/slick/slick.min.js'
	],
	styleLibs = [
	'node_modules/normalize.css/normalize.css',
	'node_modules/slick-carousel/slick/slick.css',
	'node_modules/slick-carousel/slick/slick-theme.css'
	],
	fontLibs =[
	'src/css/fonts/*.ttf',
	'src/css/fonts/*.woff',
	'src/css/fonts/*.woff2',
	'src/css/fonts/*.eot',
	'src/css/fonts/*.svg'
	],
	imagepath = [
	'src/img/**/*'
	]
//task for style css
function styles() {
	return gulp.src(cssFiles)
	.pipe(sourcemaps.init())
	.pipe(stylus())
	//объединение фаилов в один
	.pipe(concat('style.css'))
	//автопрефиксер
	.pipe(autoprefixer({
			overrideBrowserslist: ['last 2 version'],
            cascade: false
        }))
	//минификация фаилов
	.pipe(cleanCss({ 
		level: 2
	}))
	.pipe(sourcemaps.write('./'))
	.pipe(rename({
		suffix: '.min'
	}))
	//папка назначения, куда компилить фаилы
	.pipe(gulp.dest('./build/css/'))
	.pipe(browserSync.stream());
}

//Таск на срипты JS
function scripts(){
	return gulp.src(jsFiles)
	.pipe(concat('script.js'))
	//минификация js
	.pipe(uglify({
		toplevel: true//максимальный уроень сжатия(когда ну очень холодно xD)
	}))
	//конечная директория для компил. js
	.pipe(rename({
		suffix: '.min'
	}))
	.pipe(gulp.dest('./build/js/'))
	.pipe(browserSync.stream());
}
//стереть все к чертям, папку Build xD 
function clean(){
	return del(['build/*'])
}
//для сжатия картинок 

function imgCompress(){
	return(gulp.src(imagepath))
	.pipe(imagemin([ 
	    imagemin.gifsicle({interlaced: true}),
	    imagemin.jpegtran({progressive: true}),
	    imagemin.optipng({optimizationLevel: 5})
		]))
	.pipe(gulp.dest('build/img'))
}

//перенос JS внешних библиотек
function transferjslibs(){
	return(gulp.src(jsLibs))
	.pipe(gulp.dest('./build/js/'))	
}
//перенос CSS библиотек
function transfercsslibs(){
	return(gulp.src(styleLibs))
	.pipe(gulp.dest('build/css/'))
}
//Перенос шрифтов
function transferfonts(){
	return(gulp.src(fontLibs))
	.pipe(gulp.dest('build/css/fonts'))
}
//Перенос картинок (не сжатых) 
function transferImg(){
	return(gulp.src(imagepath))
	.pipe(gulp.dest('build/img'))
}

function watch(){
	browserSync.init({
	   server: {
	       baseDir: "./"
	   }
	});
	//слежение за CSS фаилами
	//gulp.watch('./src/css/**/*.css', styles)
	gulp.watch('./src/css/**/*.styl', styles) 
	//слежение за JS фаилами
	gulp.watch('./src/js/**/*.js', scripts)
	//слежение за изменениями HTML
	gulp.watch("./*.html").on('change', browserSync.reload);
}

//Сжатие картинок
gulp.task('imageCompress', imgCompress);
//Таск для перенеса в папку билд внешних библиотек
gulp.task('transferlibs', gulp.series(transferjslibs, transfercsslibs, transferfonts, transferImg));
//Таск вызывающий функцию styles
gulp.task('styles1', styles);
//Таск вызывающий функцию scripts
gulp.task('scripts1', scripts);
//Task для очистки папки build от фаилов
gulp.task('del1', clean);
//Таск для отслеживания изменений
gulp.task('watch', watch);
//удаление фаилов в папке build и запсук styles и scripts
gulp.task('build', gulp.series(clean, gulp.parallel(
	styles, scripts, transferjslibs, transfercsslibs, 
	transferfonts, transferImg)));
//запускаем таск build и watch последовательно
gulp.task('dev', gulp.series('build', 'watch'));