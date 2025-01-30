import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const { lat, lng } = params;
	const googleUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=17&size=150x150&maptype=hybrid&markers=color:red%7C${lat},${lng}&key=${env.GOOGLE_MAPS_API_KEY}`;

	// fetch from google
	const res = await fetch(googleUrl);
	const arrayBuffer = await res.arrayBuffer();

	// Return the image with the correct CORS header
	return new Response(arrayBuffer, {
		headers: {
			'Content-Type': 'image/png',
			'Access-Control-Allow-Origin': '*'
		}
	});
};
