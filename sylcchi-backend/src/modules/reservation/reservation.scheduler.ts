import { ReservationService } from "./reservation.service";

const EXPIRY_SWEEP_INTERVAL_MS = 60 * 1000;

let expirySweepTimer: NodeJS.Timeout | null = null;

export function startReservationExpiryScheduler(): void {
  if (expirySweepTimer) {
    return;
  }

  expirySweepTimer = setInterval(async () => {
    try {
      await ReservationService.cancelExpiredBookings();
    } catch (error) {
      console.error("Reservation expiry sweep failed", error);
    }
  }, EXPIRY_SWEEP_INTERVAL_MS);

  if (typeof expirySweepTimer.unref === "function") {
    expirySweepTimer.unref();
  }
}
