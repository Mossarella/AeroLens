'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { searchFlights } from '@/lib/api'
import type { FlightSearchParams, FlightSearchResponse } from '@/interfaces/flight'

interface UseFlightSearchReturn {
  flights: FlightSearchResponse | null
  loading: boolean
  error: Error | null
  search: (params: FlightSearchParams) => void
  clearError: () => void
}

/**
 * Custom hook for flight search with debounced search logic
 * @param debounceDelay - Delay in milliseconds for debouncing (default: 400ms)
 * @returns Object containing flights data, loading state, error, and search function
 */
export function useFlightSearch(
  debounceDelay: number = 400
): UseFlightSearchReturn {
  const [flights, setFlights] = useState<FlightSearchResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  // Use ref to store the timeout ID for debouncing
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Use ref to track if component is mounted to avoid state updates after unmount
  const isMountedRef = useRef<boolean>(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      // Clear any pending debounced calls on unmount
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  /**
   * Internal function to perform the actual API call
   */
  const performSearch = useCallback(async (params: FlightSearchParams) => {
    if (!isMountedRef.current) return

    setLoading(true)
    setError(null)

    try {
      const response = await searchFlights(params)
      
      if (isMountedRef.current) {
        setFlights(response)
        setLoading(false)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred')
        setError(error)
        setLoading(false)
        // Optionally keep previous flights data on error, or clear it
        // setFlights(null)
      }
    }
  }, [])

  /**
   * Debounced search function
   * This function will delay the API call until the user stops calling it
   * for the specified debounce delay period
   */
  const search = useCallback(
    (params: FlightSearchParams) => {
      // Clear any existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      // Set loading state immediately for better UX
      setLoading(true)
      setError(null)

      // Set up new timeout for debounced search
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(params)
      }, debounceDelay)
    },
    [performSearch, debounceDelay]
  )

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    flights,
    loading,
    error,
    search,
    clearError,
  }
}
