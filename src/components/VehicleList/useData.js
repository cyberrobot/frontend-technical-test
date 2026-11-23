import { useState, useEffect } from 'react';
import getData from '../../api';

export default function useData() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getData()
      .then((response) => setVehicles(response))
    // React can render strings and numbers, but not an Error object.
      .catch((err) => setError(err.message || 'Unable to load vehicles'))
      .finally(() => setLoading(false));
  }, []);

  return [loading, error, vehicles];
}
