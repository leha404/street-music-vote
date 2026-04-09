"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PublicState } from "@/lib/store";

export default function HomePage() {
  const [state, setState] = useState<PublicState | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const response = await fetch("/api/state", { cache: "no-store" });
      const data = (await response.json()) as PublicState;
      if (mounted) {
        setState(data);
      }
    };

    load();
    const timer = setInterval(load, 3000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  if (!state) {
    return <main className="container">Загрузка...</main>;
  }

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="badge">LIVE</span>
        <a href={state.channelUrl} target="_blank" rel="noreferrer" className="muted">
          Мой канал
        </a>
      </div>

      <section className="card">
        <p className="subtitle">Сейчас играю</p>
        <h1 className="song-now">{state.currentSong.title}</h1>
        <p className="song-meta">{state.currentSong.artist}</p>
      </section>

      <section className="card">
        {state.aboutText.split("\n\n").map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </section>

      <div className="stack">
        <Link className="button primary" href="/vote">
          Проголосовать за следующую песню
        </Link>
        <a href={state.donateUrl} target="_blank" rel="noreferrer" className="button secondary">
          Просто поддержать донатом :)
        </a>
      </div>
    </main>
  );
}
