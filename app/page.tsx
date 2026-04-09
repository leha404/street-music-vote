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
        <a href={state.channelUrl} target="_blank" rel="noreferrer" className="channel-link">
          Мой канал
        </a>
      </div>

      <section className="card">
        <p className="subtitle">Сейчас играю</p>
        <h1 className="song-now">{state.currentSong.title}</h1>
        <p className="song-meta">{state.currentSong.artist}</p>
      </section>

      <section className="card">
        <p className="intro-hello">
          <strong>Привет! Меня зовут Алексей</strong>
        </p>
        <p>Я музыкант с более чем 10-ти летним стажем</p>
        <p>
          Если вам нравится мое творчество - вы можете поддержать меня любой суммой, а я могу сыграть вам вашу
          песню.
        </p>
        <p>Если я ее не знаю - я найду слова и аккорды к песне в интернете при вас</p>
        <p>
          А можете просто проголосовать за следующую песню, это <strong>бесплатно</strong>!
        </p>
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
