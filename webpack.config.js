const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');



module.exports = {
  entry: './src/game.ts',
  watch:true,
  mode: 'development',
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'ts-loader'
    }]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: true,
    minimizer: [new UglifyJsPlugin({
      include: /\.min\.js$/
    })]
  }
};