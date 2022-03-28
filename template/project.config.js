module.exports = {
  /**
   * webpack config options
   * see: https://webpack.js.org/configuration/
   */
  webpack: {},
  /**
   * style configs
   */
  style: {
    /**
     * css-loader options
     * see: https://webpack.js.org/loaders/css-loader#options
     */
    css: {},
    /**
     * less-loader options
     * see: https://webpack.js.org/loaders/less-loader#options
     */
    less: {
      lessOptions: {
        modifyVars: { '@primary-color': '#1DA57A' },
        javascriptEnabled: true,
      }
    },
    /**
     * sass-loader options
     * see: https://webpack.js.org/loaders/sass-loader/#options
     */
    sass: {},
    /**
     * postcss-loader options
     * https://webpack.js.org/loaders/postcss-loader/#options
     */
    postcss: {},
  },
  /**
   * babel-loader options
   * see: https://webpack.js.org/loaders/babel-loader/#options
   */
  babel: {},
  /**
   * ts-loader options
   * see: https://github.com/TypeStrong/ts-loader
   */
  ts: {},
  /**
   * file-loader options
   * see: https://github.com/webpack-contrib/file-loader
   */
  file: {},
  /**
   * EslintWebpackPlugin options
   * see: https://webpack.js.org/plugins/eslint-webpack-plugin/#options
   */
  eslint: {},
  /**
   * StylelintWebpackPlugin options
   * see: https://webpack.js.org/plugins/stylelint-webpack-plugin/#options
   */
  styleLint: {},
  // DevServer see: https://webpack.js.org/configuration/dev-server
  devServer: {
    port: 3002
  }
}