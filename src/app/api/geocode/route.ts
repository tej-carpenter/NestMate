import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const query = url.searchParams.get("query")?.trim();

	if (!query) {
		return NextResponse.json({ error: "Missing query" }, { status: 400 });
	}

	try {
		const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
		nominatimUrl.searchParams.set("format", "jsonv2");
		nominatimUrl.searchParams.set("limit", "1");
		nominatimUrl.searchParams.set("q", query);

		const response = await fetch(nominatimUrl, {
			headers: {
				Accept: "application/json",
				"User-Agent": "Nestmate/1.0",
			},
		});

		if (!response.ok) {
			return NextResponse.json(null, { status: 200 });
		}

		const results = (await response.json()) as Array<{ display_name: string; lat: string; lon: string }>;
		const firstResult = results[0];

		if (!firstResult) {
			return NextResponse.json(null, { status: 200 });
		}

		return NextResponse.json({
			label: firstResult.display_name,
			lat: Number(firstResult.lat),
			lng: Number(firstResult.lon),
		});
	} catch {
		return NextResponse.json(null, { status: 200 });
	}
}