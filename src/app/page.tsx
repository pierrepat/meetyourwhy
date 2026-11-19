import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      <header className="w-full px-6 py-5">
        <span className="font-serif text-lg tracking-tight">MeetYourWhy</span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
        <div className="max-w-xl text-center">
          <h1 className="font-serif text-4xl sm:text-5xl leading-tight tracking-tight">
            Discover your
            <br />
            <span className="text-accent">North Star</span>
          </h1>
          <p className="mt-6 text-lg text-muted leading-relaxed max-w-md mx-auto">
            A thoughtful 15-minute conversation that helps you find your
            purpose, strengths, and direction — grounded in your own story.
          </p>
          <Link
            href="/interview"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-foreground text-background px-8 py-3.5 text-base font-medium transition-opacity hover:opacity-85"
          >
            Find your Why
          </Link>
          <p className="mt-4 text-sm text-muted">Free. Private. No sign-up needed.</p>
        </div>

        <div className="mt-24 max-w-2xl w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-center">
            <div>
              <div className="text-2xl mb-3">1</div>
              <h3 className="font-serif text-lg mb-1">Share your story</h3>
              <p className="text-sm text-muted leading-relaxed">
                Answer questions about moments that shaped you — no right or
                wrong answers.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-3">2</div>
              <h3 className="font-serif text-lg mb-1">We listen deeply</h3>
              <p className="text-sm text-muted leading-relaxed">
                AI maps your personality, strengths, values, and motivations
                across proven frameworks.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-3">3</div>
              <h3 className="font-serif text-lg mb-1">Meet your Why</h3>
              <p className="text-sm text-muted leading-relaxed">
                Get your North Star, Ikigai map, personality profile, and a
                30-day action plan.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-xs text-muted">
        Your answers stay private and are never shared.
      </footer>
    </div>
  );
}
