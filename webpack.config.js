var path = require('path');
module.exports = {
    entry:'./src/ukulele/core/Ukulele.ts',
    output: {
        filename: './dist/uku.js',
        libraryTarget: "umd",
		umdNamedDefine: false
    },
    resolve:{
        root: path.resolve('./src/ukulele'),
        extensions: ['','webpack.js','.ts','.js']
    },
    module:{
        loaders:[
            {test: /\.ts$/,loader:'ts-loader'}
        ]
    }
}