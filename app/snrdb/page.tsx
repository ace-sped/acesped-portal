import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Calendar, MapPin, Mail, ArrowDown, Users } from 'lucide-react';
import Navbar from '../components/navbar/page';
import Footer from '../components/footer/page';
import { snrdbDisplay, snrdbBody, snrdbSerif } from './fonts';
import ViewBlueprintButton from './ViewBlueprintButton';

const STATES = [
  { name: 'Abia', accent: '#4CAF50' },
  { name: 'Anambra', accent: '#66BB6A' },
  { name: 'Ebonyi', accent: '#43A047' },
  { name: 'Enugu', accent: '#2E7D32' },
  { name: 'Imo', accent: '#81C784' },
] as const;

export const metadata = {
  title: 'Southeast Nigeria Regional Development Blueprint | ACE-SPED',
  description:
    'A comprehensive framework for integrated development of Southeast Nigeria (2026–2050). Synthesised from the Southeast Nigeria Regional Development Summit 2026.',
};

export default function SnrdbPage() {
  return (
    <div
      className={`${snrdbDisplay.variable} ${snrdbBody.variable} ${snrdbSerif.variable} snrdb-page min-h-screen`}
      style={
        {
          '--snrdb-forest': '#1B5E20',
          '--snrdb-deep': '#145218',
          '--snrdb-leaf': '#2E7D32',
          '--snrdb-mist': '#E8F5E9',
          '--snrdb-lime': '#C8E6C9',
          '--snrdb-gold': '#DCE775',
          fontFamily: 'var(--font-snrdb-body), system-ui, sans-serif',
        } as CSSProperties
      }
    >
      <style>{`
        @keyframes snrdb-rise {
          from { opacity: 0; transform: translateY(1.25rem); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes snrdb-fade-scale {
          from { opacity: 0; transform: translateY(1.5rem) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .snrdb-rise { animation: snrdb-rise 0.9s ease-out both; }
        .snrdb-map { animation: snrdb-fade-scale 1.1s ease-out 0.15s both; }
        .snrdb-state { animation: snrdb-rise 0.7s ease-out both; }
      `}</style>

      <div className="flex h-svh max-h-svh flex-col overflow-hidden">
        <Navbar />

        {/* Hero fills remaining viewport under navbar; CTAs stay in view */}
        <section className="relative min-h-0 flex-1 overflow-hidden bg-(--snrdb-mist)">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 18% 22%, rgba(129, 199, 132, 0.55) 0%, transparent 42%),
                radial-gradient(circle at 78% 18%, rgba(200, 230, 201, 0.9) 0%, transparent 38%),
                radial-gradient(circle at 62% 72%, rgba(165, 214, 167, 0.45) 0%, transparent 40%),
                radial-gradient(circle at 30% 80%, rgba(102, 187, 106, 0.35) 0%, transparent 36%),
                linear-gradient(180deg, #f1f8e9 0%, #e8f5e9 45%, #c8e6c9 100%)
              `,
            }}
          />

          <div className="page-shell relative z-10 flex h-full min-h-0 flex-col py-4 sm:py-6 lg:py-8">
            <div className="grid min-h-0 h-full items-center gap-5 lg:grid-cols-[1fr_1fr] lg:items-stretch lg:gap-6">
              <div className="snrdb-rise flex min-h-0 flex-col justify-center">
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-(--snrdb-leaf) sm:text-sm"
                  style={{ fontFamily: 'var(--font-snrdb-display), sans-serif' }}
                >
                  SNRDB · ACE-SPED × ATDIN
                </p>

                <h1
                  className="text-[clamp(2.1rem,6.5vw,4.5rem)] leading-[0.92] font-extrabold tracking-tight text-(--snrdb-forest)"
                  style={{ fontFamily: 'var(--font-snrdb-display), sans-serif' }}
                >
                  SOUTHEAST
                  <br />
                  NIGERIA
                </h1>

                <p
                  className="mt-2 text-[clamp(0.9rem,1.8vw,1.35rem)] font-semibold tracking-[0.08em] text-stone-600 uppercase"
                  style={{ fontFamily: 'var(--font-snrdb-display), sans-serif' }}
                >
                  Regional Development Blueprint
                </p>

                <div className="mt-3 inline-flex w-fit items-center bg-(--snrdb-forest) px-4 py-2 text-sm font-bold tracking-widest text-white shadow-lg shadow-green-900/20 sm:text-base">
                  2026 – 2050
                </div>

                <p
                  className="mt-3 max-w-xl text-sm leading-snug text-stone-700 sm:text-base md:text-lg"
                  style={{ fontFamily: 'var(--font-snrdb-serif), serif', fontStyle: 'italic' }}
                >
                  A comprehensive framework for the integrated development of
                  Abia, Anambra, Ebonyi, Enugu and Imo.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-6">
                  <a
                    href="#organisers"
                    className="inline-flex items-center gap-2 bg-(--snrdb-forest) px-5 py-2.5 text-sm font-semibold tracking-wide text-white transition hover:bg-(--snrdb-deep)"
                  >
                    Meet the organisers
                    <ArrowDown className="h-4 w-4" />
                  </a>
                  <ViewBlueprintButton />
                </div>
              </div>

              <div className="snrdb-map relative hidden min-h-0 h-full w-full lg:flex lg:items-center lg:justify-center">
                <div className="relative h-[clamp(500px,100%,600px)] w-full">
                  <Image
                    src="/images/snrdb/cover.png"
                    alt="Southeast Nigeria Regional Development Blueprint cover"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    priority
                    quality={90}
                    className="object-contain object-center drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-(--snrdb-forest)/35 to-transparent" />
        </section>
      </div>

      <div className="bg-(--snrdb-forest) py-4 text-center">
        <p
          className="text-xl font-bold tracking-[0.35em] text-white md:text-2xl"
          style={{ fontFamily: 'var(--font-snrdb-display), sans-serif' }}
        >
          2026 – 2050
        </p>
      </div>

      <section className="bg-(--snrdb-forest) text-white">
        <div className="page-shell py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-8 h-px w-24 bg-white/40" />
            <p
              className="text-xl leading-relaxed text-white/95 md:text-2xl"
              style={{ fontFamily: 'var(--font-snrdb-serif), serif', fontStyle: 'italic' }}
            >
              A Comprehensive Framework for Integrated Development of Southeast Nigeria
            </p>
            <p
              className="mt-4 text-base text-(--snrdb-gold) md:text-lg"
              style={{ fontFamily: 'var(--font-snrdb-serif), serif', fontStyle: 'italic' }}
            >
              Abia | Anambra | Ebonyi | Enugu | Imo
            </p>
            <div className="mx-auto mt-8 h-px w-24 bg-white/40" />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="page-shell">
          <div className="mb-10 max-w-2xl">
            <h2
              className="text-3xl font-bold tracking-tight text-(--snrdb-forest) md:text-4xl"
              style={{ fontFamily: 'var(--font-snrdb-display), sans-serif' }}
            >
              The Five States
            </h2>
            <p className="mt-3 text-lg text-stone-600">
              One regional blueprint spanning the Southeast geopolitical zone.
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-5">
            {STATES.map((state, index) => (
              <li
                key={state.name}
                className="snrdb-state border-t-2 pt-4"
                style={{
                  borderColor: state.accent,
                  animationDelay: `${0.2 + index * 0.08}s`,
                }}
              >
                <span
                  className="block text-2xl font-bold tracking-wide text-(--snrdb-forest) md:text-3xl"
                  style={{ fontFamily: 'var(--font-snrdb-display), sans-serif' }}
                >
                  {state.name.toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="summit" className="scroll-mt-24 bg-(--snrdb-mist) py-16 md:py-20">
        <div className="page-shell">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h2
                className="text-3xl font-bold tracking-tight text-(--snrdb-forest) md:text-4xl"
                style={{ fontFamily: 'var(--font-snrdb-display), sans-serif' }}
              >
                From the Summit
              </h2>
              <p className="mt-3 text-lg text-stone-600">
                Synthesised from the Southeast Nigeria Regional Development Summit 2026.
              </p>
            </div>

            <div className="space-y-6 border-l-2 border-(--snrdb-leaf) pl-6 md:pl-8">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-(--snrdb-leaf)" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-(--snrdb-leaf)">
                    Venue
                  </p>
                  <p className="mt-1 text-lg text-stone-800">
                    ACE-SPED Conference Hall, University of Nigeria, Nsukka
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-1 h-5 w-5 shrink-0 text-(--snrdb-leaf)" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-(--snrdb-leaf)">
                    Date
                  </p>
                  <p className="mt-1 text-2xl font-bold text-(--snrdb-forest)">
                    20 May 2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="organisers" className="scroll-mt-24 bg-(--snrdb-deep) py-16 text-white md:py-20">
        <div className="page-shell">
          <div className="mb-12 flex items-center gap-3">
            <Users className="h-6 w-6 text-(--snrdb-gold)" />
            <h2
              className="text-sm font-bold tracking-[0.3em] text-(--snrdb-gold) uppercase"
              style={{ fontFamily: 'var(--font-snrdb-display), sans-serif' }}
            >
              Organised by
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-[1fr_auto_1fr] md:items-stretch md:gap-8">
            <Organiser
              name="Professor Emenike Ejiogu"
              role="Director, Africa Centre of Excellence for Sustainable Power and Energy Development (ACE-SPED), UNN"
              email="emenike.ejiogu@unn.edu.ng"
            />

            <div className="hidden items-center justify-center md:flex">
              <div className="flex h-full flex-col items-center">
                <div className="w-px flex-1 bg-white/25" />
                <span
                  className="my-3 text-xs font-bold tracking-[0.25em] text-white/70"
                  style={{ fontFamily: 'var(--font-snrdb-display), sans-serif' }}
                >
                  AND
                </span>
                <div className="w-px flex-1 bg-white/25" />
              </div>
            </div>

            <div className="border-t border-white/20 pt-8 md:hidden">
              <p className="mb-6 text-center text-xs font-bold tracking-[0.25em] text-white/70">
                AND
              </p>
            </div>

            <Organiser
              name="Professor Pat Uche Okpoko"
              role="President, Association for Tourism Development in Nigeria (ATDIN), UNN"
              email="patrick.okpoko@unn.edu.ng"
            />
          </div>
        </div>
      </section>

      <section className="bg-(--snrdb-forest) py-14">
        <div className="page-shell text-center">
          <p
            className="text-xl text-(--snrdb-gold) md:text-2xl"
            style={{ fontFamily: 'var(--font-snrdb-serif), serif', fontStyle: 'italic' }}
          >
            Building a Prosperous, Secure and Unified Southeast
          </p>
          <Link
            href="/"
            className="mt-8 inline-block text-sm font-semibold tracking-wide text-white/70 underline-offset-4 transition hover:text-white hover:underline"
          >
            Back to ACE-SPED
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Organiser({
  name,
  role,
  email,
}: {
  name: string;
  role: string;
  email: string;
}) {
  return (
    <div>
      <h3
        className="text-2xl font-bold tracking-tight md:text-3xl"
        style={{ fontFamily: 'var(--font-snrdb-display), sans-serif' }}
      >
        {name}
      </h3>
      <p className="mt-3 max-w-md text-base leading-relaxed text-white/80">{role}</p>
      <a
        href={`mailto:${email}`}
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-(--snrdb-gold) transition hover:text-white"
      >
        <Mail className="h-4 w-4" />
        {email}
      </a>
    </div>
  );
}

