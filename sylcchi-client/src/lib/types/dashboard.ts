import type { BookingData, BookingPaymentData } from "./booking";
import type { PrimaryRoom, PrimaryRoomImage, RoomType } from "./rooms";
import type { UserProfile } from "./user";

// ── Re-exports for dashboard convenience ──
export type { BookingData, BookingPaymentData } from "./booking";
export type { PrimaryRoom, PrimaryRoomImage, RoomType } from "./rooms";
export type { UserProfile } from "./user";

// ── User management (admin) ──
export interface AdminUserListResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    data: UserProfile[];
  };
}

export interface AdminUserResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export interface UpdateUserPayload {
  name?: string;
  role?: "CUSTOMER" | "MANAGER" | "ADMIN";
  phone?: string;
  image?: string;
}

// ── Room type management (admin) ──
export interface CreateRoomTypePayload {
  name: string;
}

export interface RoomTypeResponse {
  success: boolean;
  message: string;
  data: RoomType;
}

// ── Room management ──
export interface CreateRoomPayload {
  name: string;
  description: string;
  price: number;
  capacity: number;
  bedType: string;
  roomTypeId: string;
  facilities?: string[];
  rules?: string[];
  isAvailable?: boolean;
}

export interface UpdateRoomPayload {
  name?: string;
  description?: string;
  price?: number;
  capacity?: number;
  bedType?: string;
  roomTypeId?: string;
  facilities?: string[];
  rules?: string[];
  isAvailable?: boolean;
}

export interface RoomResponse {
  success: boolean;
  message: string;
  data: PrimaryRoom;
}

export interface RoomsListResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    data: PrimaryRoom[];
  };
}

// ── Room images ──
export interface RoomImagesResponse {
  success: boolean;
  message: string;
  data: PrimaryRoomImage[];
}

export interface AddRoomImagesByUrlPayload {
  urls: string[];
}

// ── Refund (admin) ──
export interface CompleteRefundPayload {
  bookingId: string;
}

export interface RefundResponse {
  success: boolean;
  message: string;
  data: BookingData;
}

// ── Check-in ──
export interface CheckinLookupPayload {
  bookingCode?: string;
  email?: string;
}

export interface CheckinLookupResult {
  bookingCode: string;
  guestName: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  bookingStatus: string;
  paymentStatus: string;
}

export interface CheckinLookupResponse {
  success: boolean;
  message: string;
  data: CheckinLookupResult;
}

export interface CheckinVerifyOtpPayload {
  bookingCode: string;
  otp: string;
}

export interface CheckinCompletePayload {
  bookingCode: string;
  notes?: string;
}

export interface CheckinCompleteResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    reservationId: string;
    roomId: string;
    checkinTime: string;
    status: string;
  };
}

// ── All bookings (admin) ──
export interface AllBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
}

export interface AdminBookingData extends BookingData {
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  checkin?: {
    id: string;
    checkinTime: string;
    checkoutTime: string | null;
    status: string;
  } | null;
}

export interface AllBookingsResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    data: AdminBookingData[];
  };
}

// ── Dashboard overview stats (derived from existing endpoints) ──
export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  totalBookings: number;
  recentBookings: BookingData[];
  roomTypes: RoomType[];
}

// ── Sidebar navigation ──
export type UserRole = "CUSTOMER" | "MANAGER" | "ADMIN";

export interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
  badge?: string;
}
