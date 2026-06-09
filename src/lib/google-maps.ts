export interface GoogleMapsListingInput {
	title: string;
	locality: string;
	city: string;
}

/**
 * Builds a Google Maps search URL from a listing's title, locality, and city.
 *
 * Example:
 *   generateGoogleMapsUrl({ title: "Sunrise PG", locality: "Koramangala", city: "Bengaluru" })
 *   // => "https://www.google.com/maps/search/Sunrise+PG+Koramangala+Bengaluru"
 *
 * Each non-empty part is individually URL-encoded so spaces and punctuation
 * are preserved correctly. Empty / whitespace-only parts are skipped.
 */
export function generateGoogleMapsUrl(listing: GoogleMapsListingInput): string {
	const parts = [listing.title, listing.locality, listing.city]
		.map((part) => (typeof part === "string" ? part.trim() : ""))
		.filter((part) => part.length > 0);

	const query = parts.map((part) => encodeURIComponent(part)).join("+");
	return `https://www.google.com/maps/search/${query}`;
}

/**
 * Resolves a Google Maps URL preferring an explicit URL when supplied and
 * otherwise falling back to a generated search link.
 */
export function resolveGoogleMapsUrl(
	listing: GoogleMapsListingInput,
	explicitUrl?: string | null,
): string {
	if (typeof explicitUrl === "string" && explicitUrl.trim().length > 0) {
		return explicitUrl.trim();
	}

	return generateGoogleMapsUrl(listing);
}
