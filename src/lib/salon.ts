// Business details for the demo salon. Everything here is invented.

export const SALON = {
  name: "Velloway Hair Studio",
  shortName: "Velloway",
  // The salon's own time zone decides what "today" means for bookings.
  timeZone: "America/New_York",
  // How far ahead people can book, in days.
  bookingWindowDays: 60,
} as const;

export type Service = {
  id: string;
  name: string;
  description: string;
  price: string;
};

export const SERVICES: readonly Service[] = [
  {
    id: "cut",
    name: "Cut and finish",
    description: "Wash, cut and style, 60 minutes",
    price: "$55",
  },
  {
    id: "colour",
    name: "Colour",
    description: "Roots, full colour or highlights, from 90 minutes",
    price: "From $95",
  },
  {
    id: "blow-dry",
    name: "Blow-dry",
    description: "A smooth, long-lasting finish, 45 minutes",
    price: "$40",
  },
  {
    id: "treatment",
    name: "Treatment",
    description: "Repair mask for dry or coloured hair, 30 minutes",
    price: "$35",
  },
];

export const TIMES = [
  { id: "morning", label: "Morning (9:00 to 12:00)" },
  { id: "afternoon", label: "Afternoon (12:00 to 16:00)" },
  { id: "evening", label: "Evening (16:00 to 19:00, weekdays only)" },
] as const;

// Day numbers follow JavaScript: 0 is Sunday, 6 is Saturday.
export const OPEN_DAYS = [2, 3, 4, 5, 6] as const;

export const HOURS = [
  "Tuesday to Friday, 9:00 to 19:00",
  "Saturday, 9:00 to 16:00",
  "Sunday and Monday, closed",
] as const;
