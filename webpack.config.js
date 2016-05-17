var path = require('path');
var webpack = require('webpack');
module.exports = {
    entry:'./src/core/Ukulele.ts',
    output: {
        filename: 'uku.js',
        libraryTarget: "umd",
		umdNamedDefine: false
    },
    devtool: 'source-map',
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ],
    resolve:{
        root: path.resolve('./src'),
        extensions: ['','webpack.js','.ts','.js']
    },
    module:{
        loaders:[
            { 
                test: /\.tsx?$/,
                loader:'ts-loader',
                exclude:/node_modules/
            }
        ]
    }
}