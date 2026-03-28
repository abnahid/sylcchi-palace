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

  const target = resolvedBookingId
    ? `/payment/fail?bookingId=${encodeURIComponent(resolvedBookingId)}`
    : "/payment/fail";

  redirect(target);
}
