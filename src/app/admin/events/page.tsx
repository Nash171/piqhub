import { getEvents } from '@/lib/queries';
import { AdminEventsClient } from '@/components/admin/AdminEventsClient';

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <AdminEventsClient events={events} />
    </div>
  );
}
