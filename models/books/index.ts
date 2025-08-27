export interface BookFixedItem {
    externalId: string;
    checked: boolean;
    title: string;
    image: string;
    authors: string[];
    released: string;
    description: string;
    pageCount: number;
    language: string;
    publisher: string;
    score: number;
    categories: string;
}

export interface VolumesBookSearchResponse {
    kind: string
    totalItems: number
    items: BookItemResponse[]
}

export interface BookItemResponse {
    kind: string
    id: string
    etag: string
    selfLink: string
    volumeInfo: VolumeInfo
    saleInfo: SaleInfo
    accessInfo: AccessInfo
    searchInfo: SearchInfo
}

export interface VolumeInfo {
    title: string
    authors: string[]
    publisher: string
    publishedDate: string
    description: string
    industryIdentifiers: IndustryIdentifier[]
    readingModes: ReadingModes
    pageCount: number
    printType: string
    categories: string[]
    averageRating: number
    ratingsCount: number
    maturityRating: string
    allowAnonLogging: boolean
    contentVersion: string
    panelizationSummary: PanelizationSummary
    imageLinks: ImageLinks
    language: string
    previewLink: string
    infoLink: string
    canonicalVolumeLink: string
}

export interface IndustryIdentifier {
    type: string
    identifier: string
}

export interface ReadingModes {
    text: boolean
    image: boolean
}

export interface PanelizationSummary {
    containsEpubBubbles: boolean
    containsImageBubbles: boolean
}

export interface ImageLinks {
    smallThumbnail: string
    thumbnail: string
    small?: string
    medium?: string
    large?: string
    extraLarge?: string
}

export interface SaleInfo {
    country: string
    saleability: string
    isEbook: boolean
    listPrice: ListPrice
    retailPrice: RetailPrice
    buyLink: string
    offers: Offer[]
}

export interface ListPrice {
    amount: number
    currencyCode: string
}

export interface RetailPrice {
    amount: number
    currencyCode: string
}

export interface Offer {
    finskyOfferType: number
    listPrice: ListPrice2
    retailPrice: RetailPrice2
    giftable: boolean
}

export interface ListPrice2 {
    amountInMicros: number
    currencyCode: string
}

export interface RetailPrice2 {
    amountInMicros: number
    currencyCode: string
}

export interface AccessInfo {
    country: string
    viewability: string
    embeddable: boolean
    publicDomain: boolean
    textToSpeechPermission: string
    epub: Epub
    pdf: Pdf
    webReaderLink: string
    accessViewStatus: string
    quoteSharingAllowed: boolean
}

export interface Epub {
    isAvailable: boolean
}

export interface Pdf {
    isAvailable: boolean
}

export interface SearchInfo {
    textSnippet: string
}
