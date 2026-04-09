"use client";

import { useCallback, useEffect, useState } from "react";
import type { PublicState } from "@/lib/store";

export default function AdminPage() {
  const [state, setState] = useState<PublicState | null>(null);
  const [info, setInfo] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/state", { cache: "no-store" });
    const data = (await response.json()) as PublicState;
    setState(data);
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, [load]);

  const selectManual = async (songId: string) => {
    const response = await fetch("/api/admin/select-next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "manual", songId })
    });
    if (!response.ok) {
      setInfo("Не удалось выбрать следующую вручную.");
      return;
    }
    setInfo("Следующая песня выбрана вручную.");
    load();
  };

  const selectRandom = async () => {
    const response = await fetch("/api/admin/select-next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "random" })
    });
    if (!response.ok) {
      setInfo("Не удалось выбрать песню случайно.");
      return;
    }
    setInfo("Следующая песня выбрана случайно.");
    load();
  };

  const advance = async () => {
    const response = await fetch("/api/admin/advance-round", { method: "POST" });
    if (!response.ok) {
      setInfo("Не удалось завершить раунд.");
      return;
    }
    setInfo("Раунд завершен, текущая песня переключена.");
    load();
  };

  if (!state) {
    return <main className="container">Загрузка...</main>;
  }

  return (
    <main className="container">
      <h1 className="title">Панель музыканта</h1>
      <p className="subtitle">Раунд #{state.roundId}</p>

      <section className="card stack">
        <div className="badge">Сейчас играет</div>
        <div>
          <strong>{state.currentSong.title}</strong> - {state.currentSong.artist}
        </div>
        <div className="muted small">
          Сыграна раз: <strong>{state.currentSong.playedCount}</strong>
        </div>
      </section>

      <section className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <strong>Следующая песня</strong>
          <button className="button secondary" style={{ width: "auto" }} onClick={selectRandom} type="button">
            Выбрать случайно
          </button>
        </div>
        <div className="muted">
          {state.nextSong ? `${state.nextSong.title} - ${state.nextSong.artist}` : "Пока не выбрана"}
        </div>
        <button className="button primary" onClick={advance} type="button">
          Завершить текущую и переключить
        </button>
      </section>

      <section className="stack">
        <strong>Список песен и голоса</strong>
        <ul className="list">
          {state.songs.map((song) => (
            <li key={song.id} className="list-item">
              <div>
                <div>
                  {song.title} - {song.artist}
                </div>
                <div className="small muted">
                  Голосов: {song.votes} | Сыграна: {song.playedCount}
                </div>
              </div>
              <button
                className="button"
                style={{ width: "auto", padding: "8px 10px", background: "#edf1f7" }}
                onClick={() => selectManual(song.id)}
                type="button"
              >
                Сделать следующей
              </button>
            </li>
          ))}
        </ul>
      </section>

      {info && <p className="subtitle">{info}</p>}
    </main>
  );
}
