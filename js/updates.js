var grid = document.getElementById("curses");
var changelog = document.getElementById("changelog");
var clNumeral = document.getElementById("cl-numeral");
var clName = document.getElementById("cl-name");
var clSummary = document.getElementById("cl-summary");
var clVersions = document.getElementById("cl-versions");

var curses = [];

function roman(n) {
  var numerals = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  var out = "";
  numerals.forEach(function (pair) {
    while (n >= pair[0]) { out += pair[1]; n -= pair[0]; }
  });
  return out;
}

function formatDate(value) {
  if (!value) return "";
  var date = new Date(value);
  if (isNaN(date)) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function el(tag, className, text) {
  var node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function renderGrid() {
  grid.innerHTML = "";

  curses.forEach(function (curse) {
    var card;
    if (curse.released) {
      card = el("button", "curse");
      card.type = "button";
      card.addEventListener("click", function () { openCurse(curse); });
    } else {
      card = el("div", "curse curse--locked");
      card.setAttribute("aria-label", "Curse " + roman(curse.order) + ", locked");
    }

    card.appendChild(el("span", "curse__numeral", roman(curse.order)));
    card.appendChild(el("span", "curse__name", curse.released ? curse.name : "???"));

    if (curse.released) {
      if (curse.summary) card.appendChild(el("span", "curse__summary", curse.summary));
      var latest = curse.versions[0];
      var meta = latest ? "v" + latest.version + " · " + formatDate(latest.date || curse.date) : formatDate(curse.date);
      card.appendChild(el("span", "curse__meta", meta + "  →"));
    } else {
      card.appendChild(el("span", "curse__lock", "Locked"));
    }
    grid.appendChild(card);
  });
}

function renderVersion(version) {
  var block = el("article", "version");
  var head = el("header", "version__head");
  head.appendChild(el("span", "version__number", "v" + version.version));
  if (version.title) head.appendChild(el("span", "version__title", version.title));
  if (version.date) head.appendChild(el("time", "version__date", formatDate(version.date)));
  block.appendChild(head);

  if (version.notes) block.appendChild(el("p", "version__notes", version.notes));

  var list = el("ul", "version__changes");
  version.changes.forEach(function (change) {
    var item = el("li", "change change--" + change.type);
    item.appendChild(el("span", "change__type", change.type));
    var text = el("div", "change__text", change.text);
    if (change.details && change.details.length) {
      var details = el("ul", "change__details");
      change.details.forEach(function (d) { details.appendChild(el("li", "", d)); });
      text.appendChild(details);
    }
    item.appendChild(text);
    list.appendChild(item);
  });
  block.appendChild(list);
  return block;
}

function openCurse(curse) {
  clNumeral.textContent = "Curse " + roman(curse.order);
  clName.textContent = curse.name;
  clSummary.textContent = curse.summary;
  clSummary.hidden = !curse.summary;
  clVersions.innerHTML = "";
  if (curse.versions.length) curse.versions.forEach(function (v) { clVersions.appendChild(renderVersion(v)); });
  else clVersions.appendChild(el("p", "version__notes", "No changes published yet."));

  changelog.querySelector(".changelog__panel").scrollTop = 0;
  changelog.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  void changelog.offsetWidth;
  changelog.classList.add("is-open");
  history.replaceState(null, "", location.pathname + location.search + "#" + curse.id);
  changelog.querySelector(".changelog__close").focus({ preventScroll: true });
}

function closeCurse() {
  if (!changelog.classList.contains("is-open")) return;
  changelog.classList.remove("is-open");
  changelog.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  history.replaceState(null, "", location.pathname + location.search);
}

changelog.addEventListener("click", function (e) {
  if (e.target.closest(".changelog__close") || e.target.classList.contains("changelog__backdrop")) closeCurse();
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeCurse();
});

fetch("updates.json", { cache: "no-cache" })
  .then(function (r) {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  })
  .then(function (data) {
    curses = data.curses.slice().sort(function (a, b) { return a.order - b.order; });
    renderGrid();
    // Open the curse named in the URL (e.g. updates.html#twilight)
    var id = location.hash.slice(1);
    var target = curses.filter(function (c) { return c.released && c.id === id; })[0];
    if (target) openCurse(target);
  })
  .catch(function () {
    grid.innerHTML = '<p class="curses__msg">Could not load the updates. Please try again later.</p>';
  });
