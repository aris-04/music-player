// ============================================================
// script.js — Groovepad Music Player
// ============================================================
// Sections:
//   1.  Playlist data (with gradient themes per playlist)
//   2.  State variables
//   3.  Grab HTML elements
//   4.  Helper: formatTime
//   5.  applyTheme()       — swaps gradient colours per playlist
//   6.  loadSong()         — loads a song into the player
//   7.  play() / pause()   — start/stop audio
//   8.  nextSong()         — advance to next track
//   9.  prevSong()         — go back a track
//   10. switchPlaylist()   — switch active playlist
//   11. renderPlaylist()   — build queue list in right panel
//   12. buildPlaylistNav() — build sidebar playlist buttons
//   13. Audio events       — timeupdate, ended
//   14. Button events      — play, next, prev, shuffle, repeat
//   15. Tab events         — playlist nav clicks
//   16. Seek + Volume      — slider interactions
//   17. Keyboard shortcuts — spacebar, arrows, S, R
//   18. Rotating tips      — cycles helpful tips
//   19. Seek bar gradient  — live fill colour on progress bar
//   20. Init               — runs on page load
// ============================================================


// ── 1. PLAYLIST DATA ─────────────────────────────────────────
// Each playlist has:
//   name    — display name
//   theme   — gradient colours (g1, g2, g3) that paint the whole UI
//   songs   — array of song objects

