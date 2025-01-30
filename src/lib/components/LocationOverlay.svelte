<script lang="ts">
	import type { LocationData } from '$lib/stores/locationStore';

	export let location: LocationData;
	export let mapThumbnail: string;
</script>

<div class="overlay-wrapper">
	<div class="overlay">
		<div class="map-thumbnail">
			<img src={mapThumbnail} alt="Location" class="thumbnail-img" />
			<div class="google-logo">Google</div>
		</div>
		<div class="location-text">
			<h2>{location.address}</h2>
			<p class="coordinates">
				Lat {location.lat.toFixed(6)}° Long {location.lng.toFixed(6)}°
			</p>
			<p class="timestamp">
				{new Date().toLocaleString('en-US', {
					timeZone: 'Asia/Kolkata',
					hour12: false,
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit'
				})} GMT +05:30
			</p>
		</div>
		<div class="app-logo">
			<img src="/icons8-gps.gif" alt="GPS Map Camera" />
		</div>
	</div>
</div>

<style>
	.overlay-wrapper {
		position: absolute;
		bottom: 20px;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
	}

	.overlay {
		width: 70%;
		background: rgba(0, 0, 0, 0.5);
		color: white;
		padding: 15px;
		display: flex;
		align-items: flex-start;
		gap: 15px;
		border-radius: 8px;
	}

	.map-thumbnail {
		width: 150px;
		height: 150px;
		position: relative;
		flex-shrink: 0;
	}

	.thumbnail-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 4px;
	}

	.google-logo {
		position: absolute;
		bottom: 5px;
		left: 5px;
		font-size: 12px;
		font-weight: 500;
	}

	.location-text {
		flex-grow: 1;
		padding: 5px 0;
	}

	.location-text h2 {
		margin: 0;
		font-size: 16px;
		font-weight: 500;
		line-height: 1.4;
	}

	.coordinates {
		margin: 8px 0;
		font-size: 14px;
		font-family: monospace;
	}

	.timestamp {
		margin: 0;
		font-size: 14px;
		font-family: monospace;
	}

	.app-logo {
		display: flex;
		align-items: center;
		padding-top: 5px;
	}
</style>
