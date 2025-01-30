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
			<img src="/icons8-gps.gif" alt="GPS Map Camera" width="32" height="32" />
		</div>
	</div>
</div>

<style>
	.overlay-wrapper {
		position: absolute;
		bottom: 20px;
		left: 20px;
		right: 20px;
		display: flex;
		justify-content: center;
	}

	.overlay {
		width: 100%;
		max-width: 600px;
		background: rgba(0, 0, 0, 0.75);
		color: white;
		padding: 15px;
		display: flex;
		align-items: flex-start;
		gap: 15px;
		border-radius: 8px;
		backdrop-filter: blur(8px);
	}

	.map-thumbnail {
		width: 100px;
		height: 100px;
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
		font-size: 10px;
		font-weight: 500;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.location-text {
		flex-grow: 1;
		min-width: 0;
		padding: 5px 0;
	}

	.location-text h2 {
		margin: 0;
		font-size: 14px;
		font-weight: 500;
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.coordinates {
		margin: 8px 0;
		font-size: 12px;
		font-family: monospace;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.timestamp {
		margin: 0;
		font-size: 12px;
		font-family: monospace;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.app-logo {
		display: flex;
		align-items: center;
		padding-top: 5px;
		flex-shrink: 0;
	}

	.app-logo img {
		width: 32px;
		height: 32px;
	}

	@media (max-width: 480px) {
		.overlay-wrapper {
			left: 10px;
			right: 10px;
			bottom: 10px;
		}

		.overlay {
			padding: 10px;
			gap: 10px;
		}

		.map-thumbnail {
			width: 80px;
			height: 80px;
		}

		.location-text h2 {
			font-size: 12px;
		}

		.coordinates,
		.timestamp {
			font-size: 10px;
		}

		.app-logo img {
			width: 24px;
			height: 24px;
		}
	}
</style>
