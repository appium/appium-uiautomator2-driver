import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {assignDefaults} from '../../lib/utils/index.js';

describe('utils/object', function () {
  describe('assignDefaults', function () {
    it('fills only undefined keys', function () {
      const target: Record<string, unknown> = {a: 1, b: undefined};
      assignDefaults(target, {b: 2, c: 3});
      assert.deepStrictEqual(target, {a: 1, b: 2, c: 3});
    });

    it('does not overwrite null', function () {
      const target: Record<string, unknown> = {a: null};
      assignDefaults(target, {a: 1});
      assert.strictEqual(target.a, null);
    });
  });
});
