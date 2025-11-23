import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BookingPageClient } from "./BookingPageClient";

/**
 * Public Booking Page
 *
 * Server component that fetches user and availability data,
 * then renders the client-side booking interface.
 *
 * @route /book/[userId]
 */

interface BookingPageProps {
  params: Promise<{ userId: string }>;
}

/**
 * Generate metadata for the booking page
 */
export async function generateMetadata({
  params,
}: BookingPageProps): Promise<Metadata> {
  const { userId } = await params;

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  if (!user) {
    return {
      title: "User Not Found | Astralis",
    };
  }

  return {
    title: `Book with ${user.name || "User"} | Astralis`,
    description: `Schedule a meeting with ${user.name || "a team member"} at Astralis.`,
  };
}

/**
 * Fetch user and availability data
 */
async function getUserWithAvailability(userId: string) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      isActive: true,
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      availabilityRules: {
        where: { isActive: true },
        select: {
          id: true,
          userId: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
          timezone: true,
          isActive: true,
        },
      },
    },
  });

  return user;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { userId } = await params;
  const user = await getUserWithAvailability(userId);

  // Return 404 if user not found
  if (!user) {
    notFound();
  }

  // Return 404 if user is inactive
  if (!user.isActive) {
    notFound();
  }

  // Transform availability rules to the expected format
  const availabilityRules = user.availabilityRules.map((rule) => ({
    id: rule.id,
    userId: rule.userId,
    dayOfWeek: rule.dayOfWeek,
    startTime: rule.startTime,
    endTime: rule.endTime,
    timezone: rule.timezone,
    isActive: rule.isActive,
  }));

  // Determine default timezone from availability rules or default to America/New_York
  const defaultTimezone =
    availabilityRules.length > 0
      ? availabilityRules[0].timezone
      : "America/New_York";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || "User"}
                  className="h-16 w-16 rounded-full object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-astralis-blue flex items-center justify-center">
                  <span className="text-xl font-semibold text-white">
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div>
              <h1 className="text-2xl font-bold text-astralis-navy">
                {user.name || "Book a Meeting"}
              </h1>
              {user.organization && (
                <p className="text-sm text-slate-500">{user.organization.name}</p>
              )}
              {user.bio && (
                <p className="mt-1 text-sm text-slate-600 max-w-md">{user.bio}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {availabilityRules.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="max-w-md mx-auto px-4">
              <svg
                className="mx-auto h-12 w-12 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No Availability Set
              </h2>
              <p className="mt-2 text-slate-600">
                This user has not set up their availability yet. Please check
                back later or contact them directly.
              </p>
            </div>
          </div>
        ) : (
          <BookingPageClient
            userId={user.id}
            userName={user.name || "User"}
            availabilityRules={availabilityRules}
            defaultTimezone={defaultTimezone}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">
            Powered by{" "}
            <a
              href="/"
              className="font-medium text-astralis-blue hover:underline"
            >
              Astralis
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
