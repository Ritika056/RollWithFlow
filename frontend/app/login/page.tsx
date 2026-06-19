"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LoaderCircle, Radio } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(email, password);
    setLoading(false);
    if (!result.data) return setError("Login failed. Check your private account details.");
    document.cookie = `rwf_token=${encodeURIComponent(result.data.access_token)}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 14}`;
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center">
      <GlassCard className="music-sheen w-full p-7 md:p-9">
        <div className="grid size-12 place-items-center rounded-2xl border border-signal/30 bg-signal/10 text-signal shadow-[0_0_28px_rgba(88,240,209,0.14)]"><Radio size={22} /></div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-signal">Private workspace</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Welcome back</h1>
        <p className="mt-3 text-sm leading-6 text-white/60">Sign in to your private RollWithFlow music system.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-sm text-white/65"><span>Email</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-deck-950/58 px-4 text-white outline-none focus:border-signal/40" /></label>
          <label className="block text-sm text-white/65"><span>Password</span><input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-deck-950/58 px-4 text-white outline-none focus:border-signal/40" /></label>
          {error ? <p className="rounded-xl border border-cue/30 bg-cue/10 px-3 py-2 text-sm text-cue">{error}</p> : null}
          <ActionButton type="submit" variant="primary" className="w-full" disabled={loading}>{loading ? <LoaderCircle size={17} className="animate-spin" /> : <KeyRound size={17} />}{loading ? "Signing in" : "Sign in"}</ActionButton>
        </form>
      </GlassCard>
    </section>
  );
}
