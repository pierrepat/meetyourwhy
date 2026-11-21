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
            Discover what
            <br />
            <span className="text-accent">makes you, you</span>
          </h1>
          <p className="mt-6 text-lg text-muted leading-relaxed max-w-md mx-auto">
            A meaningful 15-minute conversation that uncovers your purpose,
            patterns, and direction — grounded in your own stories.
          </p>
          <Link
            href="/interview"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-foreground text-background px-8 py-3.5 text-base font-medium transition-opacity hover:opacity-85"
          >
            Discover My Why
          </Link>
          <p className="mt-4 text-sm text-muted">
            Free. Private. Answer by voice or typing.
          </p>
        </div>

        <div className="mt-24 max-w-2xl w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-center">
            <div>
              <div className="text-2xl mb-3">1</div>
              <h3 className="font-serif text-lg mb-1">Share your story</h3>
              <p className="text-sm text-muted leading-relaxed">
                Answer questions about moments that shaped you — by voice or
                typing. No right or wrong answers.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-3">2</div>
              <h3 className="font-serif text-lg mb-1">We listen deeply</h3>
              <p className="text-sm text-muted leading-relaxed">
                AI finds meaningful patterns in your experiences — recurring
                themes, hidden motivations, and personal strengths.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-3">3</div>
              <h3 className="font-serif text-lg mb-1">Meet your Why</h3>
              <p className="text-sm text-muted leading-relaxed">
                Get your North Star, your Hidden Thread, and a memorable
                archetype — all backed by your own words.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-xs text-muted space-y-1">
        <p>Your stories stay private. Nothing is shared without your permission.</p>
        <p>
          <Link
            href="/privacy"
            className="underline hover:text-foreground transition-colors"
          >
            Privacy & How It Works
          </Link>
        </p>
      </footer>
    </div>
  );
}