const PLAYLISTS = [
  {
    name:  "Lo-fi Vibes",
    emoji: "☀️",
    // Warm amber/orange gradient — feels like a sunny afternoon
    theme: { g1: "#f97316", g2: "#fb923c", g3: "#fbbf24" },
    songs: [
      { title: "Chill Afternoon", artist: "Lo-fi Dreams",   duration: "2:34", emoji: "🌤️", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { title: "Rainy Window",    artist: "Lo-fi Dreams",   duration: "3:05", emoji: "🌧️", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"  },
      { title: "Morning Coffee",  artist: "Acoustic Waves", duration: "2:58", emoji: "☕",  src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"  },
      { title: "Lazy Sunday",     artist: "Mellow Keys",    duration: "3:20", emoji: "🛋️", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"  },
    ]
  },
  {
    name:  "Night Drive",
    emoji: "🌙",
    // Cool cyan/blue gradient — feels like city lights at night
    theme: { g1: "#06b6d4", g2: "#3b82f6", g3: "#8b5cf6" },
    songs: [
      { title: "Midnight Drive",  artist: "Neon Pulse",   duration: "3:12", emoji: "🌙", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
      { title: "City Lights",     artist: "Neon Pulse",   duration: "4:00", emoji: "🏙️", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
      { title: "Electric Bloom",  artist: "Synth Garden", duration: "3:45", emoji: "🌸", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
      { title: "Neon Rain",       artist: "Synth Garden", duration: "3:33", emoji: "🌂", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
    ]
  },
  {
    name:  "Focus Mode",
    emoji: "🧘",
    // Deep teal/green gradient — calm and productive
    theme: { g1: "#10b981", g2: "#14b8a6", g3: "#6366f1" },
    songs: [
      { title: "Ocean Breath",    artist: "Blue Horizon",  duration: "4:01", emoji: "🌊", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"  },
      { title: "Deep Current",    artist: "Blue Horizon",  duration: "3:48", emoji: "🔵", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" },
      { title: "Clear Mind",      artist: "Ambient Space", duration: "5:12", emoji: "🧘", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" },
      { title: "Flow State",      artist: "Ambient Space", duration: "4:30", emoji: "🌿", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" },
    ]
  },
];

// Tips that rotate in the tip card
const TIPS = [
  "Click any track in the queue to jump to it instantly.",
  "Press Space to play or pause without touching your mouse.",
  "Shuffle picks a random track — never the same one twice.",
  "Press S to toggle shuffle, R to toggle repeat.",
  "Add your own MP3s by editing the src values in script.js.",
  "The vinyl spins while your music plays ◉",
  "Use ← → arrow keys to skip between tracks.",
];


// ── 2. STATE VARIABLES ───────────────────────────────────────
let activePlaylist = 0;     // index of the currently selected playlist
let currentIndex   = 0;     // index of current song within the playlist
let isPlaying      = false;
let isShuffle      = false;
let isRepeat       = false;
let playedCount    = 0;     // counts total songs played (for the stat)

// Helper: returns the songs array for the active playlist
function getCurrentSongs() {
  return PLAYLISTS[activePlaylist].songs;
}


// ── 3. GRAB HTML ELEMENTS ────────────────────────────────────
const audio          = document.getElementById("audio");
const vinylOuter     = document.getElementById("vinylOuter");
const tonearm        = document.getElementById("tonearm");
const artEmoji       = document.getElementById("artEmoji");
const vinylCenter    = document.getElementById("vinylCenter");
const songTitle      = document.getElementById("songTitle");
const songArtist     = document.getElementById("songArtist");
const seekBar        = document.getElementById("seekBar");
const currentTimeEl  = document.getElementById("currentTime");
const totalTimeEl    = document.getElementById("totalTime");
const btnPlay        = document.getElementById("btnPlay");
const iconPlay       = document.getElementById("iconPlay");
const iconPause      = document.getElementById("iconPause");
const btnPrev        = document.getElementById("btnPrev");
const btnNext        = document.getElementById("btnNext");
const btnShuffle     = document.getElementById("btnShuffle");
const btnRepeat      = document.getElementById("btnRepeat");
const volumeBar      = document.getElementById("volumeBar");
const volIconWrap    = document.getElementById("volIconWrap");
const volVal         = document.getElementById("volVal");
const playlistEl     = document.getElementById("playlist");
const playlistNav    = document.getElementById("playlistNav");
const eqBars         = document.getElementById("eqBars");
const statPlayed     = document.getElementById("statPlayed");
const queueCount     = document.getElementById("queueCount");
const tipText        = document.getElementById("tipText");


// ── 4. HELPER: formatTime ────────────────────────────────────
// Converts seconds to "m:ss"  e.g. formatTime(94) → "1:34"
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ":" + String(s).padStart(2, "0");
}


// ── 5. applyTheme(playlistIndex) ─────────────────────────────
// Swaps the CSS gradient variables to match the active playlist.
// This repaints the blobs, buttons, vinyl, progress bar — everything.

function applyTheme(playlistIndex) {
  const theme = PLAYLISTS[playlistIndex].theme;
  const root  = document.documentElement;

  // setProperty updates a CSS variable defined in :root {}
  root.style.setProperty("--g1",     theme.g1);
  root.style.setProperty("--g2",     theme.g2);
  root.style.setProperty("--g3",     theme.g3);
  root.style.setProperty("--accent", theme.g1);

  // Update the seek bar fill gradient too
  updateSeekBarGradient();
}


// ── 6. loadSong(index) ───────────────────────────────────────
// Loads a song from the current playlist into the audio element.

function loadSong(index) {
  const songs = getCurrentSongs();
  const song  = songs[index];

  audio.src    = song.src;
  audio.volume = volumeBar.value;
  audio.load();

  // Update on-screen text
  songTitle.textContent  = song.title;
  songArtist.textContent = song.artist;
  artEmoji.textContent   = song.emoji;

  // Reset progress bar
  seekBar.value = 0;
  currentTimeEl.textContent = "0:00";
  totalTimeEl.textContent   = song.duration;
  updateSeekBarGradient();

  // Rebuild the queue to highlight the new active row
  renderPlaylist();
}


// ── 7. play() and pause() ────────────────────────────────────

function play() {
  audio.play().catch(function() {});  // .catch silences autoplay policy errors
  isPlaying = true;

  // Swap play/pause SVG icons
  iconPlay.style.display  = "none";
  iconPause.style.display = "block";

  // Start vinyl spinning + drop tonearm
  vinylOuter.classList.remove("paused");
  tonearm.classList.remove("paused");

  // Animate the EQ bars
  eqBars.classList.add("playing");

  renderPlaylist();   // refresh to show 🎵 on active row
}

function pause() {
  audio.pause();
  isPlaying = false;

  iconPlay.style.display  = "block";
  iconPause.style.display = "none";

  // Stop vinyl + lift tonearm
  vinylOuter.classList.add("paused");
  tonearm.classList.add("paused");

  eqBars.classList.remove("playing");

  renderPlaylist();
}

function togglePlayPause() {
  if (isPlaying) { pause(); } else { play(); }
}


// ── 8. nextSong() ────────────────────────────────────────────
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
  playedCount++;
  statPlayed.textContent = playedCount;
}


// ── 9. prevSong() ────────────────────────────────────────────
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


// ── 10. switchPlaylist(playlistIndex) ────────────────────────
// Switches to a different playlist, applies its gradient theme.

function switchPlaylist(playlistIndex) {
  activePlaylist = playlistIndex;
  currentIndex   = 0;

  applyTheme(playlistIndex);

  // Rebuild sidebar nav so the correct button is highlighted
  buildPlaylistNav();

  // Update queue count
  queueCount.textContent = getCurrentSongs().length + " tracks";

  pause();
  loadSong(currentIndex);
}


// ── 11. renderPlaylist() ─────────────────────────────────────
// Builds the track rows in the right-panel queue.

function renderPlaylist() {
  playlistEl.innerHTML = "";
  const songs = getCurrentSongs();
  const theme = PLAYLISTS[activePlaylist].theme;

  songs.forEach(function(song, index) {
    const row = document.createElement("div");
    row.className = "track-row" + (index === currentIndex ? " active" : "");

    row.innerHTML = `
      <div class="track-dot" style="background: ${theme.g1}22; border: 1.5px solid ${theme.g1}44;">
        ${index === currentIndex && isPlaying ? "🎵" : song.emoji}
      </div>
      <div class="track-info">
        <div class="track-name" style="color: ${index === currentIndex ? theme.g1 : ""}">
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
      playedCount++;
      statPlayed.textContent = playedCount;
    });

    playlistEl.appendChild(row);
  });
}


// ── 12. buildPlaylistNav() ───────────────────────────────────
// Builds the sidebar playlist buttons.

function buildPlaylistNav() {
  playlistNav.innerHTML = "";

  PLAYLISTS.forEach(function(pl, index) {
    const btn = document.createElement("button");
    btn.className = "pl-nav-btn" + (index === activePlaylist ? " active" : "");

    btn.innerHTML = `
      <div class="pl-nav-dot"></div>
      <span>${pl.emoji} ${pl.name}</span>
    `;

    btn.addEventListener("click", function() {
      switchPlaylist(index);
    });

    playlistNav.appendChild(btn);
  });
}


// ── 13. AUDIO EVENTS ─────────────────────────────────────────

// Fires ~4x/second while playing — updates seek bar and time
audio.addEventListener("timeupdate", function() {
  seekBar.max   = audio.duration || 0;
  seekBar.value = audio.currentTime;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  totalTimeEl.textContent   = formatTime(audio.duration);
  updateSeekBarGradient();  // keeps the fill colour in sync
});

// Fires when the song naturally ends
audio.addEventListener("ended", function() {
  if (isRepeat) {
    audio.currentTime = 0;
    play();
  } else {
    nextSong();
  }
});


// ── 14. BUTTON EVENTS ────────────────────────────────────────

btnPlay.addEventListener("click", togglePlayPause);
btnNext.addEventListener("click", function() { nextSong(); playedCount++; statPlayed.textContent = playedCount; });
btnPrev.addEventListener("click", prevSong);

btnShuffle.addEventListener("click", function() {
  isShuffle = !isShuffle;
  btnShuffle.classList.toggle("active", isShuffle);
});

btnRepeat.addEventListener("click", function() {
  isRepeat = !isRepeat;
  btnRepeat.classList.toggle("active", isRepeat);
});

// Mood tags — just visual for now (decorative interaction)
document.querySelectorAll(".mood-tag").forEach(function(tag) {
  tag.addEventListener("click", function() {
    document.querySelectorAll(".mood-tag").forEach(function(t) { t.classList.remove("active"); });
    tag.classList.add("active");
  });
});


// ── 15. SEEK BAR ─────────────────────────────────────────────
seekBar.addEventListener("input", function() {
  audio.currentTime = seekBar.value;
  updateSeekBarGradient();
});

// Updates the seek bar track fill colour as a CSS custom property
// so the filled portion shows the gradient colour
function updateSeekBarGradient() {
  const max = parseFloat(seekBar.max) || 1;
  const val = parseFloat(seekBar.value) || 0;
  const pct = (val / max * 100).toFixed(1) + "%";
  seekBar.style.setProperty("--seek-pct", pct);
}


// ── 16. VOLUME ───────────────────────────────────────────────
volumeBar.addEventListener("input", function() {
  const vol = parseFloat(volumeBar.value);
  audio.volume = vol;
  volVal.textContent = Math.round(vol * 100);
  if      (vol === 0) { volIconWrap.textContent = "🔇"; }
  else if (vol < 0.5) { volIconWrap.textContent = "🔉"; }
  else                { volIconWrap.textContent = "🔊"; }
});


// ── 17. KEYBOARD SHORTCUTS ───────────────────────────────────
// Makes the player controllable without the mouse.
// e.key gives us the key name as a string.

document.addEventListener("keydown", function(e) {
  // Don't fire if user is typing in an input
  if (e.target.tagName === "INPUT") return;

  if (e.key === " " || e.key === "Spacebar") {
    e.preventDefault();   // stops the page from scrolling on spacebar
    togglePlayPause();
  }
  if (e.key === "ArrowRight") { e.preventDefault(); nextSong(); }
  if (e.key === "ArrowLeft")  { e.preventDefault(); prevSong(); }
  if (e.key === "s" || e.key === "S") {
    isShuffle = !isShuffle;
    btnShuffle.classList.toggle("active", isShuffle);
  }
  if (e.key === "r" || e.key === "R") {
    isRepeat = !isRepeat;
    btnRepeat.classList.toggle("active", isRepeat);
  }
});


// ── 18. ROTATING TIPS ────────────────────────────────────────
// Cycles through the TIPS array every 6 seconds.
// setInterval runs a function repeatedly at a given interval (ms).

let tipIndex = 0;
setInterval(function() {
  tipIndex = (tipIndex + 1) % TIPS.length;
  tipText.style.opacity = "0";
  // Wait for fade out, then swap text and fade back in
  setTimeout(function() {
    tipText.textContent  = TIPS[tipIndex];
    tipText.style.opacity = "1";
  }, 300);
}, 6000);

// Add transition to tip text for smooth fade
tipText.style.transition = "opacity .3s";


// ── 19. INIT ─────────────────────────────────────────────────
// Run once on page load: build the sidebar nav,
// apply the first playlist's theme, load the first song.

buildPlaylistNav();
applyTheme(0);
loadSong(currentIndex);
queueCount.textContent = getCurrentSongs().length + " tracks";