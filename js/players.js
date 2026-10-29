// Base path for player images
var PLAYERS_PATH = "Assets/Players/";
// Minimum grid slots (unused ones are shown empty)
var MIN_SLOTS = 50;
// live.json is ignored when older than this (the checker's computer may be off)
var LIVE_MAX_AGE = 40 * 60 * 1000;
// Player name -> platforms they are live on, e.g. { "Edilan": ["twitch"] }
var liveNow = {};

// Social network icons (inline SVG, color = currentColor)
var ICONS = {
  youtube: '<svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  twitch: '<svg viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0 1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="M7 1h10a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H7a6 6 0 0 1-6-6V7a6 6 0 0 1 6-6zm0 2.2A3.8 3.8 0 0 0 3.2 7v10A3.8 3.8 0 0 0 7 20.8h10a3.8 3.8 0 0 0 3.8-3.8V7A3.8 3.8 0 0 0 17 3.2zM12 6.6a5.4 5.4 0 1 1 0 10.8 5.4 5.4 0 0 1 0-10.8zm0 2.2a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zM17.6 4.9a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z"/></svg>',
  bluesky: '<svg viewBox="0 0 24 24"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.6-3.6a3 3 0 1 1 4.2 4.2l-2.1 2.1a1 1 0 1 1-1.4-1.4l2.1-2.1a1 1 0 0 0-1.4-1.4L12 13.4a1 1 0 0 1-1.4 0zm2.8-2.8a1 1 0 0 1 0 1.4l-3.6 3.6a3 3 0 1 1-4.2-4.2l2.1-2.1a1 1 0 0 1 1.4 1.4L7 10.8a1 1 0 0 0 1.4 1.4L12 8.6a1 1 0 0 1 1.4 0z"/></svg>'
};
ICONS.twitter = ICONS.x;

var grid = document.getElementById("players");
var overlay = document.getElementById("overlay");
var ovFigure = document.getElementById("ov-figure");
var ovImage = document.getElementById("ov-image");
var ovName = document.getElementById("ov-name");
var ovSocials = document.getElementById("ov-socials");
var ovDeath = document.getElementById("ov-death");
var ovDeathText = document.getElementById("ov-death-text");
var ovDeathLink = document.getElementById("ov-death-link");

