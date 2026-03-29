export type BookingGuestInput = {
  name: string;
  email: string;
  phone: string;
};

export type CreateBookingPayload = {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  guestDetails: BookingGuestInput[];
  paymentMethod: "stripe" | "sslcommerz" | "pay_later";
};

export type PayBookingPayload = {
  bookingId: string;
  paymentMethod?: "stripe" | "sslcommerz";
  action?: "initiate" | "confirm" | "callback";
  gatewayStatus?: "success" | "failed" | "cancel";
  transactionId?: string;
};

export type BookingResponse<T = unknown> = {
  success: boolean;
  message: string;
  data: T;
};

export type BookingPaymentResult = {
  status?: string;
  gateway?: string;
  checkoutUrl?: string;
  redirectUrl?: string;
  checkoutSessionId?: string;
  transactionId?: string;
};

export type CancelBookingPayload = {
  bookingId: string;
  reason?: string;
};

export type BookingPaymentData = {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentType: string;
  status: string;
  refundStatus: string;
  refundAmount: number | null;
  transactionId: string | null;
};

export type BookingData = {
  id: string;
  bookingCode: string;
  roomId: string;
  room?: {
    id: string;
    name: string;
    images?: { imageUrl: string }[];
  };
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  guestDetails: BookingGuestInput[];
  nights: number;
  basePrice: number;
  subtotal: number;
  vat: number;
  totalPrice: number;
  depositRate: number;
  depositAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  bookingStatus: string;
  payment?: BookingPaymentData;
  checkin?: {
    id: string;
    status: string;
    checkinTime: string | null;
    checkoutTime: string | null;
  } | null;
  expiresAt?: string | null;
};
