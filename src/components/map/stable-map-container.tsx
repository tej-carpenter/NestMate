"use client";

import { type CSSProperties, type ReactNode, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Map as LeafletMap } from "leaflet";
import { LeafletProvider, createLeafletContext } from "@react-leaflet/core";

type StableMapContainerProps = {
	center?: [number, number];
	bounds?: [number, number][];
	boundsOptions?: Parameters<LeafletMap["fitBounds"]>[1];
	className?: string;
	id?: string;
	placeholder?: ReactNode;
	style?: CSSProperties;
	whenReady?: (event: { target: LeafletMap }) => void;
	zoom?: number;
	children?: ReactNode;
	[option: string]: unknown;
};

export const StableMapContainer = forwardRef<LeafletMap | null, StableMapContainerProps>(function StableMapContainer(
	props,
	forwardedRef,
) {
	const { bounds, boundsOptions, center, children, className, id, placeholder, style, whenReady, zoom, ...options } = props as StableMapContainerProps & Record<string, any>;
	const mapRef = useRef<LeafletMap | null>(null);
	const [context, setContext] = useState<ReturnType<typeof createLeafletContext> | null>(null);

	useImperativeHandle(forwardedRef, () => mapRef.current as LeafletMap, []);

	const attachContainer = useCallback((node: HTMLDivElement | null) => {
		if (node === null || mapRef.current !== null) {
			return;
		}

		const map = new LeafletMap(node, options);
		mapRef.current = map;

		if (center != null && zoom != null) {
			map.setView(center, zoom);
		} else if (bounds != null) {
			map.fitBounds(bounds, boundsOptions);
		}

		if (whenReady != null) {
			map.whenReady(whenReady);
		}

		setContext(createLeafletContext(map));
	}, [bounds, boundsOptions, center, options, whenReady, zoom]);

	useEffect(() => {
		return () => {
			mapRef.current?.remove();
			mapRef.current = null;
			setContext(null);
		};
	}, []);

	const contents = context ? (
		<LeafletProvider value={context}>{children}</LeafletProvider>
	) : (
		placeholder ?? null
	);

	return (
		<div ref={attachContainer} className={className} id={id} style={style}>
			{contents}
		</div>
	);
});