const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const Dotenv = require('dotenv-webpack');
const path = require("path");
const packageJsonDeps = require('./package.json').dependencies;

module.exports = {
  entry: "./src/index",
  mode: "development",
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    port: 8886,
  },
  output: {
    publicPath: "auto",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react"],
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "smartresult",
      library: { type: "var", name: "smartresult" },
      filename: "remoteEntry.js",
      exposes: {
        "./Button": "./src/components/Button",
      },
      shared: {
        ...packageJsonDeps,
        react: { singleton: true, eager: true, requiredVersion: packageJsonDeps.react },
        "react-dom": { singleton: true, eager: true, requiredVersion: packageJsonDeps["react-dom"] }
      },
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new Dotenv(),
  ],
};
