export interface AppItem {
  url: string
  appId: string
  title: string
  summary: string
  developer: string
  developerId: string
  icon: string
  score: number
  scoreText: string
  priceText: string
  free: boolean
}

export interface AppItemFullDetail extends AppItem {
  appId: string
  url: string
  title: string
  description: string
  descriptionHTML: string
  summary: string
  installs: string
  minInstalls: number
  maxInstalls: number
  score: number
  scoreText: string
  ratings: number
  reviews: number
  histogram: Record<1 | 2 | 3 | 4 | 5, number>
  price: number
  originalPrice?: number
  discountEndDate?: string
  free: boolean
  currency: string
  priceText: string
  available: boolean
  offersIAP: boolean
  IAPRange: string
  androidVersion: string
  androidVersionText: string
  developer: string
  developerId: string
  developerInternalID: string
  developerEmail: string
  developerWebsite: string
  developerAddress: string
  developerLegalName: string
  developerLegalEmail: string
  developerLegalAddress: string
  developerLegalPhoneNumber: string
  genre: string
  genreId: string
  categories: Array<{
    name: string
    id: string | null
  }>
  icon: string
  headerImage: string
  screenshots: string[]
  video: string
  videoImage: string
  contentRating: string
  contentRatingDescription: string
  adSupported: boolean
  released: string
  updated: number
  version: string
  recentChanges: string
  comments: string[]
  earlyAccessEnabled: boolean
  preregister: boolean
  isAvailableInPlayPass: boolean
}

export interface ReviewsItem {
  id: string
  userName: string
  userImage: string
  date: string
  score: number
  scoreText: string
  url: string
  title: string
  text: string
  replyDate: string
  replyText: string
  version: string
  thumbsUp: number
  criterias: Array<{
    criteria: string
    rating: number
  }>
}

export interface PermissionItem {
  permission: string
  type: string
}

export interface DataSafetyItem {
  data: string
  optional: string
  purpose: string
  type: string
}

export interface AppListItem {
  title: string
  appId: string
  url: string
  icon: string
  developer: string
  currency: string
  price: number
  free: boolean
  summary: string
  scoreText: string
  score: number
}

export interface SearchResult {
  title: string
  appId: string
  url: string
  icon: string
  developer: string
  developerId?: string
  currency?: string
  price?: number
  free?: boolean
  summary?: string
  scoreText?: string
  score?: number
}
export type ScrapedData = string | number | boolean | null | ScrapedData[] | { [key: string]: ScrapedData };
