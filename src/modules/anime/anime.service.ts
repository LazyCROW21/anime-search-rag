import { animeModel, type Anime } from "./anime.model";

export class AnimeService {
    public async search(query: string, limit: number): Promise<Anime[]> {
        return await animeModel.search(query, limit);
    }

    public async getStats() {
        return {
            totalCount: await animeModel.getCount(),
            status: "healthy",
        };
    }
}


export const animeService = new AnimeService();
