"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { searchFlights } from "@/lib/api";
import type {
  FlightSearchParams,
  FlightSearchResponse,
} from "@/interfaces/flight";

interface UseFlightSearchReturn {
  flights: FlightSearchResponse | null;
  loading: boolean;
  error: Error | null;
  search: (params: FlightSearchParams) => void;
  clearError: () => void;
}

/**
 * Custom hook for flight search
 * @returns Object containing flights data, loading state, error, and search function
 */
export function useFlightSearch(): UseFlightSearchReturn {
  const [flights, setFlights] = useState<FlightSearchResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Use ref to track if component is mounted to avoid state updates after unmount
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Search function that performs the API call
   */
  const search = useCallback(async (params: FlightSearchParams) => {
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const response = await searchFlights(params);

      if (isMountedRef.current) {
        setFlights(response);
        setLoading(false);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const error =
          err instanceof Error ? err : new Error("An unknown error occurred");
        setError(error);
        setLoading(false);
        // Optionally keep previous flights data on error, or clear it
        // setFlights(null)
      }
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    flights,
    loading,
    error,
    search,
    clearError,
  };
}
