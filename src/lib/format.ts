const numberFormatter = new Intl.NumberFormat("en-IN");

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
	timeZone: "Asia/Kolkata",
	dateStyle: "medium",
	timeStyle: "short",
});

export function formatNumber(value: number) {
	return numberFormatter.format(value);
}

export function formatRupee(value: number) {
	return `₹${formatNumber(value)}`;
}

export function formatDateTime(value: string | number | Date) {
	return dateTimeFormatter.format(new Date(value));
}