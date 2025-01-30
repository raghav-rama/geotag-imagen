import { writable } from 'svelte/store';

export interface LocationData {
	lat: number;
	lng: number;
	address: string;
}

function createLocationStore() {
	const { subscribe, set } = writable<LocationData | null>(null);

	return {
		subscribe,
		setLocation: async (lat: number, lng: number) => {
			try {
				const response = await fetch(`/api/geocode/${lat}/${lng}`);
				if (!response.ok) throw new Error('Failed to fetch location data');
				const data = await response.json();
				set(data);
			} catch (error) {
				console.error('Failed to set location:', error);
				set(null);
			}
		},
		reset: () => set(null)
	};
}

export const locationStore = createLocationStore();
