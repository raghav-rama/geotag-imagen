<script lang="ts">
	import { locationStore } from '$lib/stores/locationStore';
	import Map from '$lib/components/Map.svelte';
	import LocationOverlay from '$lib/components/LocationOverlay.svelte';
	import { onMount } from 'svelte';

	let uploadedImage: string | null = null;
	let resultContainer: HTMLDivElement | null = null;
	let isGenerating = false;
	let mapThumbnail: string | null = null;
	let isDarkMode = false;
	let searchQuery = '';
	let searchResults: { display_name: string; lat: number; lon: number }[] = [];
	let isSearching = false;
	let searchTimeout: ReturnType<typeof setTimeout>;

	onMount(() => {
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			isDarkMode = true;
			document.body.classList.add('dark-mode');
		}
	});

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		document.body.classList.toggle('dark-mode');
	}

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

	async function handleSearch() {
		if (!searchQuery.trim()) return;

		try {
			isSearching = true;
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
			);
			const data = await response.json();
			searchResults = data.map((item: any) => ({
				display_name: item.display_name,
				lat: parseFloat(item.lat),
				lon: parseFloat(item.lon)
			}));
		} catch (error) {
			console.error('Search failed:', error);
			searchResults = [];
		} finally {
			isSearching = false;
		}
	}

	function selectLocation(result: { lat: number; lon: number }) {
		locationStore.setLocation(result.lat, result.lon);
		searchResults = [];
		searchQuery = '';
	}

	function debouncedSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			if (searchQuery.trim()) {
				handleSearch();
			} else {
				searchResults = [];
			}
		}, 300);
	}
</script>

<svelte:head>
	<title>Geotag Imagen</title>
	<meta name="description" content="Geotag your images with the location of the image" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="app-container {isDarkMode ? 'dark-mode' : ''}">
	<header class="header">
		<div class="search-container">
			<input
				type="text"
				placeholder="Search location..."
				bind:value={searchQuery}
				class="search-input"
				on:input={debouncedSearch}
			/>
			<button class="search-button" aria-label="Search" on:click={handleSearch}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
					<path
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14z"
					/>
				</svg>
			</button>
			{#if searchResults.length > 0}
				<div class="search-results">
					{#each searchResults as result}
						<button class="search-result-item" on:click={() => selectLocation(result)}>
							{result.display_name}
						</button>
					{/each}
				</div>
			{/if}
		</div>
		<button class="theme-toggle" on:click={toggleDarkMode}>
			{#if isDarkMode}
				🌞
			{:else}
				🌙
			{/if}
		</button>
	</header>

	<div class="content">
		<div class="upload-section">
			<label class="file-upload">
				<input type="file" accept="image/*" on:change={handleFileUpload} class="file-input" />
				<span class="upload-text">
					{uploadedImage ? 'Change Image' : 'Upload Image'}
				</span>
			</label>
		</div>

		{#if uploadedImage && $locationStore && mapThumbnail}
			<div class="result-container" bind:this={resultContainer}>
				<img src={uploadedImage} alt="Uploaded" class="uploaded-image" />
				<LocationOverlay location={$locationStore} {mapThumbnail} />
			</div>
			<button on:click={generateImage} class="download-btn" disabled={isGenerating}>
				{isGenerating ? 'Generating...' : 'Download Image'}
			</button>
		{/if}

		<div class="map-container">
			<Map />
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			'Inter',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
		transition: background-color 0.3s ease;
	}

	:global(body.dark-mode) {
		background-color: #1a1a1a;
		color: #ffffff;
	}

	.app-container {
		min-height: 100vh;
		background-color: #f8f9fa;
		transition: background-color 0.3s ease;
	}

	.app-container.dark-mode {
		background-color: #1a1a1a;
	}

	.header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		padding: 1rem;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		gap: 1rem;
	}

	.search-container {
		position: relative;
		max-width: 600px;
		width: 100%;
	}

	.search-input {
		width: 100%;
		padding: 12px 40px 12px 16px;
		border: none;
		border-radius: 50px;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		font-size: 1rem;
		transition: all 0.3s ease;
	}

	.dark-mode .search-input {
		background: rgba(40, 40, 40, 0.9);
		color: white;
	}

	.search-input:focus {
		outline: none;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.search-button {
		position: absolute;
		right: 12px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		cursor: pointer;
		color: #666;
		padding: 4px;
		transition: color 0.3s ease;
	}

	.dark-mode .search-button {
		color: #aaa;
	}

	.theme-toggle {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 8px;
		border-radius: 50%;
		transition: background-color 0.3s ease;
	}

	.theme-toggle:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.content {
		max-width: 1200px;
		margin: 80px auto 0;
		padding: 20px;
	}

	.upload-section {
		margin-bottom: 2rem;
		text-align: center;
	}

	.file-upload {
		display: inline-block;
		padding: 12px 24px;
		background: linear-gradient(135deg, #6366f1, #4f46e5);
		color: white;
		border-radius: 8px;
		cursor: pointer;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.file-upload:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
	}

	.file-input {
		display: none;
	}

	.upload-text {
		font-weight: 500;
	}

	.result-container {
		position: relative;
		margin-top: 20px;
		width: 100%;
		max-width: 800px;
		display: block;
		margin-left: auto;
		margin-right: auto;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
		background: white;
	}

	.dark-mode .result-container {
		background: #2a2a2a;
	}

	.uploaded-image {
		width: 100%;
		height: auto;
		display: block;
		object-fit: contain;
	}

	.download-btn {
		margin-top: 20px;
		padding: 12px 24px;
		background: linear-gradient(135deg, #10b981, #059669);
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.3s ease;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		display: block;
		margin-left: auto;
		margin-right: auto;
	}

	.download-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
	}

	.download-btn:disabled {
		background: #9ca3af;
		cursor: not-allowed;
		transform: none;
	}

	@media (max-width: 768px) {
		.content {
			padding: 16px 0;
			margin-top: 60px;
		}

		.result-container {
			margin: 12px 0;
			border-radius: 0;
			max-width: 100%;
			box-shadow: none;
		}

		.map-container {
			margin: 12px;
			border-radius: 8px;
		}

		.upload-section {
			margin: 0 16px 1rem 16px;
		}

		.download-btn {
			margin: 12px 16px;
			width: calc(100% - 32px);
		}
	}

	.search-results {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: #ffffff;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		margin-top: 4px;
		max-height: 300px;
		overflow-y: auto;
		z-index: 1000;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.dark-mode .search-results {
		background: #2a2a2a;
		border-color: rgba(255, 255, 255, 0.1);
	}

	.search-result-item {
		width: 100%;
		padding: 8px 12px;
		border: none;
		background: none;
		text-align: left;
		cursor: pointer;
		color: #333;
		font-size: 14px;
		transition: background-color 0.2s;
	}

	.dark-mode .search-result-item {
		color: #ffffff;
	}

	.search-result-item:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.dark-mode .search-result-item:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.map-container {
		padding: 20px;
		background: white;
		border-radius: 12px;
		margin-top: 20px;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
	}

	.dark-mode .map-container {
		background: #2a2a2a;
	}
</style>
