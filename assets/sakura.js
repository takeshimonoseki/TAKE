/**
 * Ambient Particle Animation (Dark Theme)
 * Subtle glowing particles floating across the page
 * prefers-reduced-motion: reduce → fully stopped
 * Uses only transform/opacity for performance
 */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var MAX_PARTICLES = 15;
  var container = null;
  var particles = [];
  var rafId = null;

  // Colors for dark theme particles
  var COLORS = [
    "rgba(59, 130, 246, 0.5)",   // blue
    "rgba(99, 102, 241, 0.4)",   // indigo
    "rgba(249, 115, 22, 0.35)",  // orange
    "rgba(14, 165, 233, 0.35)",  // sky
    "rgba(139, 92, 246, 0.3)",   // violet
  ];

  function createParticle() {
    var el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    var color = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.cssText =
      "position:fixed;top:0;left:0;border-radius:50%;" +
      "background:radial-gradient(circle, " + color + " 0%, transparent 70%);" +
      "pointer-events:none;z-index:0;will-change:transform,opacity;" +
      "filter:blur(1px);";
    return el;
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function reset(p) {
    var w = document.documentElement ? document.documentElement.clientWidth : 320;
    p.x = random(0, w);
    p.y = -20;
    p.vy = random(0.08, 0.25);
    p.vx = random(-0.05, 0.05);
    p.angle = random(0, 360);
    p.va = random(-0.2, 0.2);
    p.size = random(4, 10);
    p.opacity = random(0.2, 0.6);
    p.el.style.width = p.size + "px";
    p.el.style.height = p.size + "px";
    p.el.style.transform = "translate(" + p.x + "px," + p.y + "px) rotate(" + p.angle + "deg)";
    p.el.style.opacity = p.opacity;
  }

  function animate() {
    var w = document.documentElement ? document.documentElement.clientWidth : 320;
    var h = document.documentElement ? document.documentElement.clientHeight : 480;
    particles.forEach(function (p) {
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.y * 0.005) * 0.15;
      p.angle += p.va;
      // Gentle pulsing opacity
      p.el.style.opacity = p.opacity + Math.sin(p.y * 0.01) * 0.1;
      p.el.style.transform = "translate(" + p.x + "px," + p.y + "px) rotate(" + p.angle + "deg)";
      if (p.y > h + 30 || p.x < -50 || p.x > w + 50) reset(p);
    });
    rafId = requestAnimationFrame(animate);
  }

  function start() {
    if (container) return;
    container = document.createElement("div");
    container.setAttribute("aria-hidden", "true");
    container.id = "sakura-container";
    container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;";
    document.body.appendChild(container);

    for (var i = 0; i < MAX_PARTICLES; i++) {
      var el = createParticle();
      container.appendChild(el);
      var p = { el: el, x: 0, y: 0, vx: 0, vy: 0.15, angle: 0, va: 0, size: 6, opacity: 0.4 };
      reset(p);
      // Stagger initial positions so particles don't all start at the top
      p.y = random(-20, document.documentElement ? document.documentElement.clientHeight : 480);
      particles.push(p);
    }
    rafId = requestAnimationFrame(animate);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
