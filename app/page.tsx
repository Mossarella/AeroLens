"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { FlightSearchForm } from "@/components/FlightSearchForm";
import { FlightResults } from "@/components/FlightResults";
import { PriceGraph } from "@/components/PriceGraph";
import { Filters } from "@/components/Filters";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { applyAllFilters, applyStopsAndAirlinesOnly } from "@/lib/utils";
import type { FlightSearchParams, FilterState } from "@/interfaces/flight";
import { Card, CardContent } from "@/components/ui/card";
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

  const prevLoadingRef = useRef(false);

  // Get flights data from search response
  const allFlights = searchResponse?.data || [];
  // const allFlights = searchResponse?.data || MOCK_FLIGHT_SEARCH_RESPONSE.data;

  const dictionaries = searchResponse?.dictionaries;

  // Initialize filter state when flights are first loaded (e.g. initial load with mock)
  useEffect(() => {
    if (allFlights.length > 0 && filterState.priceRange[1] === 1000) {
      const initialFilterState = getInitialFilterState(allFlights);
      setFilterState(initialFilterState);
    }
  }, [allFlights.length]); // Only run when flights are first loaded

  // Reset filters only after a new search has completed (not when user clicks search)
  useEffect(() => {
    if (prevLoadingRef.current && !loading) {
      if (allFlights.length > 0) {
        setFilterState(getInitialFilterState(allFlights));
      } else {
        setFilterState({
          stops: "all",
          priceRange: [0, 1000],
          airlines: [],
        });
      }
    }
    prevLoadingRef.current = loading;
  }, [loading, allFlights]);

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

  // Handle search form submission — do not reset filters here; reset after search completes
  const handleSearch = (params: FlightSearchParams) => {
    search(params);
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
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        {/* Search Form - Hanging board with chains */}
        <section
          className="relative mb-6 sm:mb-8"
          aria-label="Search flights"
        >
          <div className="relative w-full">
            {/* Chain zone: fixed height so title can be centered in it */}
            <div className="relative  w-full h-[80px]">
              {/* Left chain - repeat PNG vertically at natural size */}
              <div
                className="absolute left-4 top-0 z-10 h-full w-8 lg:left-8"
                aria-hidden
                style={{
                  backgroundImage: "url(/images/chain.png)",
                  backgroundRepeat: "repeat-y",
                  backgroundSize: "12px auto",
                  backgroundPosition: "top",
                }}
              />
              {/* Right chain - repeat PNG vertically at natural size */}
              <div
                className="absolute right-4 top-0 z-10 h-full w-8 lg:right-8"
                aria-hidden
                style={{
                  backgroundImage: "url(/images/chain.png)",
                  backgroundRepeat: "repeat-y",
                  backgroundSize: "12px auto",
                  backgroundPosition: "top",
                }}
              />
              {/* Title absolutely centered in the chain area */}
              <div className="absolute left-1/2 top-[40px] z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center w-full ">
                <h1 className="  leading-[1] font-semibold tracking-tight text-foreground text-2xl sm:text-3xl ">
                  Flight Search
                </h1>
                <p className="mt-1 leading-[1] text-sm  sm:text-lg text-muted-foreground font-[family-name:var(--font-yellowtail)]">
                  Find the best flight deals for your next trip
                </p>
              </div>
            </div>
            <FlightSearchForm
              onSubmit={handleSearch}
              isLoading={loading}
            />
          </div>
        </section>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 mx-auto max-w-4xl">
            <Card className="border-destructive/80 bg-destructive/5 rounded-lg">
              <CardContent className="p-4 sm:p-5">
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
          <Card className="max-w-7xl mx-auto rounded-xl border border-border bg-card shadow-sm">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="flex items-center justify-center gap-3 text-base text-muted-foreground sm:text-lg">
                <Loader2 className="h-5 w-5 animate-spin shrink-0" />
                <span>Searching for flights...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section - Only show if we have flights or have searched */}
        {(allFlights.length > 0 || (!loading && searchResponse !== null)) && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8 lg:items-stretch">
            {/* Filters Sidebar - full height of row minus padding; airlines list scrolls */}
            <div className="lg:col-span-1 order-2 lg:order-1 flex min-h-0">
              <div className="w-full lg:sticky lg:top-8 lg:flex lg:h-[calc(100vh-8rem)] lg:flex-col lg:min-h-0">
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
            <div className="lg:col-span-3 space-y-6 order-1 lg:order-2 min-w-0">
              {/* Price Graph */}
              <PriceGraph
                flights={filteredFlights}
                dictionaries={dictionaries}
              />

              {/* Flight Results */}
              <FlightResults
                flights={filteredFlights}
                dictionaries={dictionaries}
              />
            </div>
          </div>
        )}

        {/* Empty State - No search performed yet */}
        {!loading && searchResponse === null && !error && (
          <Card className="max-w-7xl mx-auto rounded-xl border border-border bg-card shadow-sm">
            <CardContent className="p-8 sm:p-12 text-center">
              <p className="text-base text-muted-foreground sm:text-lg">
                Enter your search criteria above to find flights
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
