import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { lat, lng } = params;
		const response = await fetch(
			`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
		);

		if (!response.ok) {
			throw new Error('Failed to fetch location data');
		}

		const data = await response.json();

		return json({
			address: data.display_name,
			lat: parseFloat(lat),
			lng: parseFloat(lng)
		});
	} catch (error) {
		console.error('Failed to fetch location data:', error);
		return new Response('Failed to fetch location data', { status: 500 });
	}
};
