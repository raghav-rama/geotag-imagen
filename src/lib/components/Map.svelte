<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { locationStore } from '$lib/stores/locationStore';

	let map: any;
	let L: any;

	export let height = '400px';
	export let initialView = [12.9716, 77.5946];
	export let initialZoom = 13;

	onMount(async () => {
		if (browser) {
			const leaflet = await import('leaflet');
			L = leaflet.default;

			// Import Leaflet CSS
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = '/leaflet.css';
			document.head.appendChild(link);

			map = L.map('map').setView(initialView, initialZoom);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '© OpenStreetMap contributors',
				crossOrigin: 'anonymous'
			}).addTo(map);

			map.on('click', async (e: any) => {
				const { lat, lng } = e.latlng;
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
	}

	:global(#map) {
		height: 100%;
		width: 100%;
		border-radius: 8px;
	}
</style>
