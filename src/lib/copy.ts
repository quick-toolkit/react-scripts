/**
 * 复制文件
 * @param targetDir 目标目录
 * @param fileNames 文件名称
 * @param dest 保存目录
 */
import { EXCLUDES } from './constants';
import fs from 'fs';
import path from 'path';
import { createDir } from './create-dir';

 export function copy(targetDir: string, fileNames: string[], dest: string) {

  const files =  fileNames.filter(x => !EXCLUDES.find(e => e.test(x)));

  if (files.length) {
    if (!fs.existsSync(dest)) {
      createDir(dest)
    }

    files.forEach(name => {
      const mPath = path.join(targetDir, name);
      const mDist = path.join(dest, name);

      const stats = fs.statSync(mPath);
      if (stats.isFile()) {
        if (!fs.existsSync(mDist)) {
          fs.copyFileSync(mPath, mDist);
        }
      } else if (stats.isDirectory()) {
        const strings = fs.readdirSync(mPath);
        copy(mPath, strings, mDist);
      }
    })
  }
}