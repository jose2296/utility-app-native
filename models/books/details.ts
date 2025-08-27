import { BookFixedItem } from '.';

export interface BookDetails {
    externalId: string;
    title: string;
    image: string;
    authors: {
        name: string;
        books: BookFixedItem[];
    }[];
    released: string;
    description: string;
    pageCount: number;
    publisher: string;
    score: number;
    categories: string;
    checked: boolean;
    isbn?: string;
    buyProviders?: { link: string, title: string }[];
}

export interface BookDetailsResponse {
    kind: string
    id: string
    etag: string
    selfLink: string
    volumeInfo: VolumeInfo
    layerInfo: LayerInfo
    saleInfo: SaleInfo
    accessInfo: AccessInfo
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
    printedPageCount: number
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
    small: string
    medium: string
    large: string
    extraLarge: string
}

export interface LayerInfo {
    layers: Layer[]
}

export interface Layer {
    layerId: string
    volumeAnnotationsVersion: string
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
