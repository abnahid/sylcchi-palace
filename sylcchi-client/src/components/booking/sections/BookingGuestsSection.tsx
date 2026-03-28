import { User } from "lucide-react";

type GuestForm = {
  name: string;
  email: string;
  phone: string;
};

type BookingGuestsSectionProps = {
  guests: GuestForm[];
  errors: string[];
  onChange: (index: number, field: keyof GuestForm, value: string) => void;
};

export default function BookingGuestsSection({
  guests,
  errors,
  onChange,
}: BookingGuestsSectionProps) {
  return (
    <section className="rounded-2xl border border-[#dbe5ef] bg-white p-5 sm:p-6">
      <h2 className="font-mulish text-xl font-extrabold text-[#101b25]">
        Guest information
      </h2>

      <div className="mt-4 space-y-4">
        {guests.map((guest, index) => (
          <div
            key={`guest-${index}`}
            className="rounded-xl border border-[#dbe5ef] p-4"
          >
            <div className="mb-3 flex items-center gap-2 font-mulish text-sm font-bold text-[#101b25]">
              <User className="h-4 w-4 text-primary" /> Guest {index + 1}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                type="text"
                value={guest.name}
                onChange={(event) =>
                  onChange(index, "name", event.target.value)
                }
                placeholder="Full name"
                className="rounded-md border border-[#cfd9e3] px-3 py-2 font-open-sans text-sm outline-none focus:border-primary"
              />
              <input
                type="email"
                value={guest.email}
                onChange={(event) =>
                  onChange(index, "email", event.target.value)
                }
                placeholder="Email"
                className="rounded-md border border-[#cfd9e3] px-3 py-2 font-open-sans text-sm outline-none focus:border-primary"
              />
              <input
                type="tel"
                value={guest.phone}
                onChange={(event) =>
                  onChange(index, "phone", event.target.value)
                }
                placeholder="Phone"
                className="rounded-md border border-[#cfd9e3] px-3 py-2 font-open-sans text-sm outline-none focus:border-primary"
              />
            </div>

            {errors[index] ? (
              <p className="mt-2 font-open-sans text-xs text-red-600">
                {errors[index]}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
