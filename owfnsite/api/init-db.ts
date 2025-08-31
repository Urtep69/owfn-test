
// This endpoint is deprecated and has been intentionally disabled.
// The data initialization logic is now handled by the /api/app-data endpoint.
export default async function handler(req: any, res: any) {
    res.status(410).json({ error: "This endpoint is deprecated and no longer in use." });
}
