const path = require('path');
const packageJson = require('./package.json');

module.exports = (opts) => {
  let isProduction =
    opts.argv && (opts.argv.p || opts.argv.mode === 'production');

  return {
    mode: isProduction ? 'production' : 'development',
    output: {
      filename: `index.js`,
      libraryTarget: 'system',
      path: path.resolve(process.cwd(), 'dist'),
      uniqueName: packageJson.name,
      publicPath: '',
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
            loader: 'babel-loader',
          },
        },
        {
          test: /\.html$/i,
          use: ['html-loader'],
        },
        {
          test: /\.css$/i,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
            {
              loader: 'postcss-loader',
            },
          ],
        },
      ],
    },
    devtool: 'source-map',
    devServer: {
      compress: true,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      firewall: false,
      client: {
        host: 'localhost',
      },
      onListening: ({ compiler }) => {
        const { https, client } = compiler.options.devServer;
        const { publicPath, filename } = compiler.options.output;
        const protocol = https ? 'https://' : 'http://';
        const port = !!client.port ? `:${client.port}` : '';
        const path = ['', 'auto'].includes(publicPath) ? '/' : publicPath;
        console.log(
          `⚡️ single-spa application entry: ${protocol}${client.host}${port}${path}${filename}`
        );
      },
    },
    externals: ['single-spa'],
  };
};
