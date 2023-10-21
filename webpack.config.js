const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const Dotenv = require('dotenv-webpack');

module.exports = [{
  name: 'client',
  entry: {
    client : './client/src/game.ts',
  },
  watch:true,
  mode: 'development',
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'ts-loader'
    }],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'client/dist'),
  },
  optimization: {
    minimize: true,
    minimizer: [new UglifyJsPlugin({
      include: /\.min\.js$/
    })]
  },
  plugins: [
    new Dotenv()
  ]
},{
name: 'server',
    entry: {
        server : './server/src/server.ts',
    },
   /* node: {
        fs: 'empty',
        net: 'empty'
    }, */
    watch:true,
    mode: 'development',
    target: 'node',
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
      path: path.resolve(__dirname, 'server/dist'),
    },
    externals: {
      bufferutil: "bufferutil",
      "utf-8-validate": "utf-8-validate",
    },
}];