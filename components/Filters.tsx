"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type {
  FlightOffer,
  FilterState,
  Dictionaries,
} from "@/interfaces/flight";
import { getAirlineCodes } from "@/lib/utils";
import { Filter, Plane } from "lucide-react";

interface FiltersProps {
  flights: FlightOffer[];
  filterState: FilterState;
  onFilterChange: (newState: FilterState) => void;
  dictionaries?: Dictionaries;
}

/**
 * Extract all unique airline codes from flight offers
 */
function getAllAirlineCodes(flights: FlightOffer[]): string[] {
  const codes = new Set<string>();
  flights.forEach((flight) => {
    getAirlineCodes(flight).forEach((code) => codes.add(code));
  });
  return Array.from(codes).sort();
}

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
 * Get airline name from code, using dictionary if available
 */
function getAirlineName(code: string, dictionaries?: Dictionaries): string {
  if (dictionaries?.carriers?.[code]) {
    return dictionaries.carriers[code];
  }
  return code;
}

export function Filters({
  flights,
  filterState,
  onFilterChange,
  dictionaries,
}: FiltersProps) {
  // Extract available airlines from flights
  const availableAirlines = useMemo(() => {
    return getAllAirlineCodes(flights);
  }, [flights]);

  // Calculate price range from flights
  const priceRange = useMemo(() => {
    return getPriceRange(flights);
  }, [flights]);

  // Handle stops filter change
  const handleStopsChange = (stops: FilterState["stops"]) => {
    onFilterChange({
      ...filterState,
      stops,
    });
  };

  // Handle price range change
  const handlePriceRangeChange = (values: number[]) => {
    onFilterChange({
      ...filterState,
      priceRange: [values[0], values[1]],
    });
  };

  // Handle airline toggle
  const handleAirlineToggle = (airlineCode: string, checked: boolean) => {
    const currentAirlines = filterState.airlines;
    const newAirlines = checked
      ? [...currentAirlines, airlineCode]
      : currentAirlines.filter((code) => code !== airlineCode);

    onFilterChange({
      ...filterState,
      airlines: newAirlines,
    });
  };

  // Handle select all/none airlines
  const handleSelectAllAirlines = () => {
    if (filterState.airlines.length === availableAirlines.length) {
      // Deselect all
      onFilterChange({
        ...filterState,
        airlines: [],
      });
    } else {
      // Select all
      onFilterChange({
        ...filterState,
        airlines: [...availableAirlines],
      });
    }
  };

  const stopsOptions: Array<{ value: FilterState["stops"]; label: string }> = [
    { value: "all", label: "All" },
    { value: "nonstop", label: "Non-stop" },
    { value: "1stop", label: "1 stop" },
    { value: "2plus", label: "2+ stops" },
  ];

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stops Filter */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Stops</Label>
          <div className="flex flex-wrap gap-2">
            {stopsOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={
                  filterState.stops === option.value ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleStopsChange(option.value)}
                className="flex-1 min-w-20"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Price Range</Label>
            <span className="text-sm text-muted-foreground">
              {filterState.priceRange[0] === priceRange[0] &&
              filterState.priceRange[1] === priceRange[1]
                ? "All prices"
                : `$${filterState.priceRange[0]} - $${filterState.priceRange[1]}`}
            </span>
          </div>
          <Slider
            value={[filterState.priceRange[0], filterState.priceRange[1]]}
            onValueChange={handlePriceRangeChange}
            min={priceRange[0]}
            max={priceRange[1]}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>

        {/* Airlines Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Airlines
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSelectAllAirlines}
              className="h-auto py-1 text-xs"
            >
              {filterState.airlines.length === availableAirlines.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>
          {availableAirlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No airlines available
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableAirlines.map((airlineCode) => {
                const isChecked = filterState.airlines.includes(airlineCode);
                const airlineName = getAirlineName(airlineCode, dictionaries);
                return (
                  <div
                    key={airlineCode}
                    className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent transition-colors"
                  >
                    <Checkbox
                      id={`airline-${airlineCode}`}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleAirlineToggle(airlineCode, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`airline-${airlineCode}`}
                      className="flex-1 cursor-pointer text-sm font-normal"
                    >
                      {airlineName}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
