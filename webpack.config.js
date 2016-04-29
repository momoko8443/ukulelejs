var webpack = require('webpack');
var path = require('path');
var libraryName = 'Ukulele';

var config = {
	entry: __dirname + '/src/ukulele/core/Ukulele.js',
	devtool: 'source-map',
	output: {
		path: __dirname + '/dist',
		filename: 'ukulele.js',
		//library: libraryName,
		libraryTarget: 'umd',
		umdNamedDefine: false
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel',
				exclude: /(node_modules|bower_components|test)/,
				query: {
					presets: ['es2015']
				}
			 },
			// {
		    //     test: /(\.jsx|\.js)$/,
		    //     loader: "eslint-loader",
		    //     exclude: /node_modules/
		    // }
		]
	},
	resolve: {
		root: path.resolve('./src'),
		extensions: ['', '.js']
	}
}
module.exports = config;
/*
module.exports = {
	entry: "./src/ukulele/core/Ukulele.js",
	output: {
		path: "./dist",
		filename: "ukulele.js",
        libraryTarget: "amd"
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components|test)/,
				loader: 'babel',
				query: {
					presets: ['es2015']
				}
			}
        ]
	}
}
*/
