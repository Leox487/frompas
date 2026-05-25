"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [passion, setPassion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = passion.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passion: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }

      sessionStorage.setItem("frompas_result", JSON.stringify(data));
      router.push("/results");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="landing">
      <h1 className="landing-headline">
        What if your passion could be a business?
      </h1>
      <p className="landing-sub">
        Type what you love. We&apos;ll search the web and show you real people
        who turned that exact passion into a real business — with names, models,
        and revenue.
      </p>

      <form className="landing-form" onSubmit={onSubmit}>
        <input
          type="text"
          className="landing-input"
          placeholder="What's your passion?"
          value={passion}
          onChange={(e) => setPassion(e.target.value)}
          required
          autoFocus
        />
        <button
          type="submit"
          className="btn btn-primary btn-large"
          disabled={loading || !passion.trim()}
        >
          {loading ? "Searching…" : "Find paths"}
        </button>
      </form>

      {error ? <p className="landing-note" style={{ color: "#dc2626" }}>{error}</p> : null}

      <p className="landing-note">
        Powered by Claude AI with real-time web search. No login required.
      </p>
    </main>
  );
}
