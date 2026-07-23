import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/config';

export interface TrainOption {
  train_number: string;
  train_name: string;
  from_station: string;
  to_station: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  classes: string[];
  fare_min: number;
  fare_max: number;
  is_unofficial_data: boolean;
  data_source: string;
  disclaimer: string;
}

export function useTrains(origin: string, destination: string) {
  const [trains, setTrains] = useState<TrainOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState<string>('');

  useEffect(() => {
    if (!origin || !destination) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/api/trains/search?dep=${encodeURIComponent(origin)}&arr=${encodeURIComponent(destination)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.trains)) {
          setTrains(data.trains);
          setDisclaimer(data.disclaimer || '');
        } else {
          setError(data.error || 'Failed to search trains');
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Network error fetching train data');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [origin, destination]);

  return { trains, loading, error, disclaimer };
}
