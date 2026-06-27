import Link from 'next/link';
import { getPublicEvents } from '@/lib/queries';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EventStatus } from '@/types';

function eventStatusBadgeVariant(status: EventStatus) {
  switch (status) {
    case 'open':
      return 'green';
    case 'upcoming':
      return 'yellow';
    case 'locked':
      return 'blue';
    case 'completed':
      return 'gray';
    case 'hidden':
      return 'red';
    default:
      return 'gray';
  }
}

export default async function EventsPage() {
  const events = await getPublicEvents();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Events</h1>
        <p className="mt-2 text-slate-600">Browse prediction contests and view live leaderboards.</p>
      </div>

      {events.length === 0 ? (
        <Card>
          <p className="text-slate-600">No events available yet. Check back soon!</p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="group block">
              <Card className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:border-slate-300 group-hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="line-clamp-1">{event.name}</CardTitle>
                  <Badge variant={eventStatusBadgeVariant(event.status)}>{event.status}</Badge>
                </div>
                <CardDescription className="mt-3">
                  Click to view matches, place bets, and see the leaderboard.
                </CardDescription>
                <div className="mt-5 flex items-center text-sm font-semibold text-slate-900">
                  View event
                  <svg
                    className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
