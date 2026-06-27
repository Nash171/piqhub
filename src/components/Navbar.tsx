import Link from 'next/link';
import { Dices } from 'lucide-react';
import { getSession } from '@/lib/session';
import { logoutUser } from '@/lib/actions';

export async function Navbar() {
  const session = await getSession();
  const user = session.user;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Dices className="h-5 w-5" aria-hidden="true" />
              </span>
              PiqHub
            </Link>
            {user && (
              <div className="hidden md:flex items-center gap-1">
                <NavLink href="/events">Events</NavLink>
                {user.role === 'admin' && (
                  <>
                    <NavLink href="/admin/events">Admin Events</NavLink>
                    <NavLink href="/admin/matches">Admin Matches</NavLink>
                    <NavLink href="/admin/registrations">Registrations</NavLink>
                    <NavLink href="/admin/users">Users</NavLink>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="hidden sm:block text-sm font-semibold text-slate-900">{user.username}</span>
                <form action={logoutUser}>
                  <button
                    type="submit"
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    Logout
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}
