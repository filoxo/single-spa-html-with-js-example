const path = require("path");

module.exports = {
  output: {
    filename: `index.js`,
    libraryTarget: "system",
    path: path.resolve(process.cwd(), "dist"),
    jsonpFunction: `webpackJsonp_sspahtmlwithjs`,
  },
  module: {
    rules: [
      {
        parser: {
          system: false,
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.html$/i,
        use: ["html-loader"],
      },
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: "postcss-loader",
          },
        ],
      },
    ],
  },
  devtool: "sourcemap",
  devServer: {
    compress: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    disableHostCheck: true,
  },
  externals: ["single-spa"],
};
