"use strict";

let obiWanTimeout;

const playAudio = () => {
  let kenobiAudio = new Audio("assets/audio/kenobi-greeting.mp3");
  kenobiAudio.volume = 0.3;
  kenobiAudio.play();

  const obiWan = document.getElementById("obi-wan");
  obiWan.classList.add("show");
  clearTimeout(obiWanTimeout);
  obiWanTimeout = setTimeout(() => obiWan.classList.remove("show"), 2500);
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

  const BOOT_COMMAND = "whoami";
  const BOOT_TYPE_SPEED = 70;
  const BOOT_PAUSE_BEFORE_REVEAL = 350;
  const BOOT_PAUSE_AFTER_REVEAL = 1400;

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

  // Boot sequence: type `whoami`, reveal the page as its output,
  // then hand the prompt over to the rotating typewriter above.
  const boot = () => {
    text = BOOT_COMMAND.slice(0, text.length + 1);
    el.textContent = text;
    if (text !== BOOT_COMMAND) {
      setTimeout(boot, BOOT_TYPE_SPEED);
      return;
    }
    setTimeout(() => {
      document.documentElement.classList.remove("booting");
      try {
        sessionStorage.setItem("booted", "1");
      } catch (e) {}
      i = -1;
      typing = false;
      setTimeout(tick, BOOT_PAUSE_AFTER_REVEAL);
    }, BOOT_PAUSE_BEFORE_REVEAL);
  };

  if (document.documentElement.classList.contains("booting")) {
    setTimeout(boot, 300);
  } else {
    setTimeout(tick, 800);
  }
})();

// Status bar clock (Puerto Rico time)
(() => {
  const el = document.getElementById("clock");
  if (!el) return;

  const fmt = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Puerto_Rico",
  });
  const update = () => (el.textContent = fmt.format(new Date()));
  update();
  setInterval(update, 15000);
})();

