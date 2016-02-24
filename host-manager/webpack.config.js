var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	entry: {
        pack: "./scripts/release.js",
        vendor: "./scripts/vendor.js",
        common: ["react", "react-dom"]
    },
	context: __dirname + '/app/src',
	output: {
		path: __dirname + '/app/prd',
        publicPath: "/app/prd/",
		filename: "[name].js"
	},
    module: {
        noParse: ['jquery'],
        loaders: [
            {
                test: /\.js|\.jsx$/,
                exclude: /node_modules|vendor/,
                loader: "babel",
                query: {
                    presets: ['es2015', "react"]
                }
            },
            {
                test: /\.scss|\.css$/,
                // loader: 'style!css!sass'
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader")
            }
        ]
    },
    resolve: {
        alias: {
            // "jquery": __dirname + '/app/prd/' + 'jquery.min.js',

        },
        extensions: ['', '.js', '.jsx']
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin("common", /* filename= */"common.js"),
        new ExtractTextPlugin("[name].css")
    ],
    devtool: 'source-map',
    watch: true
}