'use strict';
// var CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    entry: {
        js: ['./.tmp/concat/scripts/scripts.js', './.tmp_imploded/styles/main.css']
    },
    output: {
        path: __dirname + '/dist/imploded',
        filename: 'dcae-bundle.js'
    },
    // plugins: [
    //     new CompressionPlugin({
    //         asset: "[path].gz[query]",
    //         algorithm: "gzip",
    //         test: /\.js$|\.css$|\.html$/
    //     })
    // ],
    module: {
        loaders: [
            { test: /\.(js|jsx)$/, loaders: ['babel-loader'], exclude: /node_modules/ },

            // required for font icons
            { test: /\.(woff|woff2)(\?.*)?$/, loader: 'url-loader?limit=16384&mimetype=application/font-woff' },
            { test: /\.(ttf|eot|otf)(\?.*)?$/, loader: 'file-loader' },
            { test: /\.(png|jpg|svg)(\?.*)?$/, loader: 'url-loader?limit=16384' },
            { test: /\.css$/, loader: "style-loader!css-loader" }
        ]
    }
};
