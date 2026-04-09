"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PublicState } from "@/lib/store";

type VoteStatus = "idle" | "sent";

export default function VotePage() {
  const [state, setState] = useState<PublicState | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [voteStatus, setVoteStatus] = useState<VoteStatus>("idle");
  const [message, setMessage] = useState("");

  const voteStorageKey = state ? `voted_round_${state.roundId}` : "";

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/state", { cache: "no-store" });
      const data = (await response.json()) as PublicState;
      setState(data);
      if (typeof window !== "undefined" && localStorage.getItem(`voted_round_${data.roundId}`)) {
        setVoteStatus("sent");
      } else {
        setVoteStatus("idle");
      }
    };
    load();
  }, []);

  const filteredSongs = useMemo(() => {
    if (!state) {
      return [];
    }
    const q = query.trim().toLowerCase();
    return state.songs.filter(
      (song) => song.title.toLowerCase().includes(q) || song.artist.toLowerCase().includes(q)
    );
  }, [query, state]);

  const toggleSong = (songId: string) => {
    if (voteStatus === "sent") {
      return;
    }
    const next = new Set(selected);
    if (next.has(songId)) {
      next.delete(songId);
    } else {
      next.add(songId);
    }
    setSelected(next);
  };

  const submitVote = async () => {
    if (!state || selected.size === 0 || voteStatus === "sent") {
      return;
    }

    const response = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songIds: Array.from(selected) })
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { message?: string };
      setMessage(errorData.message ?? "Не удалось отправить голос.");
      return;
    }

    localStorage.setItem(voteStorageKey, "1");
    setVoteStatus("sent");
    setMessage("Спасибо! Ваш выбор учтен в текущем раунде.");
  };

  if (!state) {
    return <main className="container">Загрузка...</main>;
  }

  return (
    <main className="container">
      <section className="card stack">
        <h1 className="title">Голосование</h1>
        <p className="subtitle">Отметьте песни и отправьте голос один раз.</p>
        <input
          className="input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск песни..."
        />
      </section>

      <ul className="list">
        {filteredSongs.map((song) => {
          const active = selected.has(song.id);
          return (
            <li key={song.id} className="list-item">
              <div>
                <div>{song.title}</div>
                <div className="small muted">{song.artist}</div>
              </div>
              <button
                className="button"
                style={{
                  width: "52px",
                  padding: "8px 0",
                  background: active ? "#ff4f86" : "#edf1f7",
                  color: active ? "#fff" : "#41506a"
                }}
                onClick={() => toggleSong(song.id)}
                type="button"
                aria-label={`Лайк ${song.title}`}
              >
                {active ? "♥" : "♡"}
              </button>
            </li>
          );
        })}
      </ul>

      {voteStatus === "sent" ? (
        <Link href="/" className="button primary">
          Голос уже отправлен, назад на главную
        </Link>
      ) : (
        <button className="button primary" onClick={submitVote} type="button">
          Отправить мой выбор
        </button>
      )}

      {message && <p className="subtitle">{message}</p>}
    </main>
  );
}
