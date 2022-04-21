/**
 * MIT License
 * Copyright (c) 2021 RanYunLong<549510622@qq.com> @quick-toolkit/class-transformer
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {
  Configuration,
  WatchIgnorePlugin,
  WebpackPluginInstance,
  EnvironmentPlugin,
  IgnorePlugin,
  AutomaticPrefetchPlugin,
} from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import StylelintWebpackPlugin from 'stylelint-webpack-plugin';
import ESLintWebpackPlugin from 'eslint-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import postcssNormalize from 'postcss-normalize';
import { merge } from 'webpack-merge';
import path from 'path';
import fs from 'fs';

const isProduction = process.env.NODE_ENV === 'production';

const webpackDevClientEntry = require.resolve(
  'react-dev-utils/webpackHotDevClient'
);
const reactRefreshOverlayEntry = require.resolve(
  'react-dev-utils/refreshOverlayInterop'
);

let babelLoaderOptions = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: isProduction ? undefined : [require.resolve('react-refresh/babel')],
};
let tsLoaderOptions = {
  // disable type checker - we will use it in fork plugin
  transpileOnly: true,
  allowTsInNodeModules: true,
  configFile: path.resolve('tsconfig.json'),
};
let cssLoaderOptions = {
  sourceMap: !isProduction,
};
let lessLoaderOptions = {
  sourceMap: !isProduction,
};
let sassLoaderOptions = {
  sourceMap: !isProduction,
};
let postCssOptions = {
  postcssOptions: {
    ident: 'postcss',
    plugins: (): any[] => [
      require('postcss-flexbugs-fixes'),
      require('postcss-preset-env')({
        autoprefixer: {
          flexbox: 'no-2009',
        },
        stage: 3,
      }),
      // Adds PostCSS Normalize as the reset css with default options,
      // so that it honors browserslist config in package.json
      // which in turn let's users customize the target behavior as per their needs.
      postcssNormalize(),
    ],
    sourceMap: !isProduction,
  },
};
const miniCssExtractPluginOptions = {
  publicPath: process.env.PUBLIC_URL,
};
let fileLoaderOptions = {};
let stylelintOptions = {};
let eslintOptions = {
  extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
  formatter: require.resolve('react-dev-utils/eslintFormatter'),
  cache: true,
  eslintPath: require.resolve('eslint'),
  cacheLocation: path.resolve('node_modules', '.cache/.eslintcache'),
  context: path.resolve('src'),
  cwd: path.resolve(),
  resolvePluginsRelativeTo: __dirname,
  baseConfig: {
    extends: [require.resolve('eslint-config-react-app/base')],
  },
};

let customWebpackConfig: any;

let devServerOptions = {
  static: {
    directory: path.resolve('public'),
  },
  client: {
    logging: 'none',
    progress: true,
  },
  port: 3000,
  hot: true,
  historyApiFallback: {
    disableDotRule: true,
  },
  compress: true,
  open: true,
};

if (fs.existsSync(path.resolve('project.config.js'))) {
  const config: any = require(path.resolve('project.config.js'));
  if (config.webpack) {
    customWebpackConfig = config.webpack;
  }
  if (config.babel) {
    babelLoaderOptions = Object.assign(babelLoaderOptions, config.babel);
  }
  if (config.ts) {
    tsLoaderOptions = Object.assign(tsLoaderOptions, config.ts);
  }

  if (config.style) {
    const { sass, less, css, postcss } = config.style;
    if (css) {
      cssLoaderOptions = Object.assign(cssLoaderOptions, css);
    }
    if (less) {
      lessLoaderOptions = Object.assign(lessLoaderOptions, less);
    }
    if (sass) {
      sassLoaderOptions = Object.assign(sassLoaderOptions, sass);
    }
    if (postcss) {
      postCssOptions = Object.assign(postCssOptions, postcss);
    }
  }

  if (config.eslint) {
    eslintOptions = Object.assign(eslintOptions, config.eslint);
  }

  if (config.styleLint) {
    stylelintOptions = Object.assign(stylelintOptions, config.styleLint);
  }

  if (config.file) {
    fileLoaderOptions = Object.assign(fileLoaderOptions, config.file);
  }

  if (config.devServer) {
    devServerOptions = Object.assign(devServerOptions, config.devServer);
  }
}

/**
 * 获取样式loaders
 * @param isModule
 */
const getStyleLoaders = (isModule = false): any => {
  const cssLoader: any = {
    loader: 'css-loader',
    options: {
      modules: isModule,
      import: true,
      url: true,
      importLoaders: isProduction ? 2 : 1,
      ...cssLoaderOptions,
    },
  };
  const postCssLoader = {
    loader: 'postcss-loader',
    options: postCssOptions,
  };
  if (isModule) {
    cssLoader.options.localIdentName = '[path][name]__[local]--[hash:base64:5]';
    cssLoader.options.camelCase = true;
  }

  return isProduction
    ? [
        'style-loader',
        {
          loader: MiniCssExtractPlugin.loader,
          options: miniCssExtractPluginOptions,
        },
        cssLoader,
        postCssLoader,
      ]
    : ['style-loader', cssLoader];
};

