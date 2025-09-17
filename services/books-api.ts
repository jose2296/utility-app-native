import { BookFixedItem, VolumesBookSearchResponse } from '../models/books';
import { BookDetails, BookDetailsResponse } from '../models/books/details';

const API_URL = 'https://www.googleapis.com/books/v1';
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;
const searchEngineId = process.env.EXPO_PUBLIC_GOOGLE_SEARCH_ENGINE_ID;
const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${searchEngineId}`;

const CAN_FIND_BOOK_IN_CASADELLIBRO = false;

const filterLinksByProviders = (items: any, isbn: string) => {
    const PALABRAS_PROHIBIDAS = [
        "opiniones", "reseña", "resena", "valoraciones",
        "comentarios", "blog", "foro", "noticia", "ayuda"
    ];

    return items.filter((item: any) => {
        const url = item.link.toLowerCase();
        const title = item.title.toLowerCase();

        // 1. Descarta opiniones, blogs, etc.
        if (PALABRAS_PROHIBIDAS.some(p => url.includes(p) || title.includes(p))) {
            return false;
        }

        // 2. Filtra por dominio y patrón
        if (url.includes("casadellibro.com")) {
            return (
                (url.includes("/libro-") || url.includes("/ebook-") || url.includes("/audiolibro-")) &&
                url.includes(isbn)
            );
        }

        if (url.includes("amazon.es")) {
            return url.includes("/dp/");
        }

        if (url.includes("fnac.es")) {
            return /\/a\d+/.test(url);
        }

        return true; // Si no sabemos, lo dejamos pasar
    });
}

const getBuyProvidersByIsbn = async (isbn: string) => {
    if (CAN_FIND_BOOK_IN_CASADELLIBRO) {
        const bookGoogleSearchUrl = `${googleSearchUrl}&q=${encodeURIComponent(isbn)}`;
        const bookGoogleSearchResponse = (await (await fetch(bookGoogleSearchUrl)).json());

        if (!bookGoogleSearchResponse.items) return undefined;
        const filteredLinks = filterLinksByProviders(bookGoogleSearchResponse.items, isbn);

        const domainsAdded = new Set();
        const urls: { link: string, title: string }[] = [];

        for (const item of filteredLinks) {
            const domain = new URL(item.link).hostname.replace("www.", "");
            if (!domainsAdded.has(domain)) {
                domainsAdded.add(domain);
                urls.push({
                    link: item.link,
                    title: item.title
                });
            }
        }

        return urls;
    }

    return undefined;
}

export const getItemBookDetails = async (externalId: string): Promise<BookDetails> => {
    const url = `${API_URL}/volumes/${externalId}?key=${API_KEY}`;
    const item = (await (await fetch(url)).json()) as BookDetailsResponse;

    const isbn = item.volumeInfo.industryIdentifiers.find((identifier) => identifier.type === 'ISBN_13')?.identifier;
    const buyProviders = await getBuyProvidersByIsbn(isbn as string);

    return {
        externalId: item.id,
        title: item.volumeInfo.title,
        image: item.volumeInfo.imageLinks?.medium || item.volumeInfo.imageLinks?.small || item.volumeInfo.imageLinks?.thumbnail || item.volumeInfo.imageLinks?.smallThumbnail,
        authors: await Promise.all(item.volumeInfo.authors.map(async author => ({
            name: author,
            books: await getBooksByAuthor(author)
        }))),
        released: item.volumeInfo.publishedDate,
        description: item.volumeInfo.description,
        pageCount: item.volumeInfo.pageCount,
        publisher: item.volumeInfo.publisher,
        score: Math.round((item.volumeInfo.averageRating / 5) * 100),
        categories: item.volumeInfo.categories?.join(', '),
        checked: false,
        isbn,
        buyProviders
    };
};

export const getBooksByAuthor = async (author: string): Promise<BookFixedItem[]> => {
    const url = `${API_URL}/volumes?q=inauthor:${encodeURIComponent(author)}&langRestrict=es&maxResults=10&key=${API_KEY}`;
    const items = (await (await fetch(url)).json()) as VolumesBookSearchResponse;


    return items?.items?.map((item) => ({
        externalId: item.id,
        title: item.volumeInfo.title,
        image: item.volumeInfo.imageLinks?.medium || item.volumeInfo.imageLinks?.small || item.volumeInfo.imageLinks?.thumbnail || item.volumeInfo.imageLinks?.smallThumbnail,
        authors: item.volumeInfo.authors,
        released: item.volumeInfo.publishedDate,
        description: item.volumeInfo.description,
        pageCount: item.volumeInfo.pageCount,
        language: item.volumeInfo.language,
        publisher: item.volumeInfo.publisher,
        score: Math.round((item.volumeInfo.averageRating / 5) * 100),
        categories: item.volumeInfo.categories?.join(', '),
        checked: false
    })) || [];
};


export const searchBookByTitle = async (title: string): Promise<BookFixedItem[]> => {
    const url = `${API_URL}/volumes?q=${encodeURIComponent(title)}&langRestrict=es&maxResults=10&key=${API_KEY}`;
    const items = (await (await fetch(url)).json()) as VolumesBookSearchResponse;

    return items?.items?.map((item) => ({
        externalId: item.id,
        title: item.volumeInfo.title,
        image: (item.volumeInfo.imageLinks?.extraLarge || item.volumeInfo.imageLinks?.large || item.volumeInfo.imageLinks?.medium || item.volumeInfo.imageLinks?.small || item.volumeInfo.imageLinks?.thumbnail || item.volumeInfo.imageLinks?.smallThumbnail).replace('http://', 'https://'),
        authors: item.volumeInfo.authors,
        released: item.volumeInfo.publishedDate,
        description: item.volumeInfo.description,
        pageCount: item.volumeInfo.pageCount,
        language: item.volumeInfo.language,
        publisher: item.volumeInfo.publisher,
        score: Math.round((item.volumeInfo.averageRating / 5) * 100),
        categories: item.volumeInfo.categories?.join(', '),
        checked: false
    })) || [];
};
