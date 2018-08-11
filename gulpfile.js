/* eslint-env node */
const configuration = {
	browsers: ["cover 95%"],
	sizes: {
		images: [
			{
				width: 250,
				suffix: "x1",
				quality: 0.75,
				webp: false
			},
			{
				width: 346,
				suffix: "x1",
				quality: 0.75,
				webp: false
			},
			{
				width: 692,
				suffix: "x2",
				quality: 0.75,
				webp: false
			}
		]
	},
	destination: "./dist",
	files: {
		destination: "./dist/**/*",
		javascript: [
			"src/javascript/**/*.js",
			"!src/javascript/sw/**/*.js"
		],
		libraries: {
			path: "src/javascript/libraries/",
			folders: [
				"common/*.js",
				"details/*.js",
				"list/*.js"
			]
		},
		main: "src/javascript/libraries/index.js",
		sw: "src/javascript/sw/main.js",
		ww: "src/javascript/worker/**/*.js",
		public: "src/public/**/*",
		images: "src/images/restaurants/**/*",
		icons: "src/images/icons/**/*",
		sass: "src/sass/**/*.sass",
		html: "src/*.html"
	}
};

let tasksettings = {
	production: false,
	compress: false,
	autoprefixer: false,
	transpile: false
};

const del = require('del');
const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const sequence = require("run-sequence");
const gulpif = require("gulp-if");
const babel = require("gulp-babel");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const merge = require("merge-stream");

const resize = (images, sizes) => {
	const imageResize = require("gulp-image-resize");
	const imagemin = require("gulp-imagemin");
	const clone = require("gulp-clone");
	const webp = require("gulp-webp");

	let stream = merge();

	for (size of sizes) {
		stream.add(
			images
				.pipe(
					clone()
				)
				.pipe(
					imageResize({
						width: size.width,
						crop: false,
						upscale: false,
						quality: size.quality || 1,
						noProfile: true,
						imageMagick: false
					}).on("error", e => {
						console.log(e);
					})
				)
				.pipe(imagemin([
					imagemin.gifsicle({ interlaced: true }),
					imagemin.jpegtran({ progressive: true }),
					imagemin.optipng({ optimizationLevel: 5 }),
					imagemin.svgo({
						plugins: [
							{ removeViewBox: true },
							{ cleanupIDs: false }
						]
					})
				]))
				.pipe(
					gulpif(size.webp, webp())
				)
				.pipe(
					rename({
						suffix: `-${size.width}${size.suffix || ""}`
					})
				)
		)
	}

	return stream;
};

const production = () => {
	tasksettings.production = true;
	tasksettings.compress = true;
	tasksettings.autoprefixer = true;
	tasksettings.transpile = true;
};

const deleteFiles = (array) => {
	return del(array);
};

gulp.task("build", done => {
	production();

	sequence(
		"clean:dist"
		["images", "webpack", "service-worker", "web-worker", "public"]
	);

	done();
});

gulp.task("default", ["images", "lint", "webpack", "service-worker", "web-worker", "public"], done => {
	const browserSync = require("browser-sync").create();

	gulp.watch(configuration.files.sass, ["webpack"]);
	gulp.watch(configuration.files.javascript, ["lint", "webpack"]);
	gulp.watch(configuration.files.sw, ["service-worker"]);
	gulp.watch(configuration.files.ww, ["web-worker"]);
	gulp.watch(configuration.files.html, ["webpack"]);
	gulp.watch(configuration.files.destination).on("change", browserSync.reload);

	browserSync.init({
		server: configuration.destination
	});

	done();
});

gulp.task("public", done => {
	gulp.src(configuration.files.public)
		.pipe(
			gulp.dest(configuration.destination)
		);

	done();
});

gulp.task("images", done => {
	const sizes = configuration.sizes.images;

	let images = gulp.src(configuration.files.images, { nodir: true });

	resize(images, sizes).pipe(gulp.dest(configuration.destination + "/img/restaurants"));

	done();
});

gulp.task("lint", done => {
	const eslint = require("gulp-eslint");

	gulp.src(configuration.files.javascript)
		.pipe(
			eslint()
		)
		.pipe(
			eslint.formatEach("compact", process.stderr)
		);

	done();
});

