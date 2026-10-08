const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
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
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: { presets: ["@babel/preset-env", ["@babel/preset-react", { runtime: "automatic" }]] },
          },
        },
        { test: /\.css$/, use: ["style-loader", "css-loader"] },
      ],
    },
    resolve: { extensions: [".js", ".jsx"] },
    plugins: [
      new ModuleFederationPlugin({
        name: "shell",
        remotes: {
          // The shell discovers MFEs only through these public contracts:
          shop: "shop@http://localhost:3001/remoteEntry.js",
          search: "search@http://localhost:3002/remoteEntry.js",
          account: "account@http://localhost:3003/remoteEntry.js",
          checkout: "checkout@http://localhost:4200/remoteEntry.js",
        },
        shared: {
          react: { singleton: true, requiredVersion: "^18.0.0" },
          "react-dom": { singleton: true, requiredVersion: "^18.0.0" },
          "react-router-dom": { singleton: true },
          "@mfe-shop/event-bus": { singleton: true },
          "@mfe-shop/ui": { singleton: true },
        },
      }),
      new HtmlWebpackPlugin({ template: "./public/index.html" }),
    ],
    devServer: {
      port: 3000,
      hot: true,
      historyApiFallback: true,
      headers: { "Access-Control-Allow-Origin": "*" },
    },
  };
};
