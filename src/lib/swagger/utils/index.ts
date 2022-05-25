import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import ts, { factory, createPrinter, NewLineKind } from 'typescript';
import chalk from 'chalk';

/**
 * 工具包
 */
export class Utils {
  /**
   * 创建一个空行
   */
  public static createNewLine(): any {
    return factory.createIdentifier('\n') as any;
  }

  /**
   * unicode转汉字
   * @param input
   * @private
   */
  public static unescape(input: string): string {
    const regexp = /\\u[\w\d]{4}/g;
    let str = input,
      exec: RegExpExecArray | null = null;
    do {
      exec = regexp.exec(input);
      if (exec) {
        str = str.replace(exec[0], unescape(exec[0].replace('\\u', '%u')));
      }
    } while (exec);
    return str;
  }

  /**
   * 创建文件夹
   * @param fileName
   * @private
   */
  private static createDir(fileName: string): void {
    let pathName = path.dirname(fileName);
    const dirs: string[] = [];
    while (pathName && !fs.existsSync(pathName)) {
      dirs.push(pathName);
      pathName = path.dirname(pathName);
    }
    dirs.reverse().forEach((o) => {
      fs.mkdirSync(o);
    });
  }

  /**
   * 获取文件名称
   * @param n
   */
  public static getName(n: string): string {
    return n
      .split('<')[0]
      .split('')
      .map((x, i, array) => {
        if (/[A-Z]/.test(x)) {
          if (/[A-Z]/.test(array[i + 1])) {
            return x.toLowerCase();
          }
          return (i === 0 ? '' : '-') + x.toLowerCase();
        }
        if (/\//.test(x)) {
          return '-';
        }

        if (/\{/.test(x)) {
          return '';
        }

        if (/\}/.test(x)) {
          return '';
        }
        return x;
      })
      .join('');
  }

  public static overwrite = 1;

  /**
   * typescript printer
   */
  public static printer = createPrinter({
    removeComments: false,
    newLine: NewLineKind.LineFeed,
  });

  /**
   * 生成文件
   * @param fileName
   * @param file
   */
  public static async write(fileName: string, file: string): Promise<void> {
    try {
      const isExists = fs.existsSync(fileName);
      if (isExists) {
        if (Utils.overwrite !== 2 && Utils.overwrite !== 4) {
          const { overwrite } = await inquirer.prompt([
            {
              type: 'rawlist',
              message: '当前文件已存在，是否覆盖文件，输入数字继续',
              name: 'overwrite',
              choices: [
                {
                  key: 1,
                  name: '覆盖当前',
                  value: 1,
                },
                {
                  key: 2,
                  name: '覆盖所有',
                  value: 2,
                },
                {
                  key: 3,
                  name: '跳过当前',
                  value: 3,
                },
                {
                  key: 4,
                  name: '跳过所有',
                  value: 4,
                },
              ],
            },
          ]);
          Utils.overwrite = overwrite;
        }
      }

      const isOverwriteAll = isExists && Utils.overwrite === 2;
      const isOverwriteCurrent = isExists && Utils.overwrite === 1;

      if (!isExists || isOverwriteAll || isOverwriteCurrent) {
        Utils.createDir(fileName);
        if (process.env.OAS_FILE_TYPE) {
          fileName = fileName.replace(/\.ts$/, '.js');
          const readConfigFile = ts.readConfigFile(
            path.resolve('tsconfig.json'),
            ts.sys.readFile
          );

          fs.writeFileSync(
            fileName,
            ts.transpile(file, {
              ...readConfigFile.config.compilerOptions,
              noEmit: true,
              declaration: true,
              removeComments: false,
              moduleResolution: 'classic',
            })
          );
        } else {
          fs.writeFileSync(fileName, file);
        }
        console.log(
          chalk.green('WriteFileSuccess'),
          ': ',
          chalk.gray(fileName)
        );
      } else {
        console.log(
          chalk.yellow('WriteFileSkip' + ''),
          ': ',
          chalk.gray(fileName)
        );
      }
    } catch (e) {
      console.log(chalk.red('WriteFileError'), ': ', chalk.gray(fileName));
    }
  }
}
