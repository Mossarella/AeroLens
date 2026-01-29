"use client";

import { useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { FlightOffer, Dictionaries } from "@/interfaces/flight";
import { getAirlineCodes } from "@/lib/utils";
import { Plane, Clock, MapPin, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import html2canvas from "html2canvas-pro";

interface FlightResultsProps {
  flights: FlightOffer[];
  dictionaries?: Dictionaries;
  className?: string;
}

/**
 * Parse ISO 8601 duration string (e.g., "PT5H25M") to human-readable format
 * @param duration - ISO 8601 duration string
 * @returns Formatted duration string (e.g., "5h 25m")
 */
function formatDuration(duration: string): string {
  // Remove 'PT' prefix
  const timeStr = duration.replace("PT", "");

  // Extract hours and minutes
  const hoursMatch = timeStr.match(/(\d+)H/);
  const minutesMatch = timeStr.match(/(\d+)M/);

  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  }
  return "0m";
}

/**
 * Format ISO datetime string to readable time (e.g., "8:00 AM")
 * @param isoString - ISO datetime string
 * @returns Formatted time string
 */
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format date from ISO string (e.g., "Feb 20")
 * @param isoString - ISO datetime string
 * @returns Formatted date string
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
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

/**
 * Calculate total number of stops for a flight offer
 */
function getTotalStops(flight: FlightOffer): number {
  return flight.itineraries.reduce((total, itinerary) => {
    return (
      total +
      itinerary.segments.reduce((segTotal, segment) => {
        return segTotal + segment.numberOfStops;
      }, 0)
    );
  }, 0);
}

/**
 * Get formatted stops text
 */
function getStopsText(stops: number): string {
  if (stops === 0) {
    return "Non-stop";
  } else if (stops === 1) {
    return "1 stop";
  } else {
    return `${stops} stops`;
  }
}

/**
 * Extract flight display information from a flight offer
 */
function getFlightDisplayInfo(
  flight: FlightOffer,
  dictionaries?: Dictionaries
) {
  const outboundItinerary = flight.itineraries[0];
  const returnItinerary = flight.itineraries[1];

  // Get first segment departure and last segment arrival for outbound
  const firstSegment = outboundItinerary?.segments[0];
  const lastSegment =
    outboundItinerary?.segments[outboundItinerary.segments.length - 1];

  const departureTime = firstSegment?.departure.at
    ? formatTime(firstSegment.departure.at)
    : "N/A";
  const arrivalTime = lastSegment?.arrival.at
    ? formatTime(lastSegment.arrival.at)
    : "N/A";

  const departureDate = firstSegment?.departure.at
    ? formatDate(firstSegment.departure.at)
    : "";

  const departureAirport = firstSegment?.departure.iataCode || "N/A";
  const arrivalAirport = lastSegment?.arrival.iataCode || "N/A";

  const duration = outboundItinerary?.duration
    ? formatDuration(outboundItinerary.duration)
    : "N/A";

  const totalStops = getTotalStops(flight);
  const stopsText = getStopsText(totalStops);

  // Get airline codes and names
  const airlineCodes = getAirlineCodes(flight);
  const airlineNames = airlineCodes
    .map((code) => getAirlineName(code, dictionaries))
    .join(", ");

  // Get price
  const price = parseFloat(flight.price.total) || 0;
  const currency = flight.price.currency || "USD";

  // Format price with currency
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return {
    departureTime,
    arrivalTime,
    departureDate,
    departureAirport,
    arrivalAirport,
    duration,
    stopsText,
    totalStops,
    airlineNames,
    airlineCodes,
    formattedPrice,
    price,
    currency,
    returnItinerary: returnItinerary
      ? {
          duration: formatDuration(returnItinerary.duration),
          segments: returnItinerary.segments.length,
        }
      : null,
  };
}

export function FlightResults({
  flights,
  dictionaries,
  className,
}: FlightResultsProps) {
  // Memoize flight display info to avoid recalculating on every render
  const flightDisplayInfo = useMemo(() => {
    return flights.map((flight) => ({
      flight,
      info: getFlightDisplayInfo(flight, dictionaries),
    }));
  }, [flights, dictionaries]);

  const handleDownloadTicket = useCallback(
    async (
      element: HTMLDivElement,
      departureAirport: string,
      arrivalAirport: string
    ) => {
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
        });
        canvas.toBlob((blob: Blob | null) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `boarding-pass-${departureAirport}-${arrivalAirport}.png`;
          a.click();
          URL.revokeObjectURL(url);
        });
      } catch (err) {
        console.error("Failed to capture ticket as image:", err);
      }
    },
    []
  );

  if (flights.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12 px-4",
          className
        )}
      >
        <Plane className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No flights found</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Try adjusting your search criteria or filters to find more results.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="mb-4 flex flex-row gap-x-4 items-baseline ">
        <h2 className="text-2xl font-semibold">
          {flights.length} {flights.length === 1 ? "flight" : "flights"} found
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Click on the flight to download the boarding pass :D
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        {flightDisplayInfo.map(({ flight, info }) => (
          <div
            key={flight.id}
            className="flex justify-center overflow-x-auto"
          >
            <div
              role="button"
              tabIndex={0}
              onClick={(e) =>
                handleDownloadTicket(
                  e.currentTarget,
                  info.departureAirport,
                  info.arrivalAirport
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  (e.currentTarget as HTMLDivElement).click();
                }
              }}
              className="w-full cursor-pointer hover:drop-shadow-lg transition-[filter] flex flex-row"
              title="Click to download"
            >
              <Card className="  flex flex-row  py-4">
                <div className="shrink-0 w-[90px]  h-full flex items-center justify-center">
                  <Image
                    src="/images/barcode.svg"
                    alt="barcode"
                    // width={120}
                    // height={100}
                    fill
                    className=" object-contain "
                  />
                </div>
              </Card>
              <Card
                key={flight.id}
                className=" flex-1 flex flex-row gap-x-0"
              >
                <div className=" flex-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Plane className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-sm text-muted-foreground">
                            {info.airlineNames}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{info.departureDate}</span>
                          {info.totalStops > 0 && (
                            <span className="px-2 py-1 bg-muted rounded-md text-xs">
                              {info.stopsText}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {info.formattedPrice}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          per person
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-row  gap-x-16">
                    <div className="space-y-4  flex-1">
                      {/* Outbound Flight */}
                      <div className="flex items-center gap-8 ">
                        <div className="shrink-0">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-lg">
                              {info.departureAirport}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {info.departureTime}
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col items-center">
                          <div className="flex items-center gap-2 w-full">
                            <div className="h-px bg-border flex-1"></div>
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <div className="h-px bg-border flex-1"></div>
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {info.duration}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="font-semibold text-lg">
                              {info.arrivalAirport}
                            </span>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {info.arrivalTime}
                          </div>
                        </div>
                      </div>

                      {/* Return Flight (if exists) */}
                      {info.returnItinerary && (
                        <>
                          <div className="h-px bg-border"></div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold text-lg">
                                  {info.arrivalAirport}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Return flight
                              </div>
                            </div>

                            <div className="flex flex-col items-center shrink-0">
                              <div className="flex items-center gap-2 w-full">
                                <div className="h-px bg-border flex-1"></div>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <div className="h-px bg-border flex-1"></div>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {info.returnItinerary.duration}
                              </div>
                            </div>

                            <div className="flex-1 text-right">
                              <div className="flex items-center justify-end gap-2 mb-1">
                                <span className="font-semibold text-lg">
                                  {info.departureAirport}
                                </span>
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {info.returnItinerary.segments}{" "}
                                {info.returnItinerary.segments === 1
                                  ? "segment"
                                  : "segments"}
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Flight Details Footer */}
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            {info.totalStops === 0 && (
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                Direct flight
                              </span>
                            )}
                            {flight.numberOfBookableSeats !== undefined && (
                              <span>
                                {flight.numberOfBookableSeats}{" "}
                                {flight.numberOfBookableSeats === 1
                                  ? "seat"
                                  : "seats"}{" "}
                                available
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>
                              Base: {flight.price.base} {flight.price.currency}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  {/* <CardContent className="flex flex-row ">
                  <div className="relative w-full min-h-[20px] flex-1">
                    <Image
                      src="/images/floor.svg"
                      alt="floor"
                      width={0}
                      height={0}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </CardContent> */}
                </div>
                <div className=" flex flex-col items-end justify-between shrink-1  gap-0">
                  <CardHeader className=" w-full  h-auto flex-1   flex flex-col items-center justify-center">
                    <Image
                      src="/images/finish.svg"
                      alt="finish"
                      width={100}
                      height={100}
                      // fill
                      className=" object-contain opacity-80 "
                    />
                    <p className="  tracking-[0.3em] pt-[5px] leading-1 text-xs h-full  w-full  text-center ">
                      Aerolens
                    </p>
                  </CardHeader>
                  <CardContent className=" h-auto shrink-0 opacity-80  flex items-center justify-center">
                    <Image
                      src="/images/arrow.svg"
                      alt="arrow"
                      width={100}
                      height={100}
                      // fill
                      className=" object-contain"
                    />
                  </CardContent>
                </div>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
