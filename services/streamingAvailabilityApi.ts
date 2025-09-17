import * as streamingAvailability from "streaming-availability";

const RAPID_API_KEY = "2773cbc632msh759c9d82d425238p1830fejsn53fe3cd5d0cc";

const client = new streamingAvailability.Client(new streamingAvailability.Configuration({
    apiKey: RAPID_API_KEY
}));


export const TESTAPI = async () => {
    const data = await client.showsApi.searchShowsByTitle({
        title: "Inception",
        country: "ES",
        outputLanguage: 'es'
    });

    console.log(data);
}
