"use strict";

const playAudio = () => {
  let kenobiAudio = new Audio("assets/audio/kenobi-greeting.mp3");
  kenobiAudio.volume = 0.3;
  kenobiAudio.play();
};

const toggleTheme = () => {
  const isLight = document.documentElement.dataset.theme === "light";
  document.documentElement.dataset.theme = isLight ? "" : "light";
  localStorage.setItem("theme", isLight ? "dark" : "light");
  document.getElementById("icon-moon").style.display = isLight
    ? "block"
    : "none";
  document.getElementById("icon-sun").style.display = isLight
    ? "none"
    : "block";
};

// Apply saved theme on load
(() => {
  const saved = localStorage.getItem("theme");
  if (saved === "light") {
    document.documentElement.dataset.theme = "light";
    document.getElementById("icon-moon").style.display = "none";
    document.getElementById("icon-sun").style.display = "block";
  }
})();

// Typewriter effect
(() => {
  const commands = [
    "a Developer",
    "a Musician",
    "Creative",
    "a Problem Solver",
    "curious",
    "a CS Student",
    "always learning",
    "Photographer",
  ];

  const el = document.getElementById("typed-text");
  if (!el) return;

  let i = 0;
  let typing = true;
  let text = "";

  const TYPE_SPEED = 80;
  const DELETE_SPEED = 40;
  const PAUSE_AFTER_TYPE = 1800;
  const PAUSE_AFTER_DELETE = 400;

  const tick = () => {
    const current = commands[i];

    if (typing) {
      text = current.slice(0, text.length + 1);
      el.textContent = text;
      if (text === current) {
        typing = false;
        setTimeout(tick, PAUSE_AFTER_TYPE);
      } else {
        setTimeout(tick, TYPE_SPEED);
      }
    } else {
      text = text.slice(0, -1);
      el.textContent = text;
      if (text === "") {
        typing = true;
        i = (i + 1) % commands.length;
        setTimeout(tick, PAUSE_AFTER_DELETE);
      } else {
        setTimeout(tick, DELETE_SPEED);
      }
    }
  };

  setTimeout(tick, 800);
})();
