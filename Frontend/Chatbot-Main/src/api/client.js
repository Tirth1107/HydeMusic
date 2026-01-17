const API = import.meta.env.VITE_BACKEND_URL;
const KEY = import.meta.env.VITE_HYDE_API_KEY;

export async function apiFetch(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        "X-HYDE-API-KEY": KEY
    };

    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    // Support relative paths if API is just /api (for Vercel proxy)
    const url = API.startsWith('http') ? `${API}${cleanPath}` : `${API}${cleanPath}`;

    return fetch(url, {
        ...options,
        headers
    });
}
export const transformTrack = (raw) => {
    if (!raw) return null;
    const name = raw.name || raw.title || "Unknown Track";
    const image = raw.image || raw.thumbnail || "";
    let youtube_id = raw.youtube_id;

    if (!youtube_id && raw.url) {
        const match = raw.url.match(/[?&]v=([^&]+)/);
        if (match) youtube_id = match[1];
    }

    if (!youtube_id && image) {
        const match = image.match(/\/vi\/([^\/]+)\//);
        if (match) youtube_id = match[1];
    }

    return {
        ...raw,
        id: raw.id || (youtube_id ? `yt_${youtube_id}` : Math.random().toString()),
        name,
        title: name,
        artists: Array.isArray(raw.artists) ? raw.artists : (raw.artists ? [raw.artists] : ["YouTube Artist"]),
        image,
        thumbnail: image,
        youtube_id: youtube_id || "",
        source: raw.source || "youtube"
    };
};
