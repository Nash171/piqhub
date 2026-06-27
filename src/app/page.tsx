import Link from 'next/link';
import { UserPlus, CalendarCheck, Coins, TrendingUp } from 'lucide-react';
import { getSession } from '@/lib/session';
import { Button } from '@/components/ui/Button';

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="relative isolate overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
        <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 opacity-30 blur-3xl">
          <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-400 via-indigo-400 to-slate-400" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-24 sm:py-32 lg:py-40 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-4 py-1.5 text-sm font-medium text-slate-600 backdrop-blur-sm mb-8">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          Prediction contests are live
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
          Predict, compete,
          <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 bg-clip-text text-transparent">
            win
          </span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
          Join prediction contests on PiqHub. Bet your coins, outsmart the competition, and climb
          to the top of the leaderboard.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {session.user ? (
            <Link href="/events">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Events
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Create Account
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { value: '1000', label: 'Starting coins per event' },
            { value: 'Live', label: 'Real-time leaderboards' },
            { value: 'Free', label: 'No entry fees' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm p-6"
            >
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              <div className="mt-1 text-sm font-medium text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Get started in four simple steps and turn your match predictions into leaderboard wins.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: UserPlus,
                title: 'Create your account',
                description: 'Sign up for free in seconds and you\'re ready to play.',
              },
              {
                icon: CalendarCheck,
                title: 'Join an event',
                description: 'Browse open prediction contests and register to compete.',
              },
              {
                icon: Coins,
                title: 'Place bets with coins',
                description: 'Every event gives you 1,000 starting coins to wager on the team you think will win.',
              },
              {
                icon: TrendingUp,
                title: 'Win & climb the leaderboard',
                description: 'If your pick wins, you get your wager back plus a proportional share of the losing bets.',
              },
            ].map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm p-6 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="mt-4 text-sm font-semibold text-blue-600">Step {index + 1}</div>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
