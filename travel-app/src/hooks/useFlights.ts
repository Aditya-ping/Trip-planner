import { useState, useCallback } from 'react';
import { API_BASE_URL } from '../utils/config';

export interface City {
  city: string;
  iata: string;
  note: string | null;
}

export interface Flight {
  offer_id: string;
  airline: string;
  airline_code: string;
  flight_no: string;
  from: string;
  from_city: string;
  to: string;
  to_city: string;
  departs: string;
  arrives: string;
  duration: string;
  stops: number;
  cabin: string;
  price: number;
  currency: string;
}

export interface FlightSearchData {
  from: string;
  to: string;
  destination: string;
  date: string;
  cabin: string;
  count: number;
  airport_note: string | null;
  flights: Flight[];
}

export function useFlights() {
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = useCallback(async () => {
    setCitiesLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/flights/cities`);
      const data = await res.json();
      if (data.cities) {
        setCities(data.cities);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
      setError('Failed to fetch cities');
    } finally {
      setCitiesLoading(false);
    }
  }, []);

  const searchFlights = useCallback(async (
    originIata: string,
    destinationName: string,
    date: string,
    adults: number = 1
  ): Promise<FlightSearchData | null> => {
    setFlightsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        from: originIata,
        destination: destinationName,
        date,
        adults: adults.toString()
      });
      const res = await fetch(`${API_BASE_URL}/api/flights/search?${params.toString()}`);
      const data = await res.json();
      
      if (data.error) {
        setError(Array.isArray(data.error) ? data.error[0].message : data.error);
        return null;
      }
      
      return data as FlightSearchData;
    } catch (err) {
      console.error('Error searching flights:', err);
      setError('Failed to search flights');
      return null;
    } finally {
      setFlightsLoading(false);
    }
  }, []);

  return {
    cities,
    citiesLoading,
    flightsLoading,
    error,
    fetchCities,
    searchFlights
  };
}
