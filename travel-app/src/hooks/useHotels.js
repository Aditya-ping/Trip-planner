// travel-app/src/hooks/useHotels.js
import { useState } from 'react'

const API = 'http://localhost:5000'

export function useHotels() {
  const [hotels, setHotels]   = useState([])
  const [rates,  setRates]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,  setError]    = useState(null)

  // Fetch hotel list for a destination
  const fetchHotels = async (destination = 'Rajasthan', sort = 'best_value') => {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(`${API}/api/hotels?destination=${destination}&sort=${sort}&limit=10`)
      const data = await res.json()
      setHotels(data.hotels || [])
    } catch (e) {
      setError('Could not load hotels')
    } finally {
      setLoading(false)
    }
  }

  // Fetch live rates for a specific hotel
  const fetchRates = async (hotelKey, checkIn, checkOut, rooms = 1, adults = 2) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ hotel_key: hotelKey, chk_in: checkIn, chk_out: checkOut, rooms, adults })
      const res    = await fetch(`${API}/api/hotel-rates?${params}`)
      const data   = await res.json()
      setRates(data)
    } catch (e) {
      setError('Could not load rates')
    } finally {
      setLoading(false)
    }
  }

  return { hotels, rates, loading, error, fetchHotels, fetchRates }
}
