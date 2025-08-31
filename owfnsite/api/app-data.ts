
// This endpoint has been deprecated. Initial data is now loaded statically
// into the application bundle to resolve persistent deployment errors.
export default async function handler(req: any, res: any) {
    res.status(410).json({ error: "This endpoint is deprecated and no longer in use. Initial data is now bundled with the client application." });
}
