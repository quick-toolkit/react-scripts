"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const webpack_1 = require("webpack");
const rimraf_1 = __importDefault(require("rimraf"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const PACKAGE_DIR = path_1.default.resolve('node_modules');
const DIST_DIR = path_1.default.resolve('public', 'npm');
/**
 * build
 */
function build() {
    rimraf_1.default.sync(path_1.default.resolve('dist'));
    const { webpackConfig } = require('../webpack.config');
    if (webpackConfig && webpackConfig.externals) {
        try {
            const strings = Object.keys(webpackConfig.externals);
            if (strings.length) {
                console.log(`Copy node_modules externals to public.`);
                strings.forEach((name) => {
                    const pack = path_1.default.join(PACKAGE_DIR, name);
                    const dest = path_1.default.join(DIST_DIR, name);
                    if (fs_1.default.existsSync(pack)) {
                        const pa = path_1.default.join(pack, 'package.json');
                        const pb = path_1.default.join(dest, 'package.json');
                        if (fs_1.default.existsSync(pa) && fs_1.default.existsSync(pb)) {
                            if (require(pa).version !== require(pb).version) {
                                copy(pack, dest);
                            }
                        }
                    }
                    else {
                        copy(pack, dest);
                    }
                });
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    const compiler = (0, webpack_1.webpack)(webpackConfig);
    compiler.run((err, status) => {
        if (err) {
            console.log(err);
        }
        else if (status) {
            console.log(status.toString({
                all: false,
                builtAt: true,
                warnings: true,
                errors: true
            }));
        }
    });
}
exports.build = build;
// 排除的文件名称
const EXCLUDES = [/^\./, /\.d.ts$/i, /^(LICENSE|example|node_modules|test|bin)$/i, /\.(md|text|yml)$/i, /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i, /\.(png|jpe?g|gif|svg|bmp|webp)(\?.*)?$/i];
/**
 * 递归复制目录
 * @param target 目标文件/目录
 * @param dist 存储目录
 */
function copy(target, dist) {
    const stat = fs_1.default.statSync(target);
    if (stat.isDirectory()) {
        if (!EXCLUDES.find(x => x.test(target))) {
            // 创建目录
            fs_1.default.mkdirSync(target);
            var strings = fs_1.default.readdirSync(target);
            strings.map(x => {
                const dir = path_1.default.join(target, x);
                const distDir = path_1.default.join(dist, x);
                copy(dir, distDir);
            });
        }
    }
    else if (stat.isFile()) {
        fs_1.default.copyFileSync(target, dist);
    }
}
