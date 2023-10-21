const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const Dotenv = require('dotenv-webpack');
//console.log(process.argv);
//console.log(process.argv.indexOf('NODE_ENV'));


module.exports = (env, argv) => {

  return [
    {
      name: 'client',
      entry: {
        client : './client/src/game.ts',
      },
      watch: argv.mode !== "production" && true,
      mode: argv.mode ?? "development",
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
        new Dotenv({
          path: '.env',
          systemvars: false,
        })
      ]
    },{
    name: 'server',
        entry: {
            server : './server/src/server.ts',
        },
        watch: argv.mode !== "production" && true,
        mode: argv.mode ?? "development",
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
    }
  ];
};