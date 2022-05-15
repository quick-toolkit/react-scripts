/**
 * MIT License
 * Copyright (c) 2021 RanYunLong<549510622@qq.com> @quick-toolkit/react-scripts
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

import { Configuration, webpack } from 'webpack';
import rimraf from 'rimraf';
import path from 'path';
import fs from 'fs';
import { webpackConfig } from '../webpack.config';

const PACKAGE_DIR = path.resolve('node_modules');
const DIST_DIR = path.resolve('public', 'npm');

/**
 * build
 */
export function build(): void {
  rimraf.sync(path.resolve('dist'));
  const { webpackConfig } = require('../webpack.config');
  if (webpackConfig && webpackConfig.externals) {
    try {
      const strings = Object.keys(webpackConfig.externals);
      if (strings.length) {
        console.log(`Copy node_modules externals to public.`);
        strings.forEach((name) => {
          const pack = path.join(PACKAGE_DIR, name);
          const dest = path.join(DIST_DIR, name);
          if (fs.existsSync(pack)) {
            const pa = path.join(pack, 'package.json');
            const pb = path.join(dest, 'package.json')
            if (fs.existsSync(pa) && fs.existsSync(pb)) {
              if (require(pa).version !== require(pb).version) {
                copy(pack, dest);
              }
            }
          } else {
            copy(pack, dest);
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
  const compiler = webpack(webpackConfig as Configuration);
  compiler.run((err, status) => {
    if (err) {
      console.log(err);
    } else if (status) {
      console.log(
        status.toString({
          all: false,
          builtAt: true,
          warnings: true,
          errors: true
        })
      );
    }
  });
}

// 排除的文件名称
const EXCLUDES = [/^\./,/\.d.ts$/i, /^(LICENSE|example|node_modules|test|bin)$/i, /\.(md|text|yml)$/i, /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i,  /\.(png|jpe?g|gif|svg|bmp|webp)(\?.*)?$/i];

/**
 * 递归复制目录
 * @param target 目标文件/目录
 * @param dist 存储目录
 */
function copy(target: string, dist: string) {
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    if (!EXCLUDES.find(x => x.test(target))) {
      // 创建目录
      fs.mkdirSync(target);
      var strings = fs.readdirSync(target);
      strings.map(x => {
        const dir = path.join(target, x);
        const distDir = path.join(dist, x);
        copy(dir, distDir);
      });
    }
  } else if (stat.isFile()) {
    fs.copyFileSync(target, dist);
  }
}