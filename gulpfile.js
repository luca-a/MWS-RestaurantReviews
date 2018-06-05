/* eslint-env node */
const configuration = {
	browsers: [ "cover 95%" ],
	sizes: {
		images: [
			{
				width: 250,
				suffix: "x1",
				quality: 1
			},
			{
				width: 346,
				suffix: "x1",
				quality: 1
			},
			{
				width: 692,
				suffix: "x2",
				quality: 0.9
			}
		]
	},
	destination: "./dist",
	files: {
		javascript: [
			"src/javascript/**/*.js",
			"!src/javascript/sw/**/*.js"
		],
		libraries: [
			"src/javascript/libraries/*.js",
			"src/javascript/external/*.js"
		],
		main: "src/javascript/main/*.js",
		sw: "src/javascript/sw/main.js",
		public: "src/public/**/*",
		images: "src/images/restaurants/**/*",
		icons: "src/images/icons/**/*",
		sass: "src/sass/**/*.sass",
		html: "src/*.html"
	}
};

let tasksettings = {
	"compress": false,
	"autoprefixer": false,
	"polyfiller": false,
	"transpile": false
};

const gulp = require("gulp");
const sequence = require("run-sequence");
const gulpif = require("gulp-if");
const babel = require("gulp-babel");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const merge = require("merge-stream");

const resize = (images, sizes) => {
	const imageResize = require("gulp-image-resize");
	const clone = require("gulp-clone");

	let stream = merge();

	for(size of sizes) {
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
					imageMagick: true
				})
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
	tasksettings.compress = true;
	tasksettings.autoprefixer = true;
	tasksettings.polyfiller = true;
	tasksettings.transpile = true;
};

gulp.task("build", done => {
	production();

	sequence(
		["html", "images", "styles", "scripts", "service-worker", "public"]
	);

	done();
});

gulp.task("default", ["html", "images", "styles", "lint", "scripts", "service-worker", "public"], done => {
	const browserSync = require("browser-sync").create();

	gulp.watch(configuration.files.sass, ["styles"]);
	gulp.watch(configuration.files.javascript, ["lint", "scripts"]);
	gulp.watch(configuration.files.sw, ["service-worker"]);
	//gulp.watch(configuration.files.public, ["public"]);
	gulp.watch(configuration.files.html, ["html"]);
	gulp.watch(configuration.destination + configuration.files.html).on("change", browserSync.reload);

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

gulp.task("html", done => {
	gulp.src(configuration.files.html)
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
		eslint.format()
	)
	.pipe(
		eslint.failOnError()
	);

	done();
});

gulp.task("scripts", done => {
	const concat = require("gulp-concat");
    
    let files = configuration.files.libraries;

    if(tasksettings.polyfiller) {
        files.push("node_modules/babel-polyfill/dist/polyfill.js");
	}

	merge(
        gulp.src(
            files
        )
		.pipe(
			concat("bundle.js")
		),
		gulp.src(
			configuration.files.main
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
		gulp.dest(configuration.destination + "/js")
	);

	done();
});

gulp.task("service-worker", done => {
	const sw = configuration.files.sw;

	gulp.src(sw)
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
		gulp.dest(
			configuration.destination
		)
	);

	done();
});

gulp.task("styles", done => {
	const sass = require("gulp-sass");
	const autoprefixer = require("gulp-autoprefixer");

	gulp.src(configuration.files.sass)
	.pipe(
		gulpif(
			tasksettings.compress,
			sass({
				outputStyle: "compressed"
			}).on("error", sass.logError),
			sass().on("error", sass.logError)
		)
	)
	.pipe(
		gulpif(
			tasksettings.autoprefixer,
			autoprefixer({
				browsers: configuration.browsers
			})
		)
	)
	.pipe(
		gulp.dest(configuration.destination + "/css")
	);

	done();
});