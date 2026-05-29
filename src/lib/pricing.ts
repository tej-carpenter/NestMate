export function formatPricePeriod(priceType: "monthly" | "daily" | "bedspace") {
	if (priceType === "monthly") {
		return "/ month";
	}

	if (priceType === "daily") {
		return "/ day";
	}

	return "/ bedspace";
}