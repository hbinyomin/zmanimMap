const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  target: ['web', 'es5'],
  entry: './src/zmanimMap.js',
  optimization: {
    minimizer: [new TerserPlugin({ extractComments: false })],
    splitChunks: {
      chunks: 'all',
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'PCS Webpack Demo',
      year: new Date().getFullYear(),
      template: './src/index.html'
    }),
    new ESLintPlugin(),
    new MiniCssExtractPlugin()
  ],
  output: {
    // publicPath: '',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  module: {
    rules: [
      // {
      //   test: /\.css$/i,
      //   use: ['style-loader', 'css-loader']
      // },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset',
      },
      // {
      //   test: /\.(png|jpg)$/,
      //   loader: 'url-loader'
      // },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ]
  }
};