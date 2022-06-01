const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");
const packageJsonDeps = require('./package.json').dependencies;

module.exports = {
  entry: "./src/index",
  mode: "development",
  devServer: {
    historyApiFallback: {
      disableDotRule: true,
      historyApiFallback: true,
      index: path.publicPath,
      contentBase: './'
    },
    static: {
      directory: path.join(__dirname, "dist"),
    },
    port: 8880,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index_bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /bootstrap\.js$/,
        loader: "bundle-loader",
        options: {
          lazy: true,
        },
      },
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react"],
        },
      },
      {
        test: /\.css$/,
				use: [
					"style-loader", // 3. Inject styles into DOM
					"css-loader", // 2. Turns css into js
					// 1. Turns sass into css (when added later)
				]
      },
      {
        test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
				use: [
					"file-loader"
				]
      }
    ],
  },
  //http://localhost:8882/remoteEntry.js
  plugins: [
    new ModuleFederationPlugin({
      name: "smartschool",
      remotes: {
        smartresult: `smartresult@${getRemoteEntryUrl(8886)}`,
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
  ],
};

function getRemoteEntryUrl(port) {
  const { CODESANDBOX_SSE, HOSTNAME = "" } = process.env;

  // Check if the example is running on codesandbox
  // https://codesandbox.io/docs/environment
  if (!CODESANDBOX_SSE) {
    return `//localhost:${port}/remoteEntry.js`;
  }

  const parts = HOSTNAME.split("-");
  const codesandboxId = parts[parts.length - 1];

  return `//${codesandboxId}-${port}.sse.codesandbox.io/remoteEntry.js`;
}
