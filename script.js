// ============================================================
// script.js — Groovepad Music Player
// ============================================================
// New features in this version:
//   - Gradient background wash that shifts per playlist
//   - ❤ Like button with heart-pop animation + liked chips
//   - Vibe Meter slider (😴 → 🤯) with live label
//   - Recently Played log with timestamps
//   - Keyboard shortcuts (Space, ←→, S, R)
//   - Rotating mood tags (decorative)
// ============================================================


// ── 1. PLAYLIST DATA ─────────────────────────────────────────
// Each playlist has a gradient theme: g1, g2, g3
// These three colours repaint the ENTIRE UI when you switch playlists.
// They also feed the background gradient wash.

const PLAYLISTS = [
  {
    name: "Lo-fi Vibes", emoji: "☀️",
    // Warm amber — sunny, relaxed afternoon feel
    theme: { g1: "#f97316", g2: "#fb923c", g3: "#fbbf24" },
    // bgWash: the soft diagonal gradient across the whole page
    bgWash: "linear-gradient(135deg, rgba(249,115,22,0.10) 0%, rgba(251,146,60,0.06) 40%, rgba(13,13,18,0) 80%)",
    songs: [
      { title: "Chill Afternoon", artist: "Lo-fi Dreams",   duration: "2:34", emoji: "🌤️", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { title: "Rainy Window",    artist: "Lo-fi Dreams",   duration: "3:05", emoji: "🌧️", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"  },
      { title: "Morning Coffee",  artist: "Acoustic Waves", duration: "2:58", emoji: "☕",  src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"  },
      { title: "Lazy Sunday",     artist: "Mellow Keys",    duration: "3:20", emoji: "🛋️", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"  },
    ]
  },
  {
    name: "Night Drive", emoji: "🌙",
    // Cool cyan-to-violet — city lights, night highways
    theme: { g1: "#06b6d4", g2: "#3b82f6", g3: "#8b5cf6" },
    bgWash: "linear-gradient(135deg, rgba(6,182,212,0.10) 0%, rgba(139,92,246,0.06) 40%, rgba(13,13,18,0) 80%)",
    songs: [
      { title: "Midnight Drive",  artist: "Neon Pulse",   duration: "3:12", emoji: "🌙", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
      { title: "City Lights",     artist: "Neon Pulse",   duration: "4:00", emoji: "🏙️", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
      { title: "Electric Bloom",  artist: "Synth Garden", duration: "3:45", emoji: "🌸", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
      { title: "Neon Rain",       artist: "Synth Garden", duration: "3:33", emoji: "🌂", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
    ]
  },
  {
    name: "Focus Mode", emoji: "🧘",
    // Deep teal-green — calm, grounded, productive
    theme: { g1: "#10b981", g2: "#14b8a6", g3: "#6366f1" },
    bgWash: "linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(99,102,241,0.06) 40%, rgba(13,13,18,0) 80%)",
    songs: [
      { title: "Ocean Breath",    artist: "Blue Horizon",  duration: "4:01", emoji: "🌊", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"  },
      { title: "Deep Current",    artist: "Blue Horizon",  duration: "3:48", emoji: "🔵", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" },
      { title: "Clear Mind",      artist: "Ambient Space", duration: "5:12", emoji: "🧘", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" },
      { title: "Flow State",      artist: "Ambient Space", duration: "4:30", emoji: "🌿", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" },
    ]
  },
];

// Vibe labels for each slider position (0–4)
const VIBE_LABELS = ["😴 Sleepy", "😌 Chill", "🕺 Groovy", "🔥 Hype", "🤯 Wild"];


// ── 2. STATE ─────────────────────────────────────────────────
let activePlaylist = 0;
let currentIndex   = 0;
let isPlaying      = false;
let isShuffle      = false;
let isRepeat       = false;
let playedCount    = 0;
let likedSongs     = [];    // array of liked song titles
let recentPlays    = [];    // array of { title, emoji, time } objects

function getCurrentSongs() { return PLAYLISTS[activePlaylist].songs; }


// ── 3. GRAB ELEMENTS ─────────────────────────────────────────
const audio         = document.getElementById("audio");
const bgWashEl      = document.getElementById("bgWash");
const vinylOuter    = document.getElementById("vinylOuter");
const tonearm       = document.getElementById("tonearm");
const artEmoji      = document.getElementById("artEmoji");
const songTitle     = document.getElementById("songTitle");
const songArtist    = document.getElementById("songArtist");
const seekBar       = document.getElementById("seekBar");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl   = document.getElementById("totalTime");
const btnPlay       = document.getElementById("btnPlay");
const iconPlay      = document.getElementById("iconPlay");
const iconPause     = document.getElementById("iconPause");
const btnPrev       = document.getElementById("btnPrev");
const btnNext       = document.getElementById("btnNext");
const btnShuffle    = document.getElementById("btnShuffle");
const btnRepeat     = document.getElementById("btnRepeat");
const volumeBar     = document.getElementById("volumeBar");
const volIconWrap   = document.getElementById("volIconWrap");
const volVal        = document.getElementById("volVal");
const playlistEl    = document.getElementById("playlist");
const playlistNav   = document.getElementById("playlistNav");
const eqBars        = document.getElementById("eqBars");
const statPlayed    = document.getElementById("statPlayed");
const queueCount    = document.getElementById("queueCount");
const likeBtn       = document.getElementById("likeBtn");
const heartIcon     = document.getElementById("heartIcon");
const likedChips    = document.getElementById("likedChips");
const vibeMeter     = document.getElementById("vibeMeter");
const vibeLabel     = document.getElementById("vibeLabel");
const recentList    = document.getElementById("recentList");


// ── 4. HELPER: formatTime ────────────────────────────────────
function formatTime(s) {
  if (isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ":" + String(sec).padStart(2, "0");
}

// Helper: returns "2:34 PM" style time string for recent plays
function getTimeStamp() {
  const now = new Date();
  const h = now.getHours() % 12 || 12;
  const m = String(now.getMinutes()).padStart(2, "0");
  const ampm = now.getHours() >= 12 ? "PM" : "AM";
  return h + ":" + m + " " + ampm;
}


// ── 5. applyTheme(playlistIndex) ─────────────────────────────
// Changes ALL gradient colours across the UI + background wash.

function applyTheme(playlistIndex) {
  const pl    = PLAYLISTS[playlistIndex];
  const theme = pl.theme;
  const root  = document.documentElement;

  root.style.setProperty("--g1",     theme.g1);
  root.style.setProperty("--g2",     theme.g2);
  root.style.setProperty("--g3",     theme.g3);
  root.style.setProperty("--accent", theme.g1);

  // Apply the background gradient wash — a soft tinted diagonal sweep
  bgWashEl.style.background = pl.bgWash;

  updateSeekBarGradient();
}


// ── 6. loadSong(index) ───────────────────────────────────────
function loadSong(index) {
  const songs = getCurrentSongs();
  const song  = songs[index];

  audio.src    = song.src;
  audio.volume = volumeBar.value;
  audio.load();

  songTitle.textContent  = song.title;
  songArtist.textContent = song.artist;
  artEmoji.textContent   = song.emoji;

  seekBar.value = 0;
  currentTimeEl.textContent = "0:00";
  totalTimeEl.textContent   = song.duration;

  // Update the like button state for the new song
  updateLikeButton();

  updateSeekBarGradient();
  renderPlaylist();
}


// ── 7. play() / pause() ──────────────────────────────────────
function play() {
  audio.play().catch(function() {});
  isPlaying = true;
  iconPlay.style.display  = "none";
  iconPause.style.display = "block";
  vinylOuter.classList.remove("paused");
  tonearm.classList.remove("paused");
  eqBars.classList.add("playing");
  renderPlaylist();
}

function pause() {
  audio.pause();
  isPlaying = false;
  iconPlay.style.display  = "block";
  iconPause.style.display = "none";
  vinylOuter.classList.add("paused");
  tonearm.classList.add("paused");
  eqBars.classList.remove("playing");
  renderPlaylist();
}

function togglePlayPause() {
  if (isPlaying) { pause(); } else { play(); }
}


// ── 8. nextSong() / prevSong() ───────────────────────────────
function nextSong() {
  const songs = getCurrentSongs();
  if (isShuffle) {
    let r;
    do { r = Math.floor(Math.random() * songs.length); } while (r === currentIndex);
    currentIndex = r;
  } else {
    currentIndex = (currentIndex + 1) % songs.length;
  }
  loadSong(currentIndex);
  play();
  addToRecent();
  playedCount++;
  statPlayed.textContent = playedCount;
}

function prevSong() {
  const songs = getCurrentSongs();
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
  } else {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    loadSong(currentIndex);
    play();
  }
}


// ── 9. switchPlaylist(index) ─────────────────────────────────
function switchPlaylist(index) {
  activePlaylist = index;
  currentIndex   = 0;
  applyTheme(index);
  buildPlaylistNav();
  queueCount.textContent = getCurrentSongs().length + " tracks";
  pause();
  loadSong(currentIndex);
}


// ── 10. renderPlaylist() ─────────────────────────────────────
function renderPlaylist() {
  playlistEl.innerHTML = "";
  const songs = getCurrentSongs();
  const theme = PLAYLISTS[activePlaylist].theme;

  songs.forEach(function(song, index) {
    const row = document.createElement("div");
    row.className = "track-row" + (index === currentIndex ? " active" : "");

    row.innerHTML = `
      <div class="track-dot" style="background:${theme.g1}22; border:1.5px solid ${theme.g1}44;">
        ${index === currentIndex && isPlaying ? "🎵" : song.emoji}
      </div>
      <div class="track-info">
        <div class="track-name" style="color:${index === currentIndex ? theme.g1 : ""}">
          ${song.title}
        </div>
        <div class="track-artist">${song.artist}</div>
      </div>
      <div class="track-dur">${song.duration}</div>
    `;

    row.addEventListener("click", function() {
      currentIndex = index;
      loadSong(currentIndex);
      play();
      addToRecent();
      playedCount++;
      statPlayed.textContent = playedCount;
    });

    playlistEl.appendChild(row);
  });
}


// ── 11. buildPlaylistNav() ───────────────────────────────────
function buildPlaylistNav() {
  playlistNav.innerHTML = "";
  PLAYLISTS.forEach(function(pl, index) {
    const btn = document.createElement("button");
    btn.className = "pl-nav-btn" + (index === activePlaylist ? " active" : "");
    btn.innerHTML = `<div class="pl-nav-dot"></div><span>${pl.emoji} ${pl.name}</span>`;
    btn.addEventListener("click", function() { switchPlaylist(index); });
    playlistNav.appendChild(btn);
  });
}


// ── 12. LIKE BUTTON ─────────────────────────────────────────
// Toggles the current song in/out of the likedSongs array.
// Shows a chip below for each liked song.

likeBtn.addEventListener("click", function() {
  const songs = getCurrentSongs();
  const song  = songs[currentIndex];

  const alreadyLiked = likedSongs.indexOf(song.title) !== -1;

  if (alreadyLiked) {
    // Remove from liked
    likedSongs = likedSongs.filter(function(t) { return t !== song.title; });
    likeBtn.classList.remove("liked");
    heartIcon.textContent = "♡";
  } else {
    // Add to liked
    likedSongs.push(song.title);
    likeBtn.classList.add("liked");
    heartIcon.textContent = "♥";
  }

  renderLikedChips();
});

// Re-check liked state whenever song changes
function updateLikeButton() {
  const songs = getCurrentSongs();
  const song  = songs[currentIndex];
  const liked = likedSongs.indexOf(song.title) !== -1;
  likeBtn.classList.toggle("liked", liked);
  heartIcon.textContent = liked ? "♥" : "♡";
}

// Renders the row of liked-song chips
function renderLikedChips() {
  likedChips.innerHTML = "";
  likedSongs.forEach(function(title) {
    const chip = document.createElement("div");
    chip.className = "liked-chip";
    chip.textContent = title;
    chip.title = title;
    likedChips.appendChild(chip);
  });
}


// ── 13. VIBE METER ──────────────────────────────────────────
// A fun slider (😴 → 🤯) — purely interactive, no audio effect.
// Great beginner example of reading a slider's value in real time.

vibeMeter.addEventListener("input", function() {
  const val = parseInt(vibeMeter.value);
  vibeLabel.textContent = VIBE_LABELS[val];
});


// ── 14. RECENTLY PLAYED ──────────────────────────────────────
// Logs each song play with a timestamp. Max 4 shown.

function addToRecent() {
  const songs = getCurrentSongs();
  const song  = songs[currentIndex];

  // Prepend new entry (newest first)
  recentPlays.unshift({
    title: song.title,
    emoji: song.emoji,
    time:  getTimeStamp()
  });

  // Keep only the last 4
  if (recentPlays.length > 4) { recentPlays.pop(); }

  renderRecentPlays();
}

function renderRecentPlays() {
  recentList.innerHTML = "";

  if (recentPlays.length === 0) {
    recentList.innerHTML = '<div class="recent-empty">Nothing played yet — hit play! 🎵</div>';
    return;
  }

  recentPlays.forEach(function(item) {
    const el = document.createElement("div");
    el.className = "recent-item";
    el.innerHTML = `
      <div class="recent-emoji">${item.emoji}</div>
      <div class="recent-info">
        <div class="recent-name">${item.title}</div>
        <div class="recent-time">${item.time}</div>
      </div>
    `;
    recentList.appendChild(el);
  });
}


// ── 15. AUDIO EVENTS ─────────────────────────────────────────

audio.addEventListener("timeupdate", function() {
  seekBar.max   = audio.duration || 0;
  seekBar.value = audio.currentTime;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  totalTimeEl.textContent   = formatTime(audio.duration);
  updateSeekBarGradient();
});

audio.addEventListener("ended", function() {
  if (isRepeat) {
    audio.currentTime = 0;
    play();
  } else {
    nextSong();
  }
});


// ── 16. BUTTON EVENTS ────────────────────────────────────────

btnPlay.addEventListener("click", togglePlayPause);

btnNext.addEventListener("click", function() {
  nextSong();
});

btnPrev.addEventListener("click", prevSong);

btnShuffle.addEventListener("click", function() {
  isShuffle = !isShuffle;
  btnShuffle.classList.toggle("active", isShuffle);
});

btnRepeat.addEventListener("click", function() {
  isRepeat = !isRepeat;
  btnRepeat.classList.toggle("active", isRepeat);
});

// Mood tags — decorative interaction
document.querySelectorAll(".mood-tag").forEach(function(tag) {
  tag.addEventListener("click", function() {
    document.querySelectorAll(".mood-tag").forEach(function(t) { t.classList.remove("active"); });
    tag.classList.add("active");
  });
});


// ── 17. SEEK + VOLUME ────────────────────────────────────────

seekBar.addEventListener("input", function() {
  audio.currentTime = seekBar.value;
  updateSeekBarGradient();
});

function updateSeekBarGradient() {
  const max = parseFloat(seekBar.max) || 1;
  const val = parseFloat(seekBar.value) || 0;
  const pct = (val / max * 100).toFixed(1) + "%";
  seekBar.style.setProperty("--seek-pct", pct);
}

volumeBar.addEventListener("input", function() {
  const vol = parseFloat(volumeBar.value);
  audio.volume = vol;
  volVal.textContent = Math.round(vol * 100);
  if      (vol === 0) { volIconWrap.textContent = "🔇"; }
  else if (vol < 0.5) { volIconWrap.textContent = "🔉"; }
  else                { volIconWrap.textContent = "🔊"; }
});


// ── 18. KEYBOARD SHORTCUTS ───────────────────────────────────
document.addEventListener("keydown", function(e) {
  if (e.target.tagName === "INPUT") return;
  if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); togglePlayPause(); }
  if (e.key === "ArrowRight") { e.preventDefault(); nextSong(); }
  if (e.key === "ArrowLeft")  { e.preventDefault(); prevSong(); }
  if (e.key === "s" || e.key === "S") { isShuffle = !isShuffle; btnShuffle.classList.toggle("active", isShuffle); }
  if (e.key === "r" || e.key === "R") { isRepeat  = !isRepeat;  btnRepeat.classList.toggle("active", isRepeat);  }
});


// ── 19. INIT ─────────────────────────────────────────────────
buildPlaylistNav();
applyTheme(0);
loadSong(currentIndex);
queueCount.textContent = getCurrentSongs().length + " tracks";
renderRecentPlays();
