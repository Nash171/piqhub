import { getAllEventRegistrations } from '@/lib/queries';
import { updateRegistrationStatus } from '@/lib/actions';
import { ClientForm } from '@/components/ClientForm';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EventRegistrationStatus } from '@/types';

function registrationStatusBadgeVariant(status: EventRegistrationStatus) {
  switch (status) {
    case 'confirmed':
      return 'green';
    case 'pending':
      return 'yellow';
    case 'rejected':
      return 'red';
    case 'blocked':
      return 'slate';
    default:
      return 'gray';
  }
}

const statusOptions: EventRegistrationStatus[] = ['pending', 'confirmed', 'rejected', 'blocked'];

export default async function AdminRegistrationsPage() {
  const registrations = await getAllEventRegistrations();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin: Registrations</h1>
        <p className="mt-2 text-slate-600">Review and manage event registrations.</p>
      </div>

      <Card>
        <CardTitle className="mb-1">Registrations</CardTitle>
        <CardDescription className="mb-5">
          {registrations.length} total registration{registrations.length === 1 ? '' : 's'}.
        </CardDescription>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Event
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Coins
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {registrations.map((registration) => (
                <tr key={registration.id}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{registration.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{registration.event_name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{registration.username}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{registration.coins}</td>
                  <td className="px-4 py-3">
                    <Badge variant={registrationStatusBadgeVariant(registration.status)}>
                      {registration.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ClientForm action={updateRegistrationStatus} successMessage="Status updated">
                      <input type="hidden" name="registrationId" value={registration.id} />
                      <div className="flex items-center gap-2">
                        <select
                          name="status"
                          defaultValue={registration.status}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 transition-all hover:border-slate-300 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                        <Button type="submit" size="sm" variant="secondary">
                          Update
                        </Button>
                      </div>
                    </ClientForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
