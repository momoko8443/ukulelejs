var path = require('path');
var webpack = require('webpack');
const { CheckerPlugin } = require('awesome-typescript-loader')
module.exports = {
    entry: './src/core/Ukulele.ts',
    output: {
        filename:"uku.js",
        libraryTarget: "umd",
        path: path.resolve(__dirname, 'dist/'),
        umdNamedDefine: true
    },
    devtool: 'source-map',
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true
        }),
        new CheckerPlugin()
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'awesome-typescript-loader',
                exclude: /node_modules/
            }
        ]
    },
    stats: {
        colors: true,
        modules: true,
        reasons: true,
        errorDetails: true
    }
}