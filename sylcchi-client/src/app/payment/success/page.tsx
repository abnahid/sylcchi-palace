import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{
    bookingId?: string;
    session_id?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { bookingId = "", session_id = "" } = await searchParams;
  const resolvedBookingId = bookingId || session_id;

  if (!resolvedBookingId) {
    redirect("/booking/confirmation");
  }

  redirect(
    `/booking/confirmation?bookingId=${encodeURIComponent(resolvedBookingId)}`,
  );
}
