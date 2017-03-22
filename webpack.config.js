var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path');
console.log(debug? "development":"production");


module.exports = {
  context: path.join(__dirname, ""),
  devtool: debug ? "eval" : 'cheap-module-source-map',
  entry: "./test/test.js",

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: "/node_modules/",
        include:"/test/",
        loader: 'babel-loader',
        query: {
          presets: ["babel-preset-es2015", "babel-preset-stage-0","babel-preset-stage-2"],
          plugins:["babel-plugin-transform-object-rest-spread"]
        }
      }
    ]
  },

  output: {
    path: __dirname + "/test",
    filename: "testweb.min.js"
  },
  
  plugins: debug ? [] : [

    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      mangle: {
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        screw_ie8: true
      },
      comments: false
    }),
    //new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ],
};



