"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CircleMarker, Popup, TileLayer, useMap } from "react-leaflet";
import { latLngBounds, type LatLngExpression } from "leaflet";
import { formatRupee } from "@/lib/format";
import { StableMapContainer } from "./stable-map-container";

export interface LeafletMapPoint {
	id: string;
	title: string;
	locality: string;
	city: string;
	price: number;
	href: string;
	kind: string;
	latitude: number;
	longitude: number;
}

export interface LeafletSearchPoint {
	label: string;
	latitude: number;
	longitude: number;
}

// Defensive cleanup: in dev React Strict Mode remounts can leave a previous Leaflet map
// marker attached to the DOM node (._leaflet_id) which causes "Map container is
// already initialized." when React-Leaflet re-creates the map. Remove that marker
// on module import (client-only) so a fresh MapContainer can initialize safely.
if (typeof window !== "undefined") {
	try {
		const els = document.querySelectorAll('.leaflet-container');
		els.forEach((el) => {
			if ((el as any)._leaflet_id) {
				try {
					// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
					delete (el as any)._leaflet_id;
				} catch {
					/* ignore */
				}
			}
		});
	} catch {
		/* ignore */
	}
}

const indiaCenter: LatLngExpression = [22.9734, 78.6569];

function MapViewport({ points, searchPoint }: { points: LeafletMapPoint[]; searchPoint: LeafletSearchPoint | null }) {
	const map = useMap();

	useEffect(() => {
		if (points.length === 0 && !searchPoint) {
			map.setView(indiaCenter, 5);
			return;
		}

		const bounds = latLngBounds(points.map((point) => [point.latitude, point.longitude] as LatLngExpression));

		if (searchPoint) {
			bounds.extend([searchPoint.latitude, searchPoint.longitude]);
		}

		if (bounds.isValid()) {
			map.fitBounds(bounds.pad(0.2), { animate: true });
		} else if (searchPoint) {
			map.setView([searchPoint.latitude, searchPoint.longitude], 12);
		}
	}, [map, points, searchPoint]);

	return null;
}

export default function LeafletMap({ points, searchPoint }: { points: LeafletMapPoint[]; searchPoint: LeafletSearchPoint | null }) {
	return (
		<StableMapContainer center={indiaCenter} zoom={5} scrollWheelZoom className="leaflet-container h-[420px] w-full rounded-[2rem] sm:h-[520px] lg:h-[700px]">
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<MapViewport points={points} searchPoint={searchPoint} />
			{points.map((point) => (
				<CircleMarker
					key={point.id}
					center={[point.latitude, point.longitude]}
					radius={11}
					pathOptions={{ color: "#0f766e", weight: 2, fillColor: "#f97316", fillOpacity: 0.85 }}
				>
					<Popup>
						<div className="space-y-2">
							<p className="text-sm font-semibold text-slate-950">{point.title}</p>
							<p className="text-xs text-slate-600">
								{point.locality}, {point.city}
							</p>
							<p className="text-xs text-slate-600">{point.kind.toUpperCase()} · {formatRupee(point.price)}</p>
							<Link className="text-xs font-semibold text-teal-700" href={point.href}>
								Open listing
							</Link>
						</div>
					</Popup>
				</CircleMarker>
			))}
			{searchPoint ? (
				<CircleMarker
					center={[searchPoint.latitude, searchPoint.longitude]}
					radius={14}
					pathOptions={{ color: "#ea580c", weight: 2, fillColor: "#fb923c", fillOpacity: 0.75 }}
				>
					<Popup>
						<div className="space-y-1">
							<p className="text-sm font-semibold text-slate-950">Search result</p>
							<p className="text-xs text-slate-600">{searchPoint.label}</p>
						</div>
					</Popup>
				</CircleMarker>
			) : null}
		</StableMapContainer>
	);
}