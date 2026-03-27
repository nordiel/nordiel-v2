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
