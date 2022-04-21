#!/usr/bin/env node
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

import 'reflect-metadata';
import ora from 'ora';
import { program } from 'commander';
import chalk from 'chalk';
import path from 'path';
import inquirer from 'inquirer';
import download from 'download-git-repo';
import { start } from '../lib/start';
import { build } from '../lib/build';
import { setEnv } from '../lib/set-env';
import { install } from '../lib/install';

const PACKAGE = require(path.join(__dirname, '../', '../', 'package.json'));

program.version(PACKAGE.version as string, '-v, --version');

program
  .command('start')
  .description('Start react app')
  .action(() => {
    require('dotenv').config();
    setEnv(true);
    start();
  });

program
  .command('build')
  .description('Build react app')
  .action(() => {
    require('dotenv').config();
    setEnv();
    build();
  });

program
  .command('create <project-name>')
  .description('Create react app')
  .action((projectName: string) => {
    const spinner = ora('Start download template.');
    download(
      'quick-toolkit/react-app-template',
      path.resolve(projectName),
      async (err) => {
        if (err) {
          spinner.fail(err.message);
          throw err;
        }
        spinner.succeed('Download template success!');
        const { isInstall } = await inquirer.prompt<{ isInstall: boolean }>({
          type: 'confirm',
          name: 'isInstall',
          message: 'Is install dependencies ?',
          default: true,
        });
        if (isInstall) {
          const { select } = await inquirer.prompt<{ select: string }>({
            type: 'list',
            message: 'Select package manager.',
            choices: ['use yarn', 'use npm'],
            default: 0,
            name: 'select',
          });
          try {
            await install(select === 'use yarn' ? 'yarn' : 'npm', projectName);
            spinner.succeed('Install success.');
          } catch (err) {
            spinner.fail('Install fail.');
          }
        }
      }
    );
  });

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.outputHelp((cb) => {
    return chalk.green(cb);
  });
}
