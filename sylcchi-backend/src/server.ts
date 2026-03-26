import app from "./app";
import { envVars } from "./config/env";
import { startReservationExpiryScheduler } from "./modules/reservation/reservation.scheduler";

const PORT = envVars.PORT;

app.listen(PORT, () => {
  startReservationExpiryScheduler();
  console.log(`Server running on port ${PORT}`);
});
