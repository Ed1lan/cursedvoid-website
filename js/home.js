// Home page: scroll-driven transition between the intro screen (title on top,
// portal and skull centered) and the two-column layout. The page itself never
// scrolls; wheel, touch and keyboard input move a progress value from 0
// (intro) to 1 (layout) and back.

var hero = document.querySelector(".hero");
var visual = document.querySelector(".hero__visual");
var title = document.querySelector(".hero__title");
var desc = document.querySelector(".hero__desc");
var count = document.querySelector(".hero__count");
var button = document.querySelector(".btn-more");
var hint = document.querySelector(".hero__hint");

var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

var progress = 0;   // value shown on screen
var target = 0;     // value the input is asking for
var direction = 0;  // last scroll direction (1 down, -1 up)
var snapTimer = null;
var rafId = null;
var layout = null;  // measured positions, see measure()

function clamp(v) { return Math.min(1, Math.max(0, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
// Progress of a sub-range [from, to] of the whole transition
function phase(p, from, to) { return ease(clamp((p - from) / (to - from))); }

// Final layout position of an element (offset* values ignore transforms)
function box(el) {
  var left = 0, top = 0, node = el;
  while (node) { left += node.offsetLeft; top += node.offsetTop; node = node.offsetParent; }
  return { left: left, top: top, width: el.offsetWidth, height: el.offsetHeight };
}

// Where the title and the visual sit in the intro, as a translate + scale
// from their final layout position
function measure() {
  var vw = hero.clientWidth;
  var vh = hero.clientHeight;
  var mobile = vw <= 860;

  var t = box(title);
  // Intro title width: 38% of the screen (90% on mobile), like the reference
  var titleScale = (mobile ? .9 : .38) * vw / t.width;
  var titleLeft = (vw - t.width * titleScale) / 2;
  var titleTop = vh * .05;
  var titleBottom = titleTop + t.height * titleScale;

  var v = box(visual);
  // Big centered portal; the skull (top ~30% into the image) stays below the title
  var centerY = vh * .56;
  // (on mobile the faded portal edges may go past the screen sides)
  var size = Math.min(vh * .95, vw * (mobile ? 1.3 : .95), (centerY - titleBottom - 10) / .32);

  layout = {
    title: { x: titleLeft - t.left, y: titleTop - t.top, s: titleScale },
    visual: { x: vw / 2 - size / 2 - v.left, y: centerY - size / 2 - v.top, s: size / v.width },
    vw: vw,
    vh: vh
  };
}

function render() {
  var p = progress;
  var move = phase(p, 0, .7);   // title and skull
  var side = phase(p, .3, .85); // description and counter, from the right
  var up = phase(p, .5, 1);     // SEE MORE, from the bottom

  var t = layout.title, v = layout.visual;
  title.style.transform = "translate(" + lerp(t.x, 0, move) + "px," + lerp(t.y, 0, move) + "px) scale(" + lerp(t.s, 1, move) + ")";
  visual.style.transform = "translate(" + lerp(v.x, 0, move) + "px," + lerp(v.y, 0, move) + "px) scale(" + lerp(v.s, 1, move) + ")";

  var fromRight = (1 - side) * layout.vw * .6;
  desc.style.transform = count.style.transform = "translateX(" + fromRight + "px)";
  desc.style.opacity = count.style.opacity = side;

  button.style.transform = "translateY(" + (1 - up) * layout.vh * .4 + "px)";
  button.style.opacity = up;
  // Hidden parts can't be clicked
  button.style.visibility = up > 0 ? "" : "hidden";

  var hintVisible = clamp(1 - p * 4);
  hint.style.opacity = hintVisible;
  hint.style.visibility = hintVisible > 0 ? "" : "hidden";
}

// Eases progress toward target; time-based so it feels the same at any frame rate
var lastTime = 0;
function tick(now) {
  // (the first frame's timestamp can be slightly before lastTime)
  var dt = Math.min(Math.max(now - lastTime, 0), 100);
  lastTime = now;
  var step = reduceMotion ? 1 : 1 - Math.exp(-dt / 180);
  progress = lerp(progress, target, step);
  if (Math.abs(target - progress) < .001) progress = target;
  render();
  rafId = progress === target ? null : requestAnimationFrame(tick);
}

function setTarget(value) {
  target = clamp(value);
  if (!rafId) {
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  // When the input stops, finish the transition in the last direction
  clearTimeout(snapTimer);
  snapTimer = setTimeout(function () {
    if (direction > 0 && target > .05) setTarget(1);
    else if (direction < 0 && target < .95) setTarget(0);
  }, 180);
}

function scrollBy(delta) {
  if (!delta) return;
  direction = delta > 0 ? 1 : -1;
  setTarget(target + delta / (layout.vh * .9));
}

window.addEventListener("wheel", function (e) {
  var delta = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? layout.vh : 1);
  scrollBy(delta);
}, { passive: true });

var touchY = null;
window.addEventListener("touchstart", function (e) { touchY = e.touches[0].clientY; }, { passive: true });
window.addEventListener("touchmove", function (e) {
  if (touchY === null) return;
  var y = e.touches[0].clientY;
  scrollBy((touchY - y) * 1.5);
  touchY = y;
}, { passive: true });
window.addEventListener("touchend", function () { touchY = null; });

window.addEventListener("keydown", function (e) {
  var next = { ArrowDown: 1, PageDown: 1, End: 1, " ": 1, ArrowUp: -1, PageUp: -1, Home: -1 }[e.key];
  if (!next) return;
  direction = next;
  setTarget(next > 0 ? 1 : 0);
});

// The scroll hint is also a button
hint.addEventListener("click", function () { direction = 1; setTarget(1); });

// Tabbing to the text or SEE MORE shows the layout
hero.addEventListener("focusin", function (e) {
  if (e.target === hint) return;
  direction = 1;
  setTarget(1);
});

window.addEventListener("resize", function () { measure(); render(); });

measure();
render();
// Fonts change the title size once loaded
document.fonts.ready.then(function () { measure(); render(); });
