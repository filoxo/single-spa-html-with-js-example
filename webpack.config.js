const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const StandaloneSingleSpaPlugin = require("standalone-single-spa-webpack-plugin");
const packageJson = require("./package.json");

const isAnyOf = (value, list) => list.includes(value);

module.exports = (env, argv) => {
  let prodMode = argv?.p || argv?.mode === "production";

  return {
    mode: prodMode ? "production" : "development",
    output: {
      filename: `index.js`,
      libraryTarget: "system",
      path: path.resolve(process.cwd(), "dist"),
      uniqueName: packageJson.name,
      publicPath: "",
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
                modules: true,
              },
            },
            {
              loader: "postcss-loader",
            },
          ],
        },
      ],
    },
    plugins: [
      // These plugins enable standalone mode for local development
      !prodMode && new HtmlWebpackPlugin(),
      new StandaloneSingleSpaPlugin({
        appOrParcelName: packageJson.name,
        disabled: prodMode,
      }),
    ].filter(Boolean),
    devtool: "source-map",
    devServer: {
      compress: true,
      historyApiFallback: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      onListening: function ({
        server /* https://nodejs.org/api/net.html#class-netserver */,
        compiler,
      }) {
        if (!server)
          throw new Error("webpack-dev-server is missing a server instance");

        // config values
        const { port: serverPort, address } = server.address();
        const { publicPath, filename } = compiler.options.output;

        // derived values
        const protocol = compiler.options.devServer.https
          ? "https://"
          : "http://";
        const host = address === "::" ? "localhost" : address;
        const port = Boolean(serverPort) ? `:${serverPort}` : "";
        const path = isAnyOf(publicPath, ["", "auto"]) ? "/" : publicPath;

        console.log(
          `\n  ⚡️ single-spa application entry: ${protocol}${host}${port}${path}${filename}\n`
        );
      },
    },
    externals: ["single-spa"],
  };
};
