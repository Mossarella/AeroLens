"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FlightSearchParams } from "@/interfaces/flight";
import { Calendar, Plane, Users } from "lucide-react";

interface CountryOption {
  code: string;
  name: string;
}

interface AirportOption {
  iataCode: string;
  name: string;
  cityName?: string;
  countryName?: string;
}

/** Value used when no airports are available for the selected country (invalid for search). */
const NO_AIRPORTS_PLACEHOLDER = "__no_airports__";

// Zod schema for form validation
const flightSearchSchema = z
  .object({
    origin: z
      .string()
      .transform((val) => (val ?? "").toUpperCase())
      .refine((val) => val !== NO_AIRPORTS_PLACEHOLDER.toUpperCase(), {
        message:
          "No airports available for this country. Please choose another country.",
      })
      .refine((val) => val.length === 3 && /^[A-Z]{3}$/.test(val), {
        message: "Please select an origin airport",
      }),
    destination: z
      .string()
      .transform((val) => (val ?? "").toUpperCase())
      .refine((val) => val !== NO_AIRPORTS_PLACEHOLDER.toUpperCase(), {
        message:
          "No airports available for this country. Please choose another country.",
      })
      .refine((val) => val.length === 3 && /^[A-Z]{3}$/.test(val), {
        message: "Please select a destination airport",
      }),
    departureDate: z
      .string()
      .min(1, "Departure date is required")
      .refine(
        (date) => {
          const selectedDate = new Date(date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return selectedDate >= today;
        },
        {
          message: "Departure date must be today or in the future",
        }
      ),
    returnDate: z.string().optional(),
    adults: z
      .number()
      .int("Adults must be a whole number")
      .min(1, "At least 1 adult is required")
      .max(9, "Maximum 9 adults allowed"),
    children: z
      .number()
      .int("Children must be a whole number")
      .min(0, "Children cannot be negative")
      .max(9, "Maximum 9 children allowed"),
    infants: z
      .number()
      .int("Infants must be a whole number")
      .min(0, "Infants cannot be negative")
      .max(9, "Maximum 9 infants allowed"),
  })
  .refine(
    (data) => {
      if (!data.returnDate) return true; // Optional field
      const returnDate = new Date(data.returnDate);
      const departureDate = new Date(data.departureDate);
      return returnDate >= departureDate;
    },
    {
      message: "Return date must be on or after departure date",
      path: ["returnDate"], // This will attach the error to the returnDate field
    }
  )
  .refine(
    (data) => {
      return data.origin !== data.destination;
    },
    {
      message: "Origin and destination must be different",
      path: ["destination"],
    }
  );

type FlightSearchFormData = z.infer<typeof flightSearchSchema>;

interface FlightSearchFormProps {
  onSubmit: (data: FlightSearchParams) => void;
  isLoading?: boolean;
}

export function FlightSearchForm({
  onSubmit,
  isLoading = false,
}: FlightSearchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<FlightSearchFormData>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      origin: "",
      destination: "",
      departureDate: "",
      returnDate: "",
      adults: 1,
      children: 0,
      infants: 0,
    },
  });

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [originCountryCode, setOriginCountryCode] = useState<string>("");
  const [destinationCountryCode, setDestinationCountryCode] =
    useState<string>("");
  const [originAirports, setOriginAirports] = useState<AirportOption[]>([]);
  const [destinationAirports, setDestinationAirports] = useState<
    AirportOption[]
  >([]);
  const [loadingOriginAirports, setLoadingOriginAirports] = useState(false);
  const [loadingDestinationAirports, setLoadingDestinationAirports] =
    useState(false);

  const returnDate = watch("returnDate");
  const departureDate = watch("departureDate");
  const origin = watch("origin");
  const destination = watch("destination");

  // Fetch countries on mount
  useEffect(() => {
    fetch("/api/locations/countries")
      .then((res) => res.json())
      .then((data: CountryOption[]) =>
        setCountries(Array.isArray(data) ? data : [])
      )
      .catch(() => setCountries([]));
  }, []);

  // When origin country changes: clear origin, fetch airports for that country
  useEffect(() => {
    if (!originCountryCode) {
      setOriginAirports([]);
      setValue("origin", "");
      return;
    }
    setValue("origin", "");
    setLoadingOriginAirports(true);
    fetch(
      `/api/locations/airports?countryCode=${encodeURIComponent(
        originCountryCode
      )}`
    )
      .then((res) => res.json())
      .then((data: { airports?: AirportOption[] }) => {
        setOriginAirports(Array.isArray(data?.airports) ? data.airports : []);
      })
      .catch(() => setOriginAirports([]))
      .finally(() => setLoadingOriginAirports(false));
  }, [originCountryCode, setValue]);

  // When destination country changes: clear destination, fetch airports for that country
  useEffect(() => {
    if (!destinationCountryCode) {
      setDestinationAirports([]);
      setValue("destination", "");
      return;
    }
    setValue("destination", "");
    setLoadingDestinationAirports(true);
    fetch(
      `/api/locations/airports?countryCode=${encodeURIComponent(
        destinationCountryCode
      )}`
    )
      .then((res) => res.json())
      .then((data: { airports?: AirportOption[] }) => {
        setDestinationAirports(
          Array.isArray(data?.airports) ? data.airports : []
        );
      })
      .catch(() => setDestinationAirports([]))
      .finally(() => setLoadingDestinationAirports(false));
  }, [destinationCountryCode, setValue]);

  // Handle form submission
  const onFormSubmit = (data: FlightSearchFormData) => {
    const searchParams: FlightSearchParams = {
      origin: data.origin,
      destination: data.destination,
      departureDate: data.departureDate,
      returnDate: data.returnDate || undefined,
      adults: data.adults,
      children: data.children > 0 ? data.children : undefined,
      infants: data.infants > 0 ? data.infants : undefined,
    };
    onSubmit(searchParams);
  };

  // Get today's date in YYYY-MM-DD format for min date attribute
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get minimum return date (departure date or today)
  const getMinReturnDate = () => {
    if (departureDate) {
      return departureDate;
    }
    return getTodayDate();
  };

  // Generate number options for passenger selects
  const generateNumberOptions = (max: number) => {
    return Array.from({ length: max + 1 }, (_, i) => i);
  };

  // Radix Select treats value "0" as empty; use prefixed values for children/infants (default 0)
  const paxVal = (n: number) => `pax-${n}`;
  const paxNum = (v: string) => parseInt(v.replace(/^pax-/, ""), 10);

  return (
    <div className="flight-search-form-dark rounded-xl overflow-hidden [color-scheme:dark]">
      <style>{`
        .flight-search-form-dark {
          background-color: #0a0a0a !important;
          color: #fafafa !important;
        }
        .flight-search-form-dark form {
          background-color: #171717 !important;
          color: #fafafa !important;
          border-color: #404040 !important;
        }
        .flight-search-form-dark label,
        .flight-search-form-dark .text-muted-foreground {
          color: #a3a3a3 !important;
        }
        .flight-search-form-dark input,
        .flight-search-form-dark button:not([type="submit"]) {
          background-color: #323232 !important;
          color: #fafafa !important;
          border-color: #404040 !important;
        }
        .flight-search-form-dark input::placeholder {
          color: #737373 !important;
        }
        .flight-search-form-dark button[type="submit"] {
          background-color: #fafafa !important;
          color: #0a0a0a !important;
        }
        .flight-search-form-dark button[type="submit"]:hover {
          background-color: #e5e5e5 !important;
        }
      `}</style>
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="w-full space-y-6 rounded-lg border p-6 shadow-sm"
      >
        <div className="space-y-4">
          {/* Origin: Country → Airport */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                From
              </Label>
              <div className="grid gap-2 grid-cols-2">
                <Select
                  value={originCountryCode || undefined}
                  onValueChange={(value) => {
                    setOriginCountryCode(value);
                    setValue("origin", "");
                  }}
                >
                  <SelectTrigger
                    id="origin-country"
                    className="col-span-1"
                  >
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem
                        key={c.code}
                        value={c.code}
                      >
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  key={originCountryCode || "origin-no-country"}
                  value={origin || undefined}
                  onValueChange={(value) => {
                    setValue("origin", value);
                    trigger("origin");
                  }}
                  disabled={!originCountryCode || loadingOriginAirports}
                >
                  <SelectTrigger
                    id="origin"
                    className={`col-span-1 ${
                      errors.origin ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue
                      placeholder={
                        loadingOriginAirports ? "Loading…" : "Airport"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {!loadingOriginAirports && originAirports.length === 0 ? (
                      <SelectItem
                        value={NO_AIRPORTS_PLACEHOLDER}
                        disabled
                      >
                        No available airport at the moment
                      </SelectItem>
                    ) : (
                      originAirports.map((a) => (
                        <SelectItem
                          key={a.iataCode}
                          value={a.iataCode}
                        >
                          {a.iataCode} – {a.name}
                          {a.cityName ? ` (${a.cityName})` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {errors.origin && (
                <p className="text-sm text-destructive">
                  {errors.origin.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Plane className="h-4 w-4 rotate-90" />
                To
              </Label>
              <div className="grid gap-2 grid-cols-2">
                <Select
                  value={destinationCountryCode || undefined}
                  onValueChange={(value) => {
                    setDestinationCountryCode(value);
                    setValue("destination", "");
                  }}
                >
                  <SelectTrigger
                    id="destination-country"
                    className="col-span-1"
                  >
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem
                        key={c.code}
                        value={c.code}
                      >
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  key={destinationCountryCode || "destination-no-country"}
                  value={destination || undefined}
                  onValueChange={(value) => {
                    setValue("destination", value);
                    trigger("destination");
                  }}
                  disabled={
                    !destinationCountryCode || loadingDestinationAirports
                  }
                >
                  <SelectTrigger
                    id="destination"
                    className={`col-span-1 ${
                      errors.destination ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue
                      placeholder={
                        loadingDestinationAirports ? "Loading…" : "Airport"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {!loadingDestinationAirports &&
                    destinationAirports.length === 0 ? (
                      <SelectItem
                        value={NO_AIRPORTS_PLACEHOLDER}
                        disabled
                      >
                        No available airport at the moment
                      </SelectItem>
                    ) : (
                      destinationAirports.map((a) => (
                        <SelectItem
                          key={a.iataCode}
                          value={a.iataCode}
                        >
                          {a.iataCode} – {a.name}
                          {a.cityName ? ` (${a.cityName})` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {errors.destination && (
                <p className="text-sm text-destructive">
                  {errors.destination.message}
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="departureDate"
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Departure Date
              </Label>
              <Input
                id="departureDate"
                type="date"
                min={getTodayDate()}
                className={errors.departureDate ? "border-destructive" : ""}
                {...register("departureDate", {
                  onChange: () => {
                    // Re-validate return date when departure date changes
                    if (returnDate) {
                      trigger("returnDate");
                    }
                  },
                })}
              />
              {errors.departureDate && (
                <p className="text-sm text-destructive">
                  {errors.departureDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="returnDate"
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Return Date (Optional)
              </Label>
              <Input
                id="returnDate"
                type="date"
                min={getMinReturnDate()}
                className={errors.returnDate ? "border-destructive" : ""}
                {...register("returnDate")}
              />
              {errors.returnDate && (
                <p className="text-sm text-destructive">
                  {errors.returnDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Passengers */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Passengers
            </Label>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label
                  htmlFor="adults"
                  className="text-xs text-muted-foreground"
                >
                  Adults
                </Label>
                <Select
                  value={watch("adults").toString()}
                  onValueChange={(value) => {
                    setValue("adults", parseInt(value, 10));
                    trigger("adults");
                  }}
                >
                  <SelectTrigger
                    id="adults"
                    className={errors.adults ? "border-destructive" : ""}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {generateNumberOptions(9).map((num) => (
                      <SelectItem
                        key={num}
                        value={num.toString()}
                      >
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.adults && (
                  <p className="text-sm text-destructive">
                    {errors.adults.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="children"
                  className="text-xs text-muted-foreground"
                >
                  Children (Age 2-11)
                </Label>
                <Select
                  value={paxVal(watch("children") ?? 0)}
                  onValueChange={(value) => {
                    setValue("children", paxNum(value));
                    trigger("children");
                  }}
                >
                  <SelectTrigger
                    id="children"
                    className={errors.children ? "border-destructive" : ""}
                  >
                    <span className="line-clamp-1">
                      {watch("children") ?? 0}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {generateNumberOptions(9).map((num) => (
                      <SelectItem
                        key={num}
                        value={paxVal(num)}
                      >
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.children && (
                  <p className="text-sm text-destructive">
                    {errors.children.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="infants"
                  className="text-xs text-muted-foreground"
                >
                  Infants (Age under 2)
                </Label>
                <Select
                  value={paxVal(watch("infants") ?? 0)}
                  onValueChange={(value) => {
                    setValue("infants", paxNum(value));
                    trigger("infants");
                  }}
                >
                  <SelectTrigger
                    id="infants"
                    className={errors.infants ? "border-destructive" : ""}
                  >
                    <span className="line-clamp-1">
                      {watch("infants") ?? 0}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {generateNumberOptions(9).map((num) => (
                      <SelectItem
                        key={num}
                        value={paxVal(num)}
                      >
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.infants && (
                  <p className="text-sm text-destructive">
                    {errors.infants.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : "Search Flights"}
        </Button>
      </form>
    </div>
  );
}