// Gets the username from a profile URL, ignoring extra paths such as /live:
//   "https://www.youtube.com/@edilan/live" -> "@edilan"
//   "https://www.twitch.tv/edilan"         -> "@edilan"
//   "https://www.youtube.com/c/edilan"     -> "@edilan"
//   "https://bsky.app/profile/edilan.bsky.social" -> "@edilan"
// When no username can be found (e.g. /channel/UC... IDs), the player's
// name is used instead.
function handleFromUrl(url, fallbackName) {
  var path = url.replace(/^[a-z]+:\/\/[^/]+/i, "").replace(/[?#].*$/, "");
  var parts = path.split("/").filter(Boolean);
  var first = (parts[0] || "").toLowerCase();

  // A segment starting with "@" is always the handle (YouTube, TikTok...)
  var handle = parts.filter(function (p) { return p.charAt(0) === "@"; })[0];

  // Otherwise the username is the first segment, or the one after /c/, /user/
  // or /profile/ (Bluesky)
  if (!handle) {
    if (first === "c" || first === "user" || first === "profile") handle = parts[1];
    else if (first !== "channel") handle = parts[0];
  }

  try { handle = handle && decodeURIComponent(handle).replace(/^@/, ""); }
  catch (e) { handle = ""; }

  // Bluesky: "renlay.bsky.social" -> "renlay" (custom domains are kept whole)
  if (handle) handle = handle.replace(/\.bsky\.social$/i, "");

  return "@" + (handle || fallbackName);
}

// Semi-random tilt for the ELIMINATED stamp: between 5 and 16 degrees either
// way, so stamps look different but stay readable. Based on the name, so each
// player always gets the same one.
function stampTilt(name) {
  var hash = 0;
  for (var i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  hash = Math.abs(hash);
  var angle = 5 + (hash % 111) / 10;
  return hash % 2 ? angle : -angle;
}

// "LIVE" badge with the icons of the platforms they are streaming on
function liveBadge(platforms) {
  var badge = document.createElement("span");
  badge.className = "live-badge";
  ["youtube", "twitch"].forEach(function (platform) {
    if (platforms.indexOf(platform) === -1) return;
    var icon = document.createElement("span");
    icon.className = "live-badge__icon";
    icon.innerHTML = ICONS[platform];
    badge.appendChild(icon);
  });
  badge.appendChild(document.createTextNode("LIVE"));
  return badge;
}

function renderGrid(players) {
  grid.innerHTML = "";

  players.forEach(function (player) {
    var tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile tile--player" + (player.dead ? " tile--dead" : "");
    tile.setAttribute("aria-label", player.name);
    tile.setAttribute("data-name", player.name);

    var img = document.createElement("img");
    img.src = PLAYERS_PATH + player["player-icon"];
    img.alt = player.name;
    tile.appendChild(img);

    var platforms = liveNow[player.name];
    if (platforms && platforms.length && !player.dead) {
      tile.classList.add("tile--live");
      tile.appendChild(liveBadge(platforms));
    }

    if (player.dead) {
      var stamp = document.createElement("span");
      stamp.className = "stamp";
      stamp.textContent = "ELIMINATED";
      stamp.style.setProperty("--tilt", stampTilt(player.name) + "deg");
      tile.appendChild(stamp);
    }

    tile.addEventListener("click", function () { openPlayer(player); });
    grid.appendChild(tile);
  });

  // Empty slots for future players
  for (var i = players.length; i < MIN_SLOTS; i++) {
    var empty = document.createElement("div");
    empty.className = "tile";
    grid.appendChild(empty);
  }
}

function openPlayer(player) {
  // Rendered image; falls back to the head if missing
  ovFigure.classList.remove("is-fallback");
  // Renders designed to be cut by the screen edges ("full-image": true)
  ovFigure.classList.toggle("is-full", player["full-image"] === true);
  ovImage.onerror = function () {
    ovImage.onerror = null;
    ovFigure.classList.remove("is-full");
    ovFigure.classList.add("is-fallback");
    ovImage.src = PLAYERS_PATH + player["player-icon"];
  };
  ovImage.src = PLAYERS_PATH + player["player-image"];
  ovImage.alt = player.name;

  ovName.textContent = player.name;

  ovSocials.innerHTML = "";
  var socials = player.socials || {};
  Object.keys(socials).forEach(function (network) {
    var url = socials[network];
    if (!url) return;

    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    a.title = network;
    a.innerHTML = ICONS[network.toLowerCase()] || ICONS.link;
    var label = document.createElement("span");
    label.textContent = handleFromUrl(url, player.name);
    a.appendChild(label);
    li.appendChild(a);
    ovSocials.appendChild(li);
  });

  if (player.dead) {
    ovDeathText.textContent = player["death-text"] || "Eliminated";
    // Link to the clip only when there is one
    var clip = (player["death-clip"] || "").trim();
    if (clip) {
      ovDeath.href = clip;
      ovDeathLink.textContent = "SEE HOW IT HAPPENED →";
    } else {
      ovDeath.removeAttribute("href");
      ovDeathLink.textContent = "NO CLIP AVAILABLE";
    }
    ovDeath.classList.toggle("death--no-clip", !clip);
    ovDeath.hidden = false;
  } else {
    ovDeath.hidden = true;
  }

  overlay.classList.toggle("overlay--dead", !!player.dead);
  fitName();
  // Re-fit once the web fonts are ready (the first open can happen before)
  document.fonts.ready.then(fitName);
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  // Force a reflow so the entry animation always replays
  void overlay.offsetWidth;
  overlay.classList.add("is-open");
}

// Shrink the name until it fits its column
function fitName() {
  ovName.style.fontSize = "";
  var size = parseFloat(getComputedStyle(ovName).fontSize);
  if (!ovName.clientWidth) return;
  while (ovName.scrollWidth > ovName.clientWidth && size > 20) {
    size -= 2;
    ovName.style.fontSize = size + "px";
  }
}

function closePlayer() {
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

overlay.addEventListener("click", function (e) {
  // Clicking anywhere closes the view, except on the name and the links
  if (!e.target.closest("a, .overlay__name")) closePlayer();
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closePlayer();
});

// Live status is optional: if live.json is missing or old, nobody is shown live
var loadLive = fetch("live.json", { cache: "no-cache" })
  .then(function (r) { return r.ok ? r.json() : null; })
  .then(function (data) {
    var checked = data && Date.parse(data.checked);
    if (checked && Date.now() - checked < LIVE_MAX_AGE) liveNow = data.live || {};
  })
  .catch(function () {});

fetch("players.json", { cache: "no-cache" })
  .then(function (r) { return r.json(); })
  .then(function (players) { return loadLive.then(function () { renderGrid(players); }); })
  .catch(function () {
    grid.innerHTML = '<p class="players__msg">Could not load players.json. Open the site from a web server (not file://).</p>';
  });