gulp.task("webpack", done => {
	const webpack = require("webpack-stream"),
		UglifyJsPlugin = require("uglifyjs-webpack-plugin"),
		HtmlPlugin = require("html-webpack-plugin"),
		CssExtractPlugin = require("mini-css-extract-plugin"),
		OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin"),
		CompressionPlugin = require("compression-webpack-plugin");

	deleteFiles([
		configuration.destination + "/*.js",
		"!" + configuration.destination + "/sw.js",
		"!" + configuration.destination + "/sw.js.map"
	]);

	webpack({
		entry: "./" + configuration.files.main,
		watch: false,
		mode: tasksettings.production ? "production" : "development",
		devtool: "inline-source-map",
		module: {
			rules: [
				{
					test: /\.html$/,
					exclude: /(node_modules|bower_components|server)/,
					use: [{ loader: "html-loader", options: { minimize: true } }]
				},
				{
					test: /\.js$/,
					exclude: /(node_modules|bower_components|server)/,
					use: {
						loader: "babel-loader",
						options: {
							plugins: [
								/*"transform-runtime",*/
								"syntax-dynamic-import"
							],
							presets: [
								"env"
							]
						}
					}
				},
				{
					test: /\.(css|sass)$/,
					exclude: /(node_modules|bower_components|server)/,
					use: [{
						loader: CssExtractPlugin.loader,
						options: {
							minimize: true
						}
					}, {
						loader: "css-loader", options: { minimize: true }
					}, {
						loader: "postcss-loader"
					}, {
						loader: "sass-loader"
					}]
				},
				{
					test: /\.(ttf|eot|svg|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            		exclude: /(node_modules|bower_components|server)/,
            		loader: "file-loader"
				},
				{
					test: /\.(png|jpg|gif)/,
					loader: "url-loader",
					options: {
						limit: 10000,
						fallback: "file-loader"
					}
				}
			]
		},
		plugins: [
			new HtmlPlugin({
				template: "src/index.html",
				filename: "./index.html"
			}),
			new HtmlPlugin({
				template: "src/restaurant.html",
				filename: "./restaurant.html"
			}),
			new CssExtractPlugin({
				filename: "[name].css",
				chunkFilename: "[id].css"
			}),
			new CompressionPlugin({
				exclude: /(node_modules|bower_components|server)/,
				asset: "[path].gz[query]",
				algorithm: "gzip",
				test: /\.js$|\.css$|\.html$/,
				threshold: 10240,
				minRatio: 0
			})
		],
		optimization: {
			minimizer: [
				new UglifyJsPlugin({
					test: /\.js$/,
					exclude: /(node_modules|bower_components)/,
					parallel: true,
					sourceMap: tasksettings.production ? false : true
				}),
				new OptimizeCSSAssetsPlugin({})
			]
		}
	}).pipe(gulp.dest(configuration.destination));

	done();
});

gulp.task("service-worker", done => {
	gulp.src(configuration.files.sw)
		.pipe(
			gulpif(
				!tasksettings.production,
				sourcemaps.init()
			)
		)
		.pipe(
			gulpif(
				tasksettings.transpile || tasksettings.compress,
				babel({
					presets: ["env"]
				}).on("error", e => {
					console.log(e);
				})
			)
		)
		.pipe(
			gulpif(
				tasksettings.compress,
				uglify().on("error", e => {
					console.log(e);
				})
			)
		)
		.pipe(
			rename({ basename: "sw" })
		)
		.pipe(
			gulpif(
				!tasksettings.production,
				sourcemaps.write(".")
			)
		)
		.pipe(
			gulp.dest(configuration.destination)
		);

	done();
});

gulp.task("web-worker", done => {
	gulp.src(configuration.files.ww)
		.pipe(
			gulpif(
				!tasksettings.production,
				sourcemaps.init()
			)
		)
		.pipe(
			gulpif(
				tasksettings.transpile || tasksettings.compress,
				babel({
					presets: ["env"]
				}).on("error", e => {
					console.log(e);
				})
			)
		)
		.pipe(
			gulpif(
				tasksettings.compress,
				uglify().on("error", e => {
					console.log(e);
				})
			)
		)
		.pipe(
			gulpif(
				!tasksettings.production,
				sourcemaps.write(".")
			)
		)
		.pipe(
			gulp.dest(configuration.destination + "/js/worker")
		);

	done();
});