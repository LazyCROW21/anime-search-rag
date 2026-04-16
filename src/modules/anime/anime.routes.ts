import { animeController } from "./anime.controller";

export const animeRoutes = (req: Request) => {
    const url = new URL(req.url);

    switch (url.pathname) {
        case "/search":
            return animeController.search(req);
        default:
            return null;
    }
};
