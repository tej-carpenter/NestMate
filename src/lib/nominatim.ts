export interface GeocodeResult {
	label: string;
	lat: number;
	lng: number;
}

type GeocodeCache = Record<string, GeocodeResult>;

const cacheKey = "nestmate.nominatim-cache.v1";

function canUseStorage() {
	return typeof window !== "undefined";
}

function readCache(): GeocodeCache {
	if (!canUseStorage()) {
		return {};
	}

	const raw = window.localStorage.getItem(cacheKey);

	if (!raw) {
		return {};
	}

	try {
		return JSON.parse(raw) as GeocodeCache;
	} catch {
		return {};
	}
}

function writeCache(cache: GeocodeCache) {
	if (!canUseStorage()) {
		return;
	}

	window.localStorage.setItem(cacheKey, JSON.stringify(cache));
}

function normalizeQuery(query: string) {
	return query.trim().toLowerCase();
}

export async function geocodeQuery(query: string): Promise<GeocodeResult | null> {
	const normalized = normalizeQuery(query);

	if (!normalized) {
		return null;
	}

	const cache = readCache();
	const cached = cache[normalized];

	if (cached) {
		return cached;
	}

	try {
		const response = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`, {
			headers: {
				Accept: "application/json",
			},
		});

		if (!response.ok) {
			return null;
		}

		const geocodeResult = (await response.json()) as GeocodeResult | null;

		if (!geocodeResult) {
			return null;
		}

		cache[normalized] = geocodeResult;
		writeCache(cache);

		return geocodeResult;
	} catch {
		return null;
	}
}

export async function geocodeListing(input: { title: string; locality: string; city: string }) {
	return geocodeQuery(`${input.title}, ${input.locality}, ${input.city}, India`);
}