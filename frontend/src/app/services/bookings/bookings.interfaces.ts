export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

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
