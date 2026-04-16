import { healthController } from "./health.controller";

export const healthRoutes = (req: Request) => {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
        return healthController.check(req);
    }
    if (url.pathname === "/health/reset") {
        return healthController.reset(req);
    }

    return null;
};
