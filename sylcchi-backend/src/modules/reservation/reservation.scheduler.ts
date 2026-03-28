import { ReservationService } from "./reservation.service";

const EXPIRY_SWEEP_INTERVAL_MS = 60 * 1000;

let expirySweepTimer: NodeJS.Timeout | null = null;
let expirySweepInProgress = false;

export function startReservationExpiryScheduler(): void {
  if (expirySweepTimer) {
    return;
  }

  expirySweepTimer = setInterval(async () => {
    if (expirySweepInProgress) {
      return;
    }

    expirySweepInProgress = true;
    try {
      await ReservationService.cancelExpiredBookings();
    } catch (error) {
      console.error("Reservation expiry sweep failed", error);
    } finally {
      expirySweepInProgress = false;
    }
  }, EXPIRY_SWEEP_INTERVAL_MS);

  if (typeof expirySweepTimer.unref === "function") {
    expirySweepTimer.unref();
  }
}
