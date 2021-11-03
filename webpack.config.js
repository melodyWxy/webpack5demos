// const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  entry: './src/index.js',
  experiments: {
    outputModule: true,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'mylib.js',
    library: {
      // name: "mylib",
      type: "module"
    },
  },

  resolve: {
    alias: {
      "@utils": path.resolve(__dirname, './src/utils')
    }
  },
  externals: {
    "$": "jQuery"
  },
  devServer: {
    compress: true,
    port: 3000,
    headers: {
      'X-Fast-Id': 'p3fdg42njghm34gi9ukj',
    },
    historyApiFallback: true
    // https: true,
    // http2: true
  },
  // devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: 'index.html',
    }),
  ]
};


module.exports = config;