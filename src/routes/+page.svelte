<script lang="ts">
	import { locationStore } from '$lib/stores/locationStore';
	import Map from '$lib/components/Map.svelte';
	import LocationOverlay from '$lib/components/LocationOverlay.svelte';

	let uploadedImage: string | null = null;
	let resultContainer: HTMLDivElement | null = null;
	let isGenerating = false;
	let mapThumbnail: string | null = null;

	$: if ($locationStore) {
		mapThumbnail = `/api/mapThumbnail/${$locationStore.lat}/${$locationStore.lng}`;
	}

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				uploadedImage = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	async function generateImage() {
		if (!uploadedImage || !$locationStore || !resultContainer) return;

		try {
			isGenerating = true;
			await new Promise((resolve) => setTimeout(resolve, 500));

			const { toCanvas } = await import('html-to-image');
			const canvas = await toCanvas(resultContainer, {
				quality: 1,
				pixelRatio: 2,
				skipAutoScale: true,
				skipFonts: true,
				style: {
					transform: 'none'
				}
			});

			canvas.toBlob(
				(blob) => {
					if (!blob) throw new Error('Failed to generate image');
					const url = window.URL.createObjectURL(blob);
					const link = document.createElement('a');
					link.download = 'geotagged-image.png';
					link.href = url;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					window.URL.revokeObjectURL(url);
				},
				'image/png',
				1.0
			);
		} catch (error) {
			console.error('Failed to generate image:', error);
			alert('Failed to generate image. Please try again.');
		} finally {
			isGenerating = false;
		}
	}
</script>

<svelte:head>
	<title>Geotag Imagen</title>
	<meta name="description" content="Geotag your images with the location of the image" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="container">
	<div class="upload-section">
		<input type="file" accept="image/*" on:change={handleFileUpload} class="file-input" />
	</div>

	<Map />

	{#if uploadedImage && $locationStore && mapThumbnail}
		<div class="result-container" bind:this={resultContainer}>
			<img src={uploadedImage} alt="Uploaded" class="uploaded-image" />
			<LocationOverlay location={$locationStore} {mapThumbnail} />
		</div>
		<button on:click={generateImage} class="download-btn" disabled={isGenerating}>
			{isGenerating ? 'Generating...' : 'Download Image'}
		</button>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu,
			Cantarell, sans-serif;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
	}

	.result-container {
		position: relative;
		margin-top: 20px;
		max-width: 100%;
		display: inline-block;
		transform: none !important;
	}

	.uploaded-image {
		max-width: 100%;
		height: auto;
		transform: none !important;
	}

	.download-btn {
		margin-top: 20px;
		padding: 10px 20px;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.download-btn:hover {
		background: #0056b3;
	}

	.file-input {
		margin-bottom: 20px;
	}
</style>
