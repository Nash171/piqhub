import { getEvents, getMatchesByEvent } from '@/lib/queries';
import { AdminMatchesClient } from '@/components/admin/AdminMatchesClient';

export default async function AdminMatchesPage() {
  const events = await getEvents();
  const matchesByEvent = await Promise.all(
    events.map(async (event) => ({
      event,
      matches: await getMatchesByEvent(event.id),
    }))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <AdminMatchesClient events={events} matchesByEvent={matchesByEvent} />
    </div>
  );
}
