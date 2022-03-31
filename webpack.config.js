const path = require("path");
const packageJson = require("./package.json");

const isAnyOf = (value, list) => list.includes(value);

module.exports = (opts) => {
  let isProduction =
    opts.argv && (opts.argv.p || opts.argv.mode === "production");

  return {
    mode: isProduction ? "production" : "development",
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
