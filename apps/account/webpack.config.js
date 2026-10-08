const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = (env = {}, argv = {}) => {
  const isProd = argv.mode === "production";
  return {
    mode: isProd ? "production" : "development",
    devtool: isProd ? false : "source-map",
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      publicPath: "auto",
      clean: true,
      filename: isProd ? "[name].[contenthash].js" : "[name].js",
    },
    module: {
      rules: [
        { test: /\.vue$/, loader: "vue-loader" },
        { test: /\.css$/, use: ["style-loader", "css-loader"] },
      ],
    },
    resolve: { extensions: [".js", ".vue"] },
    plugins: [
      new ModuleFederationPlugin({
        name: "account",
        filename: "remoteEntry.js",
        exposes: {
          // PUBLIC CONTRACT: not a Vue component (the shell is React and
          // cannot render Vue components) but a mount function. The Vue app
          // lives in its own DOM island. This is the standard cross-framework
          // federation pattern.
          "./mount": "./src/mount.js",
        },
        shared: {
          // Only ONE Vue app exists, so vue itself is not shared/singleton.
          // The event bus IS shared — it's framework-neutral.
          "@mfe-shop/event-bus": { singleton: true },
        },
      }),
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({ template: "./public/index.html" }),
    ],
    devServer: {
      port: 3003,
      hot: true,
      headers: { "Access-Control-Allow-Origin": "*" },
    },
  };
};
