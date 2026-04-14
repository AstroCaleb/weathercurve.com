import axios from 'axios';

interface ArcGISLocation {
  feature: {
    geometry: {
      x: number;
      y: number;
    };
  };
}

interface ArcGISResponse {
  locations: ArcGISLocation[];
}

interface BigDataCloudResponse {
  locality: string;
  city: string;
  principalSubdivision: string;
  countryCode: string;
}

export interface GeocodedLocation {
  latitude: number;
  longitude: number;
  name: string;
}

export async function geocodeAddress(query: string): Promise<GeocodedLocation> {
  const cleaned = query.replace(/ /g, '+');
  const arcgisUrl = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?f=json&text=${cleaned}`;
  const arcgisResponse = await axios.get<ArcGISResponse>(arcgisUrl);

  const location = arcgisResponse.data.locations?.[0];
  if (!location) {
    throw new Error('Location not found');
  }

  const longitude = location.feature.geometry.x;
  const latitude = location.feature.geometry.y;
  const name = await reverseGeocode(latitude, longitude);

  return { latitude, longitude, name };
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string> {
  const url = 'https://api.bigdatacloud.net/data/reverse-geocode-client';
  const response = await axios.get<BigDataCloudResponse>(url, {
    params: {
      latitude,
      longitude,
      localityLanguage: 'en',
    },
  });

  const data = response.data;
  const city = data.locality || data.city;
  return `${city}, ${data.principalSubdivision}, ${data.countryCode}`;
}
