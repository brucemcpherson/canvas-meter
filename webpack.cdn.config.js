var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path');
console.log(debug? "development":"production");


module.exports = {
  context: path.join(__dirname, "src"),
  devtool:  "source-map",
  entry: "./index.js",

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: "/node_modules/",
        loader: 'babel-loader',
        query: {
          presets: ["babel-preset-es2015", "babel-preset-stage-0","babel-preset-stage-2"],
          plugins:["babel-plugin-transform-object-rest-spread"]
        }
      }
    ]
  },

  output: {
    path: __dirname + "/cdn",
    filename: "canvas-meter.v1.0.2.min.js"
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



