import { AxiosError, AxiosResponse } from 'axios';
import {
  GeoSearchError,
  GeoSearchErrorMessage,
  GeoSearchOptions,
  GeoSearchResult,
  GeoSearchUserData,
} from '../interface/geosearch.interface';
import { getCountryBounds } from './countries';

export const getBounds = (options: GeoSearchOptions | undefined): Promise<string> => {
  return new Promise((resolve) => {
    let boundsString = '';
    let bounds;
    if (options?.bounds || options?.country) {
      bounds = options?.bounds || getCountryBounds(options?.country);
      if (bounds) {
        boundsString = `&bounds=${encodeURIComponent(
          `${bounds.sw.lat},${bounds.sw.lng}|${bounds.ne.lat},${bounds.ne.lng}`
        )}`;
      }
    }
    resolve(boundsString);
  });
};

export const createError = (
  message: GeoSearchErrorMessage,
  axiosResponse?: AxiosResponse<any>,
  axiosError?: AxiosError
): GeoSearchError => {
  const error = new Error(message) as GeoSearchError;
  error.name = 'GeoSearchError';
  error.isGeoSearchError = true;
  error.axiosError = axiosError;
  error.axiosResponse = axiosResponse;
  return error;
};

export const isGeoSearchError = (e: Error | GeoSearchError): e is GeoSearchError => {
  return (<GeoSearchError>e).isGeoSearchError !== undefined;
};

export const filterData = (data: GeoSearchResult[], options: GeoSearchOptions | undefined): GeoSearchResult[] => {
  let places = data;
  if (options?.scope) {
    // Filter category by scope
    places = places.filter((item) => String(item.category).includes(String(options.scope)));

    // Special conditions for the Czech Republic
    if (options?.country === 'cz') {
      places = places.filter((item) => item.userData.source === options.scope);
    }
  }
  return places;
};

export const getUserData = (places: GeoSearchResult[]): GeoSearchUserData[] => {
  return places.map((place) => place.userData);
};