// Interactive shell
(() => {
  const form = document.getElementById("shell-form");
  const input = document.getElementById("shell-input");
  const output = document.getElementById("shell-output");
  if (!form || !input || !output) return;

  const RESUME = "/assets/resume/Nordiel E. Martinez Cardona- Resume2026.pdf";
  const LINKS = {
    github: "https://github.com/nordiel",
    linkedin: "https://www.linkedin.com/in/nordielmartinez/",
    x: "https://x.com/nxrdiel",
    email: "mailto:nordielm@gmail.com",
  };
  // Things you can `cd`, `cat` or `open`, and the section they scroll to.
  const SECTIONS = {
    "experience.log": "experience",
    "projects/": "projects",
    "writing/": "writing",
    "music/": "music",
  };
  const FILES = [...Object.keys(SECTIONS), "resume.pdf", "contact.txt"];

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const history = [];
  let historyIndex = 0;
  let navigated = false;

  // Each line is a list of parts: plain strings, or {text, cls, href}.
  const print = (...lines) => {
    for (const parts of lines) {
      const line = document.createElement("div");
      for (const part of [].concat(parts)) {
        if (typeof part === "string") {
          line.append(part);
          continue;
        }
        const node = document.createElement(part.href ? "a" : "span");
        node.textContent = part.text;
        if (part.cls) node.className = part.cls;
        if (part.href) {
          node.href = part.href;
          node.target = "_blank";
          node.rel = "noopener";
        }
        line.append(node);
      }
      output.append(line);
    }
  };

  const go = (id) => {
    navigated = true;
    document.getElementById(id).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    return [{ text: "→ ", cls: "ok" }, `jumped to ${id}`];
  };

  const open = (url, label) => {
    window.open(url, "_blank", "noopener");
    return [{ text: "→ ", cls: "ok" }, "opening ", { text: label, href: url }];
  };

  const resolve = (name) => {
    const n = (name || "").replace(/^~?\/?/, "").toLowerCase();
    return FILES.find((f) => f === n || f.replace(/[./].*$/, "") === n.replace(/\/$/, ""));
  };

  const openFile = (name) => {
    const file = resolve(name);
    if (!file) return [[{ text: `no such file or directory: ${name || ""}`, cls: "err" }]];
    if (file === "resume.pdf") return [open(RESUME, "resume.pdf")];
    if (file === "contact.txt") return commands.contact.run();
    return [go(SECTIONS[file])];
  };

  const commands = {
    help: {
      desc: "list commands",
      run: () => {
        const lines = [["available commands:"]];
        for (const [name, cmd] of Object.entries(commands)) {
          if (cmd.hidden) continue;
          lines.push([{ text: `  ${name.padEnd(11)}`, cls: "key" }, cmd.desc]);
        }
        lines.push(["tip: tab completes, ↑/↓ walks history."]);
        return lines;
      },
    },
    whoami: {
      desc: "who is this guy?",
      run: () => [
        [{ text: "Nordiel E. Martínez Cardona", cls: "cmd" }],
        ["developer from Puerto Rico 🇵🇷, finishing a CS B.S. at Inter Bayamón."],
        ["into data-driven projects, AI/ML, and things that make sense… most of the time."],
      ],
    },
    ls: {
      desc: "list what's here",
      run: () => [FILES.flatMap((f) => [{ text: f, cls: f.endsWith("/") ? "key" : "" }, "  "])],
    },
    cd: { desc: "jump to a section (cd projects)", run: (args) => openFile(args[0]) },
    cat: { desc: "read a file (cat contact.txt)", run: (args) => openFile(args[0]) },
    open: { desc: "open a file or link", run: (args) => (LINKS[args[0]] ? [open(LINKS[args[0]], args[0])] : openFile(args[0])) },
    experience: { desc: "where I've worked", run: () => [go("experience")] },
    projects: { desc: "things I've built", run: () => [go("projects")] },
    writing: { desc: "things I've written", run: () => [go("writing")] },
    music: { desc: "what I'm listening to", run: () => [go("music")] },
    resume: { desc: "open my resume", run: () => [open(RESUME, "resume.pdf")] },
    contact: {
      desc: "how to reach me",
      run: () => [
        [{ text: "email     ", cls: "key" }, { text: "nordielm@gmail.com", href: LINKS.email }],
        [{ text: "github    ", cls: "key" }, { text: "github.com/nordiel", href: LINKS.github }],
        [{ text: "linkedin  ", cls: "key" }, { text: "in/nordielmartinez", href: LINKS.linkedin }],
        [{ text: "x         ", cls: "key" }, { text: "@nxrdiel", href: LINKS.x }],
      ],
    },
    github: { desc: "open GitHub", run: () => [open(LINKS.github, "github")] },
    linkedin: { desc: "open LinkedIn", run: () => [open(LINKS.linkedin, "linkedin")] },
    theme: {
      desc: "toggle light/dark",
      run: () => {
        toggleTheme();
        return [[`theme: ${document.documentElement.dataset.theme === "light" ? "light" : "dark"}`]];
      },
    },
    date: { desc: "time in Puerto Rico", run: () => [[new Date().toLocaleString("en-US", { timeZone: "America/Puerto_Rico" }) + " AST"]] },
    echo: { desc: "say something", run: (args) => [[args.join(" ")]] },
    history: { desc: "past commands", run: () => history.map((h, n) => [`  ${String(n + 1).padStart(3)}  ${h}`]) },
    clear: { desc: "clear the screen", run: () => (output.replaceChildren(), []) },
    hello: {
      hidden: true,
      run: () => {
        playAudio();
        return [[{ text: "General Kenobi!", cls: "ok" }]];
      },
    },
    sudo: {
      hidden: true,
      run: (args) =>
        args.join(" ") === "hire-me"
          ? [[{ text: "permission granted. ", cls: "ok" }, "let's talk → ", { text: "nordielm@gmail.com", href: LINKS.email }]]
          : [[{ text: "nordiel is not in the sudoers file. This incident will be reported.", cls: "err" }]],
    },
    rm: { hidden: true, run: () => [["nice try."]] },
    exit: { hidden: true, run: () => [["there is no escape. try ", { text: "help", cls: "key" }, "."]] },
  };
  commands.x = { hidden: true, run: () => [open(LINKS.x, "x")] };
  commands.email = { hidden: true, run: () => commands.contact.run() };

  const run = (raw) => {
    const line = raw.trim();
    print([{ text: "nordiel@dev:~$ ", cls: "ps1" }, { text: line, cls: "cmd" }]);
    if (!line) return;

    history.push(line);
    historyIndex = history.length;

    const [name, ...args] = line.split(/\s+/);
    const cmd = commands[name.toLowerCase()];
    if (!cmd) {
      print([{ text: `zsh: command not found: ${name}`, cls: "err" }, " — try ", { text: "help", cls: "key" }]);
      return;
    }
    print(...cmd.run(args));
  };

  const complete = (value) => {
    const parts = value.split(/\s+/);
    const pool = parts.length > 1 ? [...FILES, ...Object.keys(LINKS)] : Object.keys(commands).filter((c) => !commands[c].hidden);
    const word = parts[parts.length - 1].toLowerCase();
    const matches = pool.filter((p) => p.startsWith(word));
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      return parts.join(" ") + (parts.length === 1 ? " " : "");
    }
    if (matches.length > 1) print([matches.join("  ")]);
    return value;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    navigated = false;
    run(input.value);
    input.value = "";
    // Keep the prompt in view, unless the command just scrolled somewhere else.
    if (!navigated) input.scrollIntoView({ block: "nearest" });
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && input.value) {
      e.preventDefault();
      input.value = complete(input.value);
    } else if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex];
    } else if (e.key === "ArrowDown" && history.length) {
      e.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] || "";
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      output.replaceChildren();
    }
  });

  // Press / anywhere to jump to the prompt
  document.addEventListener("keydown", (e) => {
    const t = e.target;
    if (e.key !== "/" || t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
    e.preventDefault();
    input.focus({ preventScroll: true });
    input.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  });
})();
