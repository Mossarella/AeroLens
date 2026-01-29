"use client";

import { useState, useMemo, useEffect } from "react";
import { FlightSearchForm } from "@/components/FlightSearchForm";
import { FlightResults } from "@/components/FlightResults";
import { PriceGraph } from "@/components/PriceGraph";
import { Filters } from "@/components/Filters";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { applyAllFilters, applyStopsAndAirlinesOnly } from "@/lib/utils";
import { getBestValueFlightId } from "@/lib/bestValue";
import type { FlightSearchParams, FilterState } from "@/interfaces/flight";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FlightOffer } from "@/interfaces/flight";
import { MOCK_FLIGHT_SEARCH_RESPONSE } from "@/lib/mockdata/mock-data";

/**
 * Calculate price range from flight offers
 */
function getPriceRange(flights: FlightOffer[]): [number, number] {
  if (flights.length === 0) {
    return [0, 1000];
  }

  const prices = flights.map((flight) => parseFloat(flight.price.total) || 0);
  const min = Math.floor(Math.min(...prices));
  const max = Math.ceil(Math.max(...prices));

  // Ensure minimum is at least 0 and there's a reasonable range
  return [Math.max(0, min), Math.max(max, min + 100)];
}

/**
 * Initialize filter state based on available flights
 */
function getInitialFilterState(flights: FlightOffer[]): FilterState {
  if (flights.length === 0) {
    return {
      stops: "all",
      priceRange: [0, 1000],
      airlines: [],
    };
  }

  const priceRange = getPriceRange(flights);
  return {
    stops: "all",
    priceRange,
    airlines: [], // Empty means all airlines selected
  };
}

export default function Home() {
  const {
    flights: searchResponse,
    loading,
    error,
    search,
    clearError,
  } = useFlightSearch();

  // Filter state
  const [filterState, setFilterState] = useState<FilterState>({
    stops: "all",
    priceRange: [0, 1000],
    airlines: [],
  });

  // Get flights data from search response
  // const allFlights = searchResponse?.data || [];
  const allFlights = searchResponse?.data || MOCK_FLIGHT_SEARCH_RESPONSE.data;

  const dictionaries = searchResponse?.dictionaries;

  // Initialize filter state when flights are loaded
  useEffect(() => {
    if (allFlights.length > 0 && filterState.priceRange[1] === 1000) {
      const initialFilterState = getInitialFilterState(allFlights);
      setFilterState(initialFilterState);
    }
  }, [allFlights.length]); // Only run when flights are first loaded

  // Flights matching stops + airlines only (same cohort as price trend before price filter)
  const flightsForPriceRange = useMemo(() => {
    if (allFlights.length === 0) return [];
    return applyStopsAndAirlinesOnly(
      allFlights,
      filterState.stops,
      filterState.airlines
    );
  }, [allFlights, filterState.stops, filterState.airlines]);

  // Apply filters to flights
  const filteredFlights = useMemo(() => {
    if (allFlights.length === 0) {
      return [];
    }
    return applyAllFilters(allFlights, filterState);
  }, [allFlights, filterState]);

  // Best Value recommendation (lowest price within reasonable constraints)
  const bestValueFlightId = useMemo(
    () => getBestValueFlightId(filteredFlights),
    [filteredFlights]
  );

  // Handle search form submission
  const handleSearch = (params: FlightSearchParams) => {
    search(params);
    // Reset filters when new search is performed
    setFilterState({
      stops: "all",
      priceRange: [0, 1000],
      airlines: [],
    });
  };

  // Handle filter changes; recalc price range when stops/airlines change (price trend cohort)
  const handleFilterChange = (newFilterState: FilterState) => {
    const airlinesChanged =
      newFilterState.airlines.length !== filterState.airlines.length ||
      newFilterState.airlines.some((c, i) => c !== filterState.airlines[i]);
    const cohortChanged =
      newFilterState.stops !== filterState.stops || airlinesChanged;

    if (cohortChanged) {
      const cohort = applyStopsAndAirlinesOnly(
        allFlights,
        newFilterState.stops,
        newFilterState.airlines
      );
      const priceRange =
        cohort.length > 0
          ? getPriceRange(cohort)
          : ([0, 1000] as [number, number]);
      setFilterState({ ...newFilterState, priceRange });
    } else {
      setFilterState(newFilterState);
    }
  };

  return (
    <div className="  min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 ">
          <h1 className="text-4xl font-bold mb-2 text-center">Flight Search</h1>
          <p className="font-[family-name:var(--font-yellowtail)] text-muted-foreground text-center text-2xl">
            Find the best flight deals for your next trip
          </p>
        </div>

        {/* Search Form - Full Width */}
        <div className="mb-8">
          <FlightSearchForm
            onSubmit={handleSearch}
            isLoading={loading}
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-destructive mb-1">
                        Error
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {error.message ||
                          "An error occurred while searching for flights."}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearError}
                    className="shrink-0 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {loading && allFlights.length === 0 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Searching for flights...</span>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Section - Only show if we have flights or have searched */}
        {(allFlights.length > 0 || (!loading && searchResponse !== null)) && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar - Desktop: Left, Mobile: Top */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8">
                <Filters
                  flights={allFlights}
                  flightsForPriceRange={flightsForPriceRange}
                  filterState={filterState}
                  onFilterChange={handleFilterChange}
                  dictionaries={dictionaries}
                />
              </div>
            </div>

            {/* Main Content Area - Results and Graph */}
            <div className="lg:col-span-3 space-y-6">
              {/* Price Graph */}
              <PriceGraph
                flights={filteredFlights}
                dictionaries={dictionaries}
              />

              {/* Flight Results */}
              <FlightResults
                flights={filteredFlights}
                dictionaries={dictionaries}
                bestValueFlightId={bestValueFlightId}
              />
            </div>
          </div>
        )}

        {/* Empty State - No search performed yet */}
        {!loading && searchResponse === null && !error && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-lg text-muted-foreground">
                Enter your search criteria above to find flights
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
