import gplay from '../index.js';
import { assert } from 'chai';
import { assertValidUrl } from './common.js';
import { constants } from '../lib/constants.js';

function assertValid (review: any): void {
  assert.isString(review.id);
  assert(review.id);
  assert.isString(review.userName);
  assertValidUrl(review.userImage as string);
  assert(review.userName);
  assert.isNotNull(new Date(review.date as string).toJSON());
  assert.isString(review.date);
  assert(review.date);
  assert.isNull(review.title);
  assert.isString(review.text);
  assert.isNumber(review.score);
  assert((review.score as number) > 0);
  assert((review.score as number) <= 5);
  assertValidUrl(review.url as string);
  assert.property(review, 'replyDate');
  assert.property(review, 'replyText');
  assert.property(review, 'version');
  assert.property(review, 'thumbsUp');
  assert.property(review, 'criterias');
}

describe('Reviews method', () => {
  it('should retrieve the most recent reviews of an app', () => {
    return gplay.reviews({ appId: 'com.dxco.pandavszombies' })
      .then((reviews) => {
        reviews.data.map(assertValid);
      });
  });

  it('should retrieve the most helpfull reviews of an app', () => {
    return gplay.reviews({
      appId: 'com.dxco.pandavszombies',
      sort: constants.sort.HELPFULNESS
    })
      .then((reviews) => {
        reviews.data.map(assertValid);
      });
  });

  it('should retrieve the most rated reviews of an app', () => {
    return gplay.reviews({
      appId: 'com.dxco.pandavszombies',
      sort: constants.sort.RATING
    })
      .then((reviews) => {
        reviews.data.map(assertValid);
      });
  });

  it('should validate the sort', () => {
    return gplay.reviews({
      appId: 'com.dxco.pandavszombies',
      sort: 99
    })
      .then(() => { assert.fail('unexpected success'); })
      .catch((e: Error) => assert.equal(e.message, 'Invalid sort 99'));
  });

  it('should retrieve the reviews of an app in Japanese', () => {
    return gplay.reviews({ appId: 'com.dxco.pandavszombies', lang: 'ja' })
      .then((reviews) => {
        reviews.data.map(assertValid);
      });
  });

  it('should accept pagination', () => {
    return gplay.reviews({
      appId: 'com.facebook.katana',
      paginate: true
    })
      .then((reviews) => {
        reviews.data.map(assertValid);
        assert.equal(reviews.data.length, 150);
        assert.isNotNull(reviews.nextPaginationToken);
      });
  });

  it('should get different reviews for nextPageToken', async () => {
    const firstPageReviews = await gplay.reviews({
      appId: 'com.facebook.katana',
      paginate: true
    });
    const { data, nextPaginationToken } = firstPageReviews;

    assert.equal(data.length, 150);
    assert.isNotNull(nextPaginationToken);

    const secondPageReviews = await gplay.reviews({
      appId: 'com.facebook.katana',
      paginate: true,
      nextPaginationToken
    });
    const { data: dataSecondPage, nextPaginationToken: secondPaginationToken } = secondPageReviews;

    assert.equal(dataSecondPage.length, 150);
    assert.isNotNull(secondPaginationToken);
    assert.notDeepEqual(data, dataSecondPage);
  });

  it('should get same set of reviews on each run', async () => {
    const numReviews = 100;
    const firstPageReviews = await gplay.reviews({
      appId: 'com.facebook.katana',
      num: numReviews,
      sort: constants.sort.HELPFULNESS
    });
    const { data } = firstPageReviews;

    assert.equal(data.length, numReviews);

    const secondPageReviews = await gplay.reviews({
      appId: 'com.facebook.katana',
      num: numReviews,
      sort: constants.sort.HELPFULNESS
    });
    const { data: dataSecondPage } = secondPageReviews;

    assert.equal(dataSecondPage.length, numReviews);
    assert.equal(data.length, dataSecondPage.length);
    for (let i = 0; i < Math.min(5, data.length); i++) {
      assert.equal(data[i].id, dataSecondPage[i].id);
    }
  }).timeout(10000);
});
