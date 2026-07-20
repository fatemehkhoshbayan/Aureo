export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

/** Payload for POST /bookings */
export interface BookingCreate {
  photographerId: string;
  packageId: string;
  scheduledAt: string;
  notes?: string | null;
  /** Used for booking emails when different from the account email */
  contactEmail?: string | null;
}

/** Shape returned by GET /bookings */
export interface ApiBooking {
  id: string;
  userId: number;
  photographerId: string;
  packageId: string;
  packageName: string;
  price: number;
  duration: string;
  scheduledAt: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: string;
}

/** UI model used by My Bookings components */
export interface Booking {
  id: string;
  photographerId: string;
  photographerName: string;
  photographerAvatar: string;
  service: string;
  date: string;
  time: string;
  total: number;
  status: BookingStatus;
  reference: string;
  bookedOn: string;
}
