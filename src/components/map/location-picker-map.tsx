"use client";

import { useEffect } from "react";
import { CircleMarker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { latLngBounds, type LatLngExpression } from "leaflet";
import { StableMapContainer } from "./stable-map-container";

type LocationPoint = {
	latitude: number;
	longitude: number;
};

const indiaCenter: LatLngExpression = [22.9734, 78.6569];

function MapFocus({ value }: { value: LocationPoint | null }) {
	const map = useMap();

	useEffect(() => {
		if (!value) {
			map.setView(indiaCenter, 5);
			return;
		}

		const bounds = latLngBounds([[value.latitude, value.longitude] as LatLngExpression]);
		map.fitBounds(bounds.pad(0.35), { animate: true });
	}, [map, value]);

	return null;
}

function MapClickHandler({ onPick }: { onPick: (point: LocationPoint) => void }) {
	useMapEvents({
		click(event) {
			onPick({
				latitude: event.latlng.lat,
				longitude: event.latlng.lng,
			});
		},
	});

	return null;
}

export function LocationPickerMap({ value, onPick }: { value: LocationPoint | null; onPick: (point: LocationPoint) => void }) {
	return (
		<StableMapContainer center={indiaCenter} zoom={5} scrollWheelZoom className="leaflet-container h-[clamp(16rem,34dvh,22rem)] w-full rounded-[1.75rem] sm:h-[clamp(18rem,30dvh,24rem)] lg:h-[24rem]">
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<MapFocus value={value} />
			<MapClickHandler onPick={onPick} />
			{value ? (
				<CircleMarker
					center={[value.latitude, value.longitude]}
					radius={14}
					pathOptions={{ color: "#ea580c", weight: 2, fillColor: "#fb923c", fillOpacity: 0.8 }}
				/>
			) : null}
		</StableMapContainer>
	);
}