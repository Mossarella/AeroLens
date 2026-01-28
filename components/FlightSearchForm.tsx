'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FlightSearchParams } from '@/interfaces/flight'
import { Calendar, Plane, Users } from 'lucide-react'

// Zod schema for form validation
const flightSearchSchema = z
  .object({
    origin: z
      .string()
      .min(3, 'Origin must be at least 3 characters')
      .max(3, 'Origin must be a 3-letter airport code')
      .regex(/^[A-Z]{3}$/i, 'Origin must be a valid 3-letter airport code (e.g., JFK)')
      .transform((val) => val.toUpperCase()),
    destination: z
      .string()
      .min(3, 'Destination must be at least 3 characters')
      .max(3, 'Destination must be a 3-letter airport code')
      .regex(/^[A-Z]{3}$/i, 'Destination must be a valid 3-letter airport code (e.g., LAX)')
      .transform((val) => val.toUpperCase()),
    departureDate: z
      .string()
      .min(1, 'Departure date is required')
      .refine(
        (date) => {
          const selectedDate = new Date(date)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return selectedDate >= today
        },
        {
          message: 'Departure date must be today or in the future',
        }
      ),
    returnDate: z.string().optional(),
    adults: z
      .number()
      .int('Adults must be a whole number')
      .min(1, 'At least 1 adult is required')
      .max(9, 'Maximum 9 adults allowed'),
    children: z
      .number()
      .int('Children must be a whole number')
      .min(0, 'Children cannot be negative')
      .max(9, 'Maximum 9 children allowed'),
    infants: z
      .number()
      .int('Infants must be a whole number')
      .min(0, 'Infants cannot be negative')
      .max(9, 'Maximum 9 infants allowed'),
  })
  .refine(
    (data) => {
      if (!data.returnDate) return true // Optional field
      const returnDate = new Date(data.returnDate)
      const departureDate = new Date(data.departureDate)
      return returnDate >= departureDate
    },
    {
      message: 'Return date must be on or after departure date',
      path: ['returnDate'], // This will attach the error to the returnDate field
    }
  )
  .refine(
    (data) => {
      return data.origin !== data.destination
    },
    {
      message: 'Origin and destination must be different',
      path: ['destination'],
    }
  )

type FlightSearchFormData = z.infer<typeof flightSearchSchema>

interface FlightSearchFormProps {
  onSubmit: (data: FlightSearchParams) => void
  isLoading?: boolean
}

export function FlightSearchForm({ onSubmit, isLoading = false }: FlightSearchFormProps) {
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
      origin: '',
      destination: '',
      departureDate: '',
      returnDate: '',
      adults: 1,
      children: 0,
      infants: 0,
    },
  })

  const returnDate = watch('returnDate')
  const departureDate = watch('departureDate')

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
    }
    onSubmit(searchParams)
  }

  // Get today's date in YYYY-MM-DD format for min date attribute
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Get minimum return date (departure date or today)
  const getMinReturnDate = () => {
    if (departureDate) {
      return departureDate
    }
    return getTodayDate()
  }

  // Generate number options for passenger selects
  const generateNumberOptions = (max: number) => {
    return Array.from({ length: max + 1 }, (_, i) => i)
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="w-full space-y-6 rounded-lg border bg-card p-6 shadow-sm"
    >
      <div className="space-y-4">
        {/* Origin and Destination */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="origin" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              From
            </Label>
            <Input
              id="origin"
              placeholder="JFK"
              maxLength={3}
              className={errors.origin ? 'border-destructive' : ''}
              {...register('origin')}
            />
            {errors.origin && (
              <p className="text-sm text-destructive">{errors.origin.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2">
              <Plane className="h-4 w-4 rotate-90" />
              To
            </Label>
            <Input
              id="destination"
              placeholder="LAX"
              maxLength={3}
              className={errors.destination ? 'border-destructive' : ''}
              {...register('destination')}
            />
            {errors.destination && (
              <p className="text-sm text-destructive">{errors.destination.message}</p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="departureDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Departure Date
            </Label>
            <Input
              id="departureDate"
              type="date"
              min={getTodayDate()}
              className={errors.departureDate ? 'border-destructive' : ''}
              {...register('departureDate', {
                onChange: () => {
                  // Re-validate return date when departure date changes
                  if (returnDate) {
                    trigger('returnDate')
                  }
                },
              })}
            />
            {errors.departureDate && (
              <p className="text-sm text-destructive">{errors.departureDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="returnDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Return Date (Optional)
            </Label>
            <Input
              id="returnDate"
              type="date"
              min={getMinReturnDate()}
              className={errors.returnDate ? 'border-destructive' : ''}
              {...register('returnDate')}
            />
            {errors.returnDate && (
              <p className="text-sm text-destructive">{errors.returnDate.message}</p>
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
              <Label htmlFor="adults" className="text-xs text-muted-foreground">
                Adults
              </Label>
              <Select
                value={watch('adults').toString()}
                onValueChange={(value) => {
                  setValue('adults', parseInt(value, 10))
                  trigger('adults')
                }}
              >
                <SelectTrigger
                  id="adults"
                  className={errors.adults ? 'border-destructive' : ''}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {generateNumberOptions(9).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.adults && (
                <p className="text-sm text-destructive">{errors.adults.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="children" className="text-xs text-muted-foreground">
                Children (2-11)
              </Label>
              <Select
                value={watch('children').toString()}
                onValueChange={(value) => {
                  setValue('children', parseInt(value, 10))
                  trigger('children')
                }}
              >
                <SelectTrigger
                  id="children"
                  className={errors.children ? 'border-destructive' : ''}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {generateNumberOptions(9).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.children && (
                <p className="text-sm text-destructive">{errors.children.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="infants" className="text-xs text-muted-foreground">
                Infants (under 2)
              </Label>
              <Select
                value={watch('infants').toString()}
                onValueChange={(value) => {
                  setValue('infants', parseInt(value, 10))
                  trigger('infants')
                }}
              >
                <SelectTrigger
                  id="infants"
                  className={errors.infants ? 'border-destructive' : ''}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {generateNumberOptions(9).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.infants && (
                <p className="text-sm text-destructive">{errors.infants.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Searching...' : 'Search Flights'}
      </Button>
    </form>
  )
}
