import Link from "next/link";

export const metadata = {
  title: "Privacy & How It Works — MeetYourWhy",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-10">
        <Link
          href="/"
          className="font-serif text-base tracking-tight text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          MeetYourWhy
        </Link>

        <div className="space-y-3">
          <h1 className="text-3xl font-serif font-bold text-[var(--foreground)]">
            Privacy & How It Works
          </h1>
          <p className="text-[var(--muted)] text-sm">
            Last updated: November 21, 2026
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-semibold text-[var(--foreground)]">
            What this is
          </h2>
          <p className="text-[var(--foreground)]/80 leading-relaxed">
            MeetYourWhy is a free tool that helps you discover what drives you
            through a short AI conversation. It is not therapy, counseling, or a
            mental health service. It does not diagnose anything. The insights it
            offers are plausible interpretations based on what you share — not
            clinical assessments.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-semibold text-[var(--foreground)]">
            What we collect
          </h2>
          <ul className="space-y-3 text-[var(--foreground)]/80 leading-relaxed">
            <li className="flex gap-3">
              <span className="text-[var(--accent)] mt-1.5 shrink-0">&#8226;</span>
              <span>
                <strong>Your conversation.</strong> The text of your answers is
                sent to an AI to generate follow-up questions and your results.
                It is processed in memory and not permanently stored in a
                database.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--accent)] mt-1.5 shrink-0">&#8226;</span>
              <span>
                <strong>Voice recordings.</strong> If you use voice input, your
                audio is sent to a transcription service (OpenAI Whisper),
                converted to text, and immediately discarded. We do not store
                audio files.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--accent)] mt-1.5 shrink-0">&#8226;</span>
              <span>
                <strong>Your results.</strong> Your North Star, Hidden Thread,
                and Archetype are stored in your browser session only. If you
                choose to share them, a summary (not your full conversation) is
                saved to generate a share link.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--accent)] mt-1.5 shrink-0">&#8226;</span>
              <span>
                <strong>No account required.</strong> We don&apos;t ask for your
                name, email, or any personal information to use MeetYourWhy.
              </span>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-semibold text-[var(--foreground)]">
            What we never do
          </h2>
          <ul className="space-y-3 text-[var(--foreground)]/80 leading-relaxed">
            <li className="flex gap-3">
              <span className="text-[var(--accent)] mt-1.5 shrink-0">&#8226;</span>
              <span>
                Send your conversation, results, or interpretations to
                advertising platforms or analytics providers.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--accent)] mt-1.5 shrink-0">&#8226;</span>
              <span>
                Store your audio recordings. They are deleted immediately after
                transcription.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--accent)] mt-1.5 shrink-0">&#8226;</span>
              <span>
                Sell or share your personal data with anyone.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--accent)] mt-1.5 shrink-0">&#8226;</span>
              <span>
                Make anything public without your explicit approval.
              </span>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-semibold text-[var(--foreground)]">
            Who this is for
          </h2>
          <p className="text-[var(--foreground)]/80 leading-relaxed">
            MeetYourWhy is designed for adults (18+). If you are under 18, please
            do not use this tool.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-semibold text-[var(--foreground)]">
            If you need support
          </h2>
          <p className="text-[var(--foreground)]/80 leading-relaxed">
            This is not a crisis service. If you or someone you know is in
            distress, please reach out:
          </p>
          <div className="space-y-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="font-semibold text-[var(--foreground)]">
                988 Suicide &amp; Crisis Lifeline
              </p>
              <p className="text-sm text-[var(--muted)]">Call or text 988 (US)</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="font-semibold text-[var(--foreground)]">
                Crisis Text Line
              </p>
              <p className="text-sm text-[var(--muted)]">
                Text HOME to 741741 (US)
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="font-semibold text-[var(--foreground)]">
                International
              </p>
              <p className="text-sm text-[var(--muted)]">
                <a
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline"
                >
                  findahelpline.com
                </a>{" "}
                — Find support in your country
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-semibold text-[var(--foreground)]">
            Deleting your data
          </h2>
          <p className="text-[var(--foreground)]/80 leading-relaxed">
            Your conversation exists only in your browser while you are using it
            — closing or refreshing the page removes it. If you created a share
            link, you can revoke it at any time from the share screen. To request
            deletion of any shared data, contact us at the address below.
          </p>
        </section>

        <section className="space-y-4 pb-12">
          <h2 className="text-xl font-serif font-semibold text-[var(--foreground)]">
            Contact
          </h2>
          <p className="text-[var(--foreground)]/80 leading-relaxed">
            For questions, data deletion requests, or feedback:
          </p>
          <p className="text-[var(--accent)] font-medium">
            hello@meetyourwhy.com
          </p>
        </section>
      </div>
    </main>
  );
}
