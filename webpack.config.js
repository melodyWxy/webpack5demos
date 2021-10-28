// const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = {
  entry: './src/index.js',
  output: {
    clean: true,
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  externals: {
    jquery: '$',
  },
  resolve: {
    alias: {
      "@utils": path.resolve(__dirname, 'src/utils/')
    },
  },
  devServer: {
    compress: true,
    port: 3000,
    headers: () => ({
      'X-Bar': ['key1=value1', 'key2=value2']
    }),
    historyApiFallback: true
    // https: true,
    // http2: true
  },
  devtool: 'source-map',
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
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: 'index.html',
    }),
    new BundleAnalyzerPlugin()
  ]
};


module.exports = config;