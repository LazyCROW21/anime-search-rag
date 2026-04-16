import { animeService } from "./anime.service";

export class AnimeController {
    public async search(req: Request) {
        const url = new URL(req.url);
        const query = url.searchParams.get("q");

        if (!query) {
            return Response.json(
                { error: "Query parameter 'q' is required" },
                { status: 400 }
            );
        }

        const limit = parseInt(url.searchParams.get("limit") || "10");
        const results = await animeService.search(query, limit);

        return Response.json({
            count: results.length,
            results,
        });

    }
}

export const animeController = new AnimeController();
