const path = require('path');

const TerserPlugin = require('terser-webpack-plugin');

const Dotenv = require('dotenv-webpack');

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
        minimizer: [new TerserPlugin()]
      },
      plugins: [
        new Dotenv({
          path: '.env',
          systemvars: false,
        }),
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