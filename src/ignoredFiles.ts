/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const path = require('path');
const escape = require('escape-string-regexp');

export default function ignoredFiles(appSrc: string) {
  return new RegExp(
    `^(?!${escape(
      path.normalize(appSrc + '/').replace(/[\\]+/g, '/')
    )}).+/node_modules/`,
    'g'
  );
}
