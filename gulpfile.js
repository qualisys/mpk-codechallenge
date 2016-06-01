'use strict';

var gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	plumber = require('gulp-plumber'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload;

gulp.task('scss', function() {
	gulp.src('./source/styles/style.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(autoprefixer({
			cascade: false
		}))
		.pipe(gulp.dest('./source/styles/dist/'))
		.pipe(reload({ stream: true }));
});

gulp.task('serve', ['scss'], function() {
	browserSync({
		server: {
			baseDir: 'source'
		},
		open: true,
		ui: false,
		online: false
	});

	gulp.watch(['styles/*.scss'], { cwd: 'source/' }, ['scss']);
	gulp.watch(['**/*.html', 'app/**/*.js', 'images/**/*.svg', 'images/**/*.png', 'images/**/*.jpg'], { cwd: 'source'}, reload);
});