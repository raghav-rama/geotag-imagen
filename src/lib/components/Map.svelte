<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { locationStore } from '$lib/stores/locationStore';

	let map: any;
	let L: any;
	let searchMarker: any;

	export let height = '500px';
	export let initialView = [12.9716, 77.5946];
	export let initialZoom = 13;

	const mapStyle = {
		light: [
			{
				elementType: 'geometry',
				stylers: [{ color: '#f5f5f5' }]
			},
			{
				elementType: 'labels.text.fill',
				stylers: [{ color: '#616161' }]
			}
		],
		dark: [
			{
				elementType: 'geometry',
				stylers: [{ color: '#242f3e' }]
			},
			{
				elementType: 'labels.text.fill',
				stylers: [{ color: '#746855' }]
			}
		]
	};

	onMount(async () => {
		if (browser) {
			const leaflet = await import('leaflet');
			L = leaflet.default;

			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = '/leaflet.css';
			document.head.appendChild(link);

			map = L.map('map', {
				zoomAnimation: true,
				fadeAnimation: true,
				markerZoomAnimation: true,
				zoomControl: false
			}).setView(initialView, initialZoom);

			L.control
				.zoom({
					position: 'bottomright',
					zoomInText: '+',
					zoomOutText: '−'
				})
				.addTo(map);

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '© OpenStreetMap contributors',
				maxZoom: 19
			}).addTo(map);

			map.on('click', async (e: any) => {
				const { lat, lng } = e.latlng;

				if (searchMarker) {
					searchMarker.remove();
				}

				searchMarker = L.marker([lat, lng], {
					icon: L.divIcon({
						className: 'custom-marker',
						html: `<div class="marker-pin"></div>`,
						iconSize: [30, 30],
						iconAnchor: [15, 30]
					})
				}).addTo(map);

				const ripple = L.divIcon({
					className: 'ripple-marker',
					html: '<div class="ripple"></div>',
					iconSize: [50, 50],
					iconAnchor: [25, 25]
				});

				const rippleMarker = L.marker([lat, lng], { icon: ripple }).addTo(map);
				setTimeout(() => rippleMarker.remove(), 1000);

				await locationStore.setLocation(lat, lng);
			});
		}
	});
</script>

<div class="map-container" style="height: {height};">
	<div id="map"></div>
</div>

<style>
	.map-container {
		margin: 20px 0;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	:global(#map) {
		height: 100%;
		width: 100%;
		border-radius: 12px;
	}

	:global(.custom-marker) {
		background: transparent;
		border: none;
	}

	:global(.marker-pin) {
		width: 30px;
		height: 30px;
		border-radius: 50% 50% 50% 0;
		background: #6366f1;
		position: absolute;
		transform: rotate(-45deg);
		left: 50%;
		top: 50%;
		margin: -15px 0 0 -15px;
		animation: bounce 0.3s ease-out;
	}

	:global(.marker-pin::after) {
		content: '';
		width: 14px;
		height: 14px;
		margin: 8px 0 0 8px;
		background: white;
		position: absolute;
		border-radius: 50%;
	}

	:global(.ripple-marker) {
		background: transparent;
		border: none;
	}

	:global(.ripple) {
		width: 50px;
		height: 50px;
		background: rgba(99, 102, 241, 0.4);
		border-radius: 50%;
		animation: ripple 1s ease-out;
	}

	:global(.leaflet-control-zoom) {
		border: none !important;
		margin: 15px !important;
	}

	:global(.leaflet-control-zoom a) {
		background: white !important;
		color: #374151 !important;
		border: none !important;
		width: 36px !important;
		height: 36px !important;
		line-height: 36px !important;
		font-size: 18px !important;
		border-radius: 8px !important;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
		transition: all 0.2s ease !important;
	}

	:global(.dark-mode .leaflet-control-zoom a) {
		background: #374151 !important;
		color: white !important;
	}

	:global(.leaflet-control-zoom a:hover) {
		background: #f3f4f6 !important;
		transform: translateY(-1px);
	}

	:global(.dark-mode .leaflet-control-zoom a:hover) {
		background: #4b5563 !important;
	}

	@keyframes bounce {
		0% {
			transform: rotate(-45deg) translateY(-15px);
			opacity: 0;
		}
		100% {
			transform: rotate(-45deg) translateY(0);
			opacity: 1;
		}
	}

	@keyframes ripple {
		0% {
			transform: scale(0);
			opacity: 1;
		}
		100% {
			transform: scale(1);
			opacity: 0;
		}
	}

	:global(.dark-mode #map) {
		filter: brightness(0.8) contrast(1.2);
	}
</style>
