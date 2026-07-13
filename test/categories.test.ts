import { assert } from 'chai';
import gplay from '../src/index.js';
import * as R from 'ramda';

describe('Categories method', () => {
  it('should fetch valid list of categories', () => {
    return gplay.categories().then((categories: string[]) => {
      assert.isArray(categories);
      assert.isTrue(categories.length > 0);
    });
  });

  it('should have all categories from constant list of categories', () => {
    return gplay.categories().then((categories: string[]) => {
      const categoriesConst = Object.keys(gplay.category) as string[];
      assert.deepEqual(
        R.difference(categories, categoriesConst),
        [],
        'Google Play has categories that are not in "category" constant'
      );
    });
  });
});
