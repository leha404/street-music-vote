export type Song = {
  id: string;
  title: string;
  artist: string;
  votes: number;
  playedCount: number;
};

type AppStore = {
  roundId: number;
  channelUrl: string;
  donateUrl: string;
  aboutText: string;
  currentSongId: string;
  nextSongId: string | null;
  songs: Song[];
};

export type PublicState = {
  roundId: number;
  channelUrl: string;
  donateUrl: string;
  aboutText: string;
  currentSong: Song;
  nextSong: Song | null;
  songs: Song[];
};

const initialSongs: Song[] = [
  { id: "song-1", title: "Кукушка", artist: "Виктор Цой", votes: 0, playedCount: 0 },
  { id: "song-2", title: "Звезда по имени Солнце", artist: "Кино", votes: 0, playedCount: 0 },
  { id: "song-3", title: "Батарейка", artist: "Жуки", votes: 0, playedCount: 0 },
  { id: "song-4", title: "Восьмиклассница", artist: "Кино", votes: 0, playedCount: 0 },
  { id: "song-5", title: "Wonderwall", artist: "Oasis", votes: 0, playedCount: 0 }
];

const initialStore: AppStore = {
  roundId: 1,
  channelUrl: "https://example.com/my-channel",
  donateUrl: "https://example-bank.com/transfer",
  aboutText:
    "Меня зовут Алексей, я музыкант с более чем 10-ти летним стажем.\n\nЕсли вам нравится мое творчество - вы можете поддержать меня любой суммой, а я могу сыграть вам вашу песню. Если я ее не знаю - я найду слова и аккорды к песне в интернете при вас\n\nА можете просто проголосовать за следующую песню, это бесплатно!",
  currentSongId: "song-1",
  nextSongId: null,
  songs: initialSongs
};

declare global {
  // eslint-disable-next-line no-var
  var __streetMusicStore: AppStore | undefined;
}

function getStoreRef(): AppStore {
  if (!globalThis.__streetMusicStore) {
    globalThis.__streetMusicStore = structuredClone(initialStore);
  }
  return globalThis.__streetMusicStore;
}

function getSongById(store: AppStore, songId: string): Song | null {
  return store.songs.find((song) => song.id === songId) ?? null;
}

export function getState(): PublicState {
  const store = getStoreRef();
  const currentSong = getSongById(store, store.currentSongId);

  if (!currentSong) {
    throw new Error("Current song not found in store");
  }

  const nextSong = store.nextSongId ? getSongById(store, store.nextSongId) : null;

  return {
    roundId: store.roundId,
    channelUrl: store.channelUrl,
    donateUrl: store.donateUrl,
    aboutText: store.aboutText,
    currentSong,
    nextSong,
    songs: [...store.songs].sort((a, b) => b.votes - a.votes || a.title.localeCompare(b.title))
  };
}

export function addVotes(songIds: string[]): { success: boolean; message?: string } {
  const store = getStoreRef();
  const uniqueSongIds = [...new Set(songIds)];

  if (uniqueSongIds.length === 0) {
    return { success: false, message: "Нужно выбрать хотя бы одну песню." };
  }

  for (const songId of uniqueSongIds) {
    const song = getSongById(store, songId);
    if (song) {
      song.votes += 1;
    }
  }

  return { success: true };
}

export function selectNext(songId: string): { success: boolean; message?: string } {
  const store = getStoreRef();
  const song = getSongById(store, songId);

  if (!song) {
    return { success: false, message: "Песня не найдена." };
  }

  store.nextSongId = songId;
  return { success: true };
}

export function selectNextRandom(): { success: boolean; nextSongId?: string; message?: string } {
  const store = getStoreRef();
  const pool = store.songs.filter((song) => song.id !== store.currentSongId);

  if (pool.length === 0) {
    return { success: false, message: "Нет доступных песен для выбора." };
  }

  const randomSong = pool[Math.floor(Math.random() * pool.length)];
  store.nextSongId = randomSong.id;
  return { success: true, nextSongId: randomSong.id };
}

function pickTopVotedSong(store: AppStore): Song | null {
  const candidates = store.songs.filter((song) => song.id !== store.currentSongId);
  if (candidates.length === 0) {
    return null;
  }

  const maxVotes = Math.max(...candidates.map((song) => song.votes));
  const winners = candidates.filter((song) => song.votes === maxVotes);
  return winners[Math.floor(Math.random() * winners.length)] ?? null;
}

export function advanceRound(): { success: boolean; message?: string } {
  const store = getStoreRef();
  const currentSong = getSongById(store, store.currentSongId);
  if (!currentSong) {
    return { success: false, message: "Текущая песня не найдена." };
  }

  let nextSong = store.nextSongId ? getSongById(store, store.nextSongId) : null;
  if (!nextSong) {
    nextSong = pickTopVotedSong(store);
  }
  if (!nextSong) {
    return { success: false, message: "Не удалось выбрать следующую песню." };
  }

  currentSong.playedCount += 1;
  store.currentSongId = nextSong.id;
  store.nextSongId = null;
  store.roundId += 1;

  for (const song of store.songs) {
    song.votes = 0;
  }

  return { success: true };
}
