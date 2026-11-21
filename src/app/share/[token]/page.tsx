import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";

export const instant = false;

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;

  const { data, error } = await supabase
    .from("shared_results")
    .select("north_star, hidden_thread_theme, archetype_name")
    .eq("share_token", token)
    .is("revoked_at", null)
    .single();

  if (error || !data) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-10 animate-fade-slide-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-sm tracking-[0.2em] uppercase text-[var(--muted)]">
            Someone shared their discovery
          </p>
        </div>

        {/* North Star */}
        <section className="space-y-3">
          <div className="w-8 h-0.5 bg-[var(--accent)]" />
          <p className="text-xs tracking-[0.15em] uppercase text-[var(--muted)]">
            Their North Star
          </p>
          <p className="text-2xl font-serif font-bold text-[var(--foreground)] leading-relaxed">
            {data.north_star}
          </p>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-[var(--border)]" />

        {/* Hidden Thread */}
        <section className="space-y-3">
          <p className="text-xs tracking-[0.15em] uppercase text-[var(--muted)]">
            Their Hidden Thread
          </p>
          <p className="text-lg font-serif italic text-[var(--foreground)] leading-relaxed">
            {data.hidden_thread_theme}
          </p>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-[var(--border)]" />

        {/* Archetype */}
        <section className="space-y-3">
          <p className="text-xs tracking-[0.15em] uppercase text-[var(--muted)]">
            Their Archetype
          </p>
          <p className="text-3xl font-serif font-bold text-[var(--foreground)]">
            {data.archetype_name}
          </p>
        </section>

        {/* CTA */}
        <div className="pt-6 space-y-4">
          <div className="w-8 h-0.5 bg-[var(--accent)]" />
          <p className="text-lg font-semibold text-[var(--foreground)]">
            Discover what makes you, you.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Start your discovery
          </Link>
        </div>
      </div>
    </main>
  );
}