const plugins: WebpackPluginInstance[] = [
  new AutomaticPrefetchPlugin(),
  new StylelintWebpackPlugin(stylelintOptions),
  new ESLintWebpackPlugin(eslintOptions),
  new EnvironmentPlugin([
    'NODE_ENV',
    'PUBLIC_URL',
    'APP_RUNTIME_ENV',
    'WDS_SOCKET_HOST',
    'WDS_SOCKET_PORT',
    'WDS_SOCKET_PATH',
  ]),
  new IgnorePlugin({
    resourceRegExp: /^\.\/locale$/,
    contextRegExp: /moment$/,
  }),
  new WatchIgnorePlugin({
    paths: [/\.js$/, /\.d\.ts$/],
  }),
  new HtmlWebpackPlugin({
    publicPath: process.env.PUBLIC_URL,
    inject: true,
    filename: 'index.html',
    hash: false,
    template: path.resolve('public', 'index.html'),
    minify: true,
  }),
  new ForkTsCheckerWebpackPlugin({
    async: !isProduction,
  }),
];

if (isProduction) {
  plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve('public'),
          to: path.resolve('dist'),
          filter: (p): boolean => path.extname(p) !== '.html',
        },
      ],
    }),
    new WebpackManifestPlugin({
      fileName: 'asset-manifest.json',
      publicPath: process.env.PUBLIC_URL,
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/styles/[name].[fullhash].css',
    })
  );
} else {
  plugins.push(
    new ReactRefreshPlugin({
      overlay: {
        entry: webpackDevClientEntry,
        // The expected exports are slightly different from what the overlay exports,
        // so an interop is included here to enable feedback on module-level errors.
        module: reactRefreshOverlayEntry,
        // Since we ship a custom dev client and overlay integration,
        // the bundled socket handling logic can be eliminated.
        sockIntegration: false,
      },
    })
  );
}

const configuration: Configuration = {
  entry: [path.resolve('src')],
  module: {
    rules: [
      {
        test: /\.module.css$/,
        use: getStyleLoaders(true),
      },
      {
        test: /\.css$/,
        use: getStyleLoaders(true),
      },
      {
        test: /\.module.less$/,
        use: [
          ...getStyleLoaders(true),
          {
            loader: 'less-loader',
            options: lessLoaderOptions,
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          ...getStyleLoaders(false),
          {
            loader: 'less-loader',
            options: lessLoaderOptions,
          },
        ],
      },
      {
        test: /\.module.s[ac]ss$/i,
        use: [
          ...getStyleLoaders(true),
          {
            loader: 'sass-loader',
            options: sassLoaderOptions,
          },
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          ...getStyleLoaders(false),
          {
            loader: 'sass-loader',
            options: sassLoaderOptions,
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|bmp|webp)(\?.*)?$/,
        use: isProduction
          ? {
              loader: 'file-loader',
              options: {
                name: 'assets/images/[name].[fullhash].[ext]',
                limit: 10000,
                esModule: false,
                ...fileLoaderOptions,
              },
            }
          : {
              loader: 'url-loader',
              options: {
                esModule: false,
              },
            },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: isProduction
          ? {
              loader: 'file-loader',
              options: {
                name: 'assets/medias/[name].[fullhash].[ext]',
                limit: 10000,
                esModule: false,
                ...fileLoaderOptions,
              },
            }
          : {
              loader: 'url-loader',
              options: {
                esModule: false,
              },
            },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: isProduction
          ? {
              loader: 'file-loader',
              options: {
                name: 'assets/fonts/[name].[fullhash].[ext]',
                limit: 10000,
                esModule: false,
                ...fileLoaderOptions,
              },
            }
          : {
              loader: 'url-loader',
              options: {
                esModule: false,
              },
            },
      },
      {
        test: /\.m?jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: babelLoaderOptions,
        },
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: babelLoaderOptions,
          },
          {
            loader: 'ts-loader',
            options: tsLoaderOptions,
          },
        ],
      },
    ],
  },
  output: {
    publicPath: process.env.PUBLIC_URL,
    path: path.resolve('dist'),
    filename: 'assets/js/[name].[fullhash].js',
  },
  target: ['web', 'es5'],
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.node'],
    alias: {
      src: path.resolve('src'),
    },
  },
  plugins,
  optimization: {
    minimize: isProduction,
    minimizer: isProduction
      ? [new CssMinimizerPlugin(), new TerserPlugin()]
      : [],
    splitChunks: isProduction && {
      maxAsyncSize: 200000,
      maxInitialSize: 100000,
      maxSize: 200000,
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  stats: false,
  performance: false,
  devtool: 'inline-source-map',
  mode: isProduction ? 'production' : 'development',
};

export const devServer = devServerOptions;

export const webpackConfig = customWebpackConfig
  ? merge(configuration, customWebpackConfig)
  : configuration;
