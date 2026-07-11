# google-play-scraper [![workflow](https://github.com/facundoolano/google-play-scraper/actions/workflows/tests.yml/badge.svg)](https://github.com/facundoolano/google-play-scraper/actions/workflows/tests.yml)

Node.js module to scrape application data from the Google Play store. Written in TypeScript with full type definitions.

⚠️ **Maintenance notice:** I don't use or actively maintain this project anymore, other than reviewing community-provided PRs. Expect the parser to break when Google Play's layout changes.

### Related projects

* [app-store-scraper](https://github.com/facundoolano/app-store-scraper): a scraper with a similar interface for the iTunes app store.
* [aso](https://github.com/facundoolano/aso): an App Store Optimization module built on top of this library.
* [google-play-api](https://github.com/facundoolano/google-play-api): a RESTful API to consume the data produced by this library.

## Installation

```bash
npm install google-play-scraper
```

## Usage

All methods are available as named exports or as a default export. All methods return promises.

```javascript
import gplay from "google-play-scraper";
// or
import { app, list, search, developer, suggest, reviews, similar, permissions, datasafety, categories } from "google-play-scraper";
```

Available methods:

- [`app`](#app): Retrieves the full detail of an application.
- [`list`](#list): Retrieves a list of applications from one of the collections at Google Play.
- [`search`](#search): Retrieves a list of apps that result from searching by the given term.
- [`developer`](#developer): Returns the list of applications by the given developer name.
- [`suggest`](#suggest): Given a string returns up to five suggestions to complete a search query term.
- [`reviews`](#reviews): Retrieves a page of reviews for a specific application.
- [`similar`](#similar): Returns a list of similar apps to the one specified.
- [`permissions`](#permissions): Returns the list of permissions an app has access to.
- [`datasafety`](#datasafety): Returns the data safety information of an app.
- [`categories`](#categories): Retrieve a full list of categories present from dropdown menu on Google Play.

### App Options

Common options available for most methods:

* `appId`: The Google Play id of the application (the `?id=` parameter on the URL).
* `devId`: The name or ID of the developer.
* `lang` (optional, defaults to `'en'`): The two letter language code used to fetch the data.
* `country` (optional, defaults to `'us'`): The two letter country code used to fetch the data.
* `throttle` (optional): Upper bound to the amount of requests per second.
* `requestOptions` (optional): Extra options passed to the underlying HTTP request (e.g., headers, timeout).

### app

Retrieves the full detail of an application.

```javascript
import gplay from "google-play-scraper";

const result = await gplay.app({ appId: 'com.google.android.apps.translate' });
console.log(result);
```

Options:

* `appId` (required): The Google Play id of the application.
* `lang` (optional, defaults to `'en'`): Two letter language code.
* `country` (optional, defaults to `'us'`): Two letter country code.
* `throttle` (optional): Requests per second limit.
* `requestOptions` (optional): Extra HTTP request options.

Returns: `Promise<AppItemFullDetail>`

Example result:

```javascript
{
  title: 'Google Translate',
  description: 'Translate between 103 languages by typing...',
  descriptionHTML: 'Translate between 103 languages by typing<br>...',
  summary: 'The world is closer than ever with over 100 languages',
  installs: '500,000,000+',
  minInstalls: 500000000,
  maxInstalls: 898626813,
  score: 4.482483,
  scoreText: '4.5',
  ratings: 6811669,
  reviews: 1614618,
  histogram: { '1': 370042, '2': 145558, '3': 375720, '4': 856865, '5': 5063481 },
  price: 0,
  originalPrice: undefined,
  free: true,
  currency: 'USD',
  priceText: 'Free',
  offersIAP: false,
  IAPRange: undefined,
  androidVersion: 'VARY',
  androidVersionText: 'Varies with device',
  developer: 'Google LLC',
  developerId: '5700313618786177705',
  developerEmail: 'translate-android-support@google.com',
  developerWebsite: 'http://support.google.com/translate',
  developerAddress: '1600 Amphitheatre Parkway, Mountain View 94043',
  developerLegalName: undefined,
  developerLegalEmail: undefined,
  developerLegalAddress: undefined,
  developerLegalPhoneNumber: undefined,
  privacyPolicy: 'http://www.google.com/policies/privacy/',
  developerInternalID: '5700313618786177705',
  genre: 'Tools',
  genreId: 'TOOLS',
  categories: [
    { name: 'Tools', id: 'TOOLS' },
    { name: 'Another category without id', id: null }
  ],
  icon: 'https://lh3.googleusercontent.com/ZrNeuKthBirZN7rrXPN1JmUbaG8ICy3kZSHt-WgSnREsJzo2txzCzjIoChlevMIQEA',
  headerImage: 'https://lh3.googleusercontent.com/e4Sfy0cOmqpike76V6N6n-tDVbtbmt6MxbnbkKBZ_7hPHZRfsCeZhMBZK8eFDoDa1Vf-',
  screenshots: [
    'https://lh3.googleusercontent.com/dar060xShkqnJjWC2j_EazWBpLo28X4IUWCYXZgS2iXes7W99LkpnrvIak6vz88xFQ',
    'https://lh3.googleusercontent.com/VnzidUTSWK_yhpNK0uqTSfpVgow5CsZOnBdN3hIpTxODdlZg1VH1K4fEiCrdUQEZCV0'
  ],
  video: undefined,
  videoImage: undefined,
  previewVideo: undefined,
  contentRating: 'Everyone',
  contentRatingDescription: undefined,
  adSupported: false,
  released: undefined,
  updated: 1576868577000,
  version: 'Varies with device',
  recentChanges: 'Improved offline translations with upgraded language downloads',
  comments: [],
  preregister: false,
  earlyAccessEnabled: false,
  isAvailableInPlayPass: false,
  appId: 'com.google.android.apps.translate',
  url: 'https://play.google.com/store/apps/details?id=com.google.android.apps.translate&hl=en&gl=us'
}
```

### list

Retrieve a list of applications from one of the collections at Google Play.

```javascript
import gplay from "google-play-scraper";

const results = await gplay.list({
  category: gplay.category.GAME_ACTION,
  collection: gplay.collection.TOP_FREE,
  num: 2
});
console.log(results);
```

Options:

* `collection` (optional, defaults to `gplay.collection.TOP_FREE`): The Google Play collection to retrieve. Available options: `TOP_FREE`, `TOP_PAID`, `GROSSING`.
* `category` (optional, defaults to `gplay.category.APPLICATION`): The app category to filter by. Available categories are in `gplay.category`.
* `age` (optional): Age range filter (only for FAMILY and subcategories). Options: `gplay.age.FIVE_UNDER`, `gplay.age.SIX_EIGHT`, `gplay.age.NINE_UP`.
* `num` (optional, defaults to `500`): The amount of apps to retrieve.
* `fullDetail` (optional, defaults to `false`): If `true`, an extra request will be made for every resulting app to fetch its full detail.
* `lang`, `country`, `throttle`, `requestOptions`: Common options.

Returns: `Promise<AppListItem[]>`

Example result:

```javascript
[
  {
    url: 'https://play.google.com/store/apps/details?id=com.playappking.busrush',
    appId: 'com.playappking.busrush',
    summary: 'Bus Rush is an amazing running game for Android! Start running now!',
    developer: 'Play App King',
    developerId: '6375024885749937863',
    title: 'Bus Rush',
    icon: 'https://lh3.googleusercontent.com/R6hmyJ6ls6wskk5hHFoW02yEyJpSG36il4JBkVf-Aojb1q4ZJ9nrGsx6lwsRtnTqfA=w340',
    score: 3.9,
    scoreText: '3.9',
    priceText: 'Free',
    free: false
  },
  ...
]
```

### search

Retrieves a list of apps that result from searching by the given term.

```javascript
import gplay from "google-play-scraper";

const results = await gplay.search({
  term: "panda",
  num: 2
});
console.log(results);
```

Options:

* `term` (required): The term to search by.
* `num` (optional, defaults to `20`, max `250`): The amount of apps to retrieve.
* `price` (optional, defaults to `'all'`): Filter by price: `'all'`, `'free'`, `'paid'`.
* `fullDetail` (optional, defaults to `false`): If `true`, fetch full detail for each app.
* `lang`, `country`, `throttle`, `requestOptions`: Common options.

Returns: `Promise<AppListItem[]>`

Example result:

```javascript
[
  {
    url: 'https://play.google.com/store/apps/details?id=com.snailgameusa.tp',
    appId: 'com.snailgameusa.tp',
    summary: 'An exciting action adventure RPG of Panda proportions!',
    title: 'Taichi Panda',
    developer: 'Snail Games USA',
    developerId: 'Snail+Games+USA+Inc',
    icon: 'https://lh3.googleusercontent.com/g8RMjpRk9yetsui4g5lxnioAFwtgoKUJDBnb2knJMrOaLOtHrwU1qYkb-PadbL0Zmg=w340',
    score: 4.1,
    scoreText: '4.1',
    priceText: 'Free',
    free: true
  },
  ...
]
```

### developer

Returns the list of applications by the given developer name.

```javascript
import gplay from "google-play-scraper";

const results = await gplay.developer({ devId: "DxCo Games" });
console.log(results);
```

Options:

* `devId` (required): The name or ID of the developer.
* `num` (optional, defaults to `60`): The amount of apps to retrieve.
* `fullDetail` (optional, defaults to `false`): If `true`, fetch full detail for each app.
* `lang`, `country`, `throttle`, `requestOptions`: Common options.

Returns: `Promise<AppListItem[]>`

Example result:

```javascript
[
  {
    url: 'https://play.google.com/store/apps/details?id=com.dxco.pandavszombies2',
    appId: 'com.dxco.pandavszombies2',
    title: "Panda vs Zombie 2 Panda's back",
    summary: 'Help Rocky the Panda warrior to fight zombies again!',
    developer: 'DxCo Games',
    developerId: 'DxCo+Games',
    icon: 'https://lh3.googleusercontent.com/kFco0LtC7ICP0QrtpkF-QQahU-iwuDgEsH0AClQcHwtzsO5-8BGTf8QgR6dlCLxqBLc=w340',
    score: 3.9,
    scoreText: '3.9',
    priceText: 'Free',
    free: true
  },
  ...
]
```

### suggest

Given a string returns up to five suggestions to complete a search query term.

```javascript
import gplay from "google-play-scraper";

const suggestions = await gplay.suggest({ term: 'panda' });
console.log(suggestions);
```

Options:

* `term` (required): The term to get suggestions for.
* `lang`, `country`, `throttle`, `requestOptions`: Common options.

Returns: `Promise<string[]>`

Example result:

```javascript
[ 'panda pop', 'panda', 'panda games', 'panda run', 'panda pop for free' ]
```

### reviews

Retrieves a page of reviews for a specific application.

Note: This method returns reviews in a specific language (English by default). To get more reviews, try different languages. Also, the counter displayed on the Google Play page refers to the total number of 1-5 star ratings, not written reviews count.

```javascript
import gplay from "google-play-scraper";

// Get 3000 reviews in a single call
const result = await gplay.reviews({
  appId: 'com.dxco.pandavszombies',
  sort: gplay.sort.RATING,
  num: 3000
});
console.log(result);

// Get paginated reviews (150 per page)
const page1 = await gplay.reviews({
  appId: 'com.dxco.pandavszombies',
  sort: gplay.sort.RATING,
  paginate: true,
  nextPaginationToken: null
});
console.log(page1);

// Get next page
const page2 = await gplay.reviews({
  appId: 'com.dxco.pandavszombies',
  sort: gplay.sort.RATING,
  paginate: true,
  nextPaginationToken: page1.nextPaginationToken
});
console.log(page2);
```

Options:

* `appId` (required): Unique application id for Google Play.
* `sort` (optional, defaults to `gplay.sort.NEWEST`): Sort order. Options: `NEWEST` (2), `RATING` (3), `HELPFULNESS` (1).
* `num` (optional, defaults to `100`): Quantity of reviews to capture (ignored if `paginate` is `true`).
* `paginate` (optional, defaults to `false`): If `true`, returns paginated results (150 per page).
* `nextPaginationToken` (optional): The next token to paginate (from previous call).
* `lang`, `country`, `throttle`, `requestOptions`: Common options.

Returns: `Promise<ReviewsResult>` where `ReviewsResult` is:

```typescript
{
  data: ReviewItem[];
  nextPaginationToken: string | null;
}
```

Example result:

```javascript
{
  data: [
    {
      id: 'gp:AOqpTOFmAVORqfWGcaqfF39ftwFjGkjecjvjXnC3g_uL0NtVGlrrqm8X2XUWx0WydH3C9afZlPUizYVZAfARLuk',
      userName: 'Inga El-Ansary',
      userImage: 'https://lh3.googleusercontent.com/-hBGvzn3XlhQ/AAAAAAAAAAI/AAAAAAAAOw0/L4GY9KrQ-DU/w96-c-h96/photo.jpg',
      date: '2013-11-10T18:31:42.174Z',
      score: 5,
      scoreText: '5',
      url: 'https://play.google.com/store/apps/details?id=com.dxco.pandavszombies&reviewId=...',
      title: 'I LOVE IT',
      text: 'It has skins and snowballs everything I wanted its so cool I love it!!!!!!!!',
      replyDate: '2013-11-10T18:31:42.174Z',
      replyText: 'thanks for playing Panda vs Zombies!',
      version: '1.0.2',
      thumbsUp: 29,
      criterias: [
        { criteria: 'vaf_games_simple', rating: 1 },
        { criteria: 'vaf_games_realistic', rating: 1 },
        { criteria: 'vaf_games_complex', rating: 1 }
      ]
    },
    ...
  ],
  nextPaginationToken: 'NEXT_PAGINATION_TOKEN'
}
```

### similar

Returns a list of similar apps to the one specified.

```javascript
import gplay from "google-play-scraper";

const results = await gplay.similar({ appId: "com.dxco.pandavszombies" });
console.log(results);
```

Options:

* `appId` (required): The Google Play id of the application to get similar apps for.
* `fullDetail` (optional, defaults to `false`): If `true`, fetch full detail for each app.
* `lang`, `country`, `throttle`, `requestOptions`: Common options.

Returns: `Promise<AppListItem[]>`

Example result:

```javascript
[
  {
    url: 'https://play.google.com/store/apps/details?id=com.creative.rambo',
    appId: 'com.creative.rambo',
    summary: 'Rambo - The Mobile Game',
    developer: 'Creative Distribution Ltd',
    developerId: '8812103738509382093',
    icon: '//lh3.googleusercontent.com/QDRAv7v4LSCfZgz3GIbOSz8Zj8rWqeeYuqqYiqyQXkxRJwG7vvUltzsFaWK5D7-JMnIZ=w340',
    score: 3.3,
    scoreText: '3.3',
    priceText: '$2.16',
    free: false
  }
]
```

### permissions

Returns the list of permissions an app has access to.

```javascript
import gplay from "google-play-scraper";

const permissions = await gplay.permissions({ appId: "com.dxco.pandavszombies" });
console.log(permissions);

// Get short format (only permission names)
const shortPermissions = await gplay.permissions({ 
  appId: "com.dxco.pandavszombies",
  short: true 
});
console.log(shortPermissions);
```

Options:

* `appId` (required): The Google Play id of the application.
* `short` (optional, defaults to `false`): If `true`, returns only permission names as strings.
* `lang`, `country`, `throttle`, `requestOptions`: Common options.

Returns: `Promise<PermissionItem[] | string[]>`

Example result (full):

```javascript
[
  { permission: 'modify or delete the contents of your USB storage', type: 'Storage' },
  { permission: 'read the contents of your USB storage', type: 'Storage' },
  { permission: 'full network access', type: 'Photos/Media/Files' },
  { permission: 'view network connections', type: '' }
]
```

Example result (short):

```javascript
[
  'modify or delete the contents of your USB storage',
  'read the contents of your USB storage',
  'full network access',
  'view network connections'
]
```

### datasafety

Returns the data safety information of an application. The data safety is categorized into "data shared", "data collected" and "security practices". Additionally, the URL to the privacy policy is returned.

```javascript
import gplay from "google-play-scraper";

const result = await gplay.datasafety({ appId: "com.dxco.pandavszombies" });
console.log(result);
```

Options:

* `appId` (required): The Google Play id of the application.
* `lang` (optional, defaults to `'en'`): Two letter language code.
* `throttle`, `requestOptions`: Common options.

Returns: `Promise<DataSafetyResult>`

Example result:

```javascript
{
  sharedData: [
    {
      data: 'User IDs',
      optional: false,
      purpose: 'Advertising or marketing, Account management',
      type: 'Personal info'
    },
    {
      data: 'Crash logs',
      optional: false,
      purpose: 'Analytics',
      type: 'App info and performance'
    }
  ],
  collectedData: [
    {
      data: 'Name',
      optional: true,
      purpose: 'App functionality, Developer communications, Advertising or marketing',
      type: 'Personal info'
    },
    {
      data: 'Email address',
      optional: true,
      purpose: 'App functionality, Advertising or marketing, Account management',
      type: 'Personal info'
    },
    ...
  ],
  securityPractices: [
    {
      practice: "Data isn't encrypted",
      description: 'Your data isn\'t transferred over a secure connection'
    },
    {
      practice: 'You can request that data be deleted',
      description: 'The developer provides a way for you to request that your data be deleted'
    }
  ],
  privacyPolicyUrl: 'http://www.jamcity.com/privacy'
}
```

### categories

Retrieve a full list of categories present from dropdown menu on Google Play.

```javascript
import gplay from "google-play-scraper";

const categories = await gplay.categories();
console.log(categories);
```

Options:

* `throttle`, `requestOptions`: Common options.

Returns: `Promise<string[]>`

Example result:

```javascript
[
  'AUTO_AND_VEHICLES',
  'LIBRARIES_AND_DEMO',
  'LIFESTYLE',
  'MAPS_AND_NAVIGATION',
  'BEAUTY',
  'BOOKS_AND_REFERENCE',
  ...
]
```

## Constants

The library exports constants for categories, collections, sort orders, and age ranges:

```javascript
import gplay from "google-play-scraper";

// Categories
gplay.category.APPLICATION
gplay.category.GAME_ACTION
gplay.category.GAME_ADVENTURE
// ... all categories from constants.ts

// Collections
gplay.collection.TOP_FREE
gplay.collection.TOP_PAID
gplay.collection.GROSSING

// Sort orders for reviews
gplay.sort.NEWEST    // 2
gplay.sort.RATING    // 3
gplay.sort.HELPFULNESS // 1

// Age ranges (for FAMILY category)
gplay.age.FIVE_UNDER  // 'AGE_RANGE1'
gplay.age.SIX_EIGHT   // 'AGE_RANGE2'
gplay.age.NINE_UP     // 'AGE_RANGE3'
```

## Memoization

Since every library call performs one or multiple requests to Google Play, caching results can be useful to avoid requesting the same data twice. The `memoized` function returns a store object that caches its results:

```javascript
import { memoized } from "google-play-scraper";

// Cache with default options (5 min TTL, max 1000 entries per method)
const memoized = memoized();

// Cache with custom options
const memoizedCustom = memoized({ maxAge: 1000 * 60 * 10 }); // 10 minutes

// First call hits Google Play and caches results
await memoized.developer({ devId: "DxCo Games" });

// Second call returns cached results
await memoized.developer({ devId: "DxCo Games" });
```

Options are those supported by the [memoizee](https://github.com/medikoo/memoizee) module. By default, up to 1000 values are cached per method and they expire after 5 minutes.

## Throttling

All methods access the Google Play server. Making too many requests in a short period (especially with `fullDetail`) can hit Google Play's throttling limit, resulting in 503 responses with captchas and temporary IP bans.

To avoid this, all methods support a `throttle` property defining an upper bound of requests per second:

```javascript
import gplay from "google-play-scraper";

// Perform batches of 10 requests per second
await gplay.search({ term: 'panda', throttle: 10 });
```

By default, no throttling is applied.

## TypeScript

This library is written in TypeScript and includes full type definitions. Import types directly:

```typescript
import type { 
  AppItem, 
  AppItemFullDetail, 
  AppListItem, 
  ReviewsResult, 
  ReviewItem,
  PermissionItem,
  DataSafetyResult,
  DataEntry,
  SecurityPractice
} from "google-play-scraper";
```