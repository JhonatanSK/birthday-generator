(() => {
  "use strict";

  const DEFAULT_VIDEO_ID = "AWiGJBIFJSc"; // Troque aqui o ID padrao do video do YouTube.

  const MESSAGES = [
    "Que seu dia seja leve, divertido e cheio de surpresas boas!",
    "Hoje e dia de celebrar voce. Parabens e tudo de melhor!",
    "Muita alegria, saude e boas energias para o seu novo ciclo!",
  ];

  const CHIPS = [
    "Bolo gigante",
    "Confete",
    "Felicidade",
    "Memorias",
    "Sorrisos",
    "Aventuras",
    "Brilho",
    "Carinho",
    "Abracos",
    "Dias melhores",
  ];

  // Memes sao carregados de assets/memes.json (gerado automaticamente).
  const MEME_INDEX_URL = "assets/memes.json";
  let memeIndexCache = null;

  const toastEl = document.getElementById("toast");

  function safeText(value) {
    return String(value || "").replace(/[<>"'`]/g, "");
  }

  function capName(value) {
    const cleaned = safeText(value).trim();
    if (!cleaned) return "";
    return cleaned
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return safeText(params.get(name));
  }

  function normalizeKey(value) {
    return safeText(value).trim().toLowerCase();
  }

  function buildUrl({ nome, de, v, m }) {
    const basePath = window.location.pathname.replace(/\/[^/]*$/, "/");
    const params = [`nome=${encodeURIComponent(nome)}`];
    if (de) params.push(`de=${encodeURIComponent(de)}`);
    if (v) params.push(`v=${encodeURIComponent(v)}`);
    if (m) params.push(`m=${encodeURIComponent(m)}`);
    return `${window.location.origin}${basePath}parabens.html?${params.join("&")}`;
  }

  function normalizeMemeIndex(data) {
    const defaults = Array.isArray(data?.default) ? data.default : [];
    const rawSpecials = data && typeof data.special === "object" ? data.special : {};
    const specials = {};

    Object.keys(rawSpecials).forEach((key) => {
      const normalized = normalizeKey(key);
      const list = Array.isArray(rawSpecials[key]) ? rawSpecials[key] : [];
      if (list.length) {
        specials[normalized] = list;
      }
    });

    return { default: defaults, special: specials };
  }

  function loadMemesIndex() {
    if (memeIndexCache) return Promise.resolve(memeIndexCache);
    return fetch(MEME_INDEX_URL)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        memeIndexCache = normalizeMemeIndex(data);
        return memeIndexCache;
      })
      .catch(() => {
        memeIndexCache = { default: [], special: {} };
        return memeIndexCache;
      });
  }

  function getMemesForName(nome, memeIndex) {
    const key = normalizeKey(nome);
    const list = memeIndex.special[key] || memeIndex.default;
    return Array.isArray(list) && list.length ? list : [];
  }

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function parseLimit(value) {
    const numeric = Number.parseInt(String(value || "").trim(), 10);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  }

  function shuffle(list) {
    const result = [...list];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function createMemeNode(src, index) {
    const figure = document.createElement("figure");
    figure.className = "meme-card meme-card--floating";
    figure.style.top = `${randomRange(4, 60)}%`;
    figure.style.left = `${randomRange(4, 78)}%`;
    figure.style.animationDuration = `${randomRange(14, 22)}s`;
    figure.style.animationDelay = `${randomRange(-8, 0)}s`;
    figure.style.setProperty("--x1", `${randomRange(-35, 35)}vw`);
    figure.style.setProperty("--y1", `${randomRange(-18, 22)}vh`);
    figure.style.setProperty("--x2", `${randomRange(-35, 35)}vw`);
    figure.style.setProperty("--y2", `${randomRange(-18, 24)}vh`);
    figure.style.setProperty("--x3", `${randomRange(-35, 35)}vw`);
    figure.style.setProperty("--y3", `${randomRange(-18, 24)}vh`);
    figure.style.setProperty("--r1", `${randomRange(-6, 6)}deg`);
    figure.style.setProperty("--r2", `${randomRange(-6, 6)}deg`);
    figure.style.setProperty("--r3", `${randomRange(-6, 6)}deg`);
    figure.style.setProperty("--r4", `${randomRange(-6, 6)}deg`);

    if (src.startsWith("embed:")) {
      const iframe = document.createElement("iframe");
      iframe.src = src.replace("embed:", "");
      iframe.title = `Meme ${index + 1}`;
      iframe.allow = "autoplay; fullscreen";
      iframe.loading = "lazy";
      figure.appendChild(iframe);
      return figure;
    }

    const img = document.createElement("img");
    img.src = src;
    img.alt = `Meme ${index + 1}`;
    img.dataset.fallback = src;
    figure.appendChild(img);
    return figure;
  }

  function renderMemes(nome, limit, memeIndex) {
    const container = document.getElementById("meme-container");
    if (!container) return;
    const specials = memeIndex.special[normalizeKey(nome)] || null;
    const defaults = memeIndex.default;
    let memes = [];

    if (specials && specials.length) {
      if (limit && specials.length > limit) {
        memes = shuffle(specials).slice(0, limit);
      } else if (limit && specials.length < limit) {
        const extraCount = limit - specials.length;
        const extras = shuffle(defaults).filter((src) => !specials.includes(src));
        memes = specials.concat(extras.slice(0, extraCount));
      } else {
        memes = specials;
      }
    } else if (limit) {
      memes = shuffle(getMemesForName(nome, memeIndex)).slice(0, limit);
    } else {
      memes = getMemesForName(nome, memeIndex);
    }

    container.innerHTML = "";
    memes.forEach((src, index) => {
      container.appendChild(createMemeNode(src, index));
    });
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise((resolve, reject) => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  function showToast(message, duration = 2000) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toastEl.classList.remove("show");
    }, duration);
  }

  function initGeneratorPage() {
    const form = document.getElementById("generator-form");
    if (!form) return;

    const result = document.getElementById("result");
    const resultLink = document.getElementById("result-link");
    const copyBtn = document.getElementById("copy-link");
    const openLink = document.getElementById("open-link");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const nome = capName(form.nome.value);
      const de = capName(form.de.value);
      const v = safeText(form.v.value.trim());
      const m = parseLimit(form.m.value);

      if (!nome) return;

      const link = buildUrl({ nome, de, v, m });

      resultLink.value = link;
      openLink.href = link;
      result.classList.remove("hidden");
    });

    copyBtn.addEventListener("click", () => {
      if (!resultLink.value) return;
      copyToClipboard(resultLink.value)
        .then(() => showToast("Link copiado ✅"))
        .catch(() => showToast("Nao foi possivel copiar"));
    });
  }

  function initParabensPage() {
    const page = document.getElementById("parabens-page");
    if (!page) return;

    const headline = document.getElementById("headline");
    const message = document.getElementById("message");
    const chips = document.getElementById("chips");
    const signature = document.getElementById("signature");
    const missingName = document.getElementById("missing-name");
    const frame = document.getElementById("yt-frame");
    const copyBtn = document.getElementById("copy-current");

    const nomeParam = getParam("nome");
    const deParam = getParam("de");
    const vParam = getParam("v");
    const limitParam = parseLimit(getParam("m"));

    const nome = capName(nomeParam) || "amigo(a)";

    if (!nomeParam) {
      missingName.classList.remove("hidden");
    }

    headline.textContent = `Parabens, ${nome}! 🎉`;
    message.textContent = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

    const selected = [...CHIPS].sort(() => 0.5 - Math.random()).slice(0, 4);
    chips.innerHTML = "";
    selected.forEach((label) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = label;
      chips.appendChild(chip);
    });

    if (deParam) {
      signature.textContent = `Com carinho, ${capName(deParam)}`;
      signature.classList.remove("hidden");
    }

    const videoId = vParam || DEFAULT_VIDEO_ID;
    const baseVideoUrl = `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1&loop=1&playlist=${videoId}`;
    frame.src = `${baseVideoUrl}&mute=1`;
    let unmuted = false;

    loadMemesIndex().then((index) => {
      renderMemes(nomeParam || "", limitParam, index);
    });

    function enableSound() {
      if (unmuted) return;
      unmuted = true;
      frame.src = `${baseVideoUrl}&mute=0`;
      showToast("Som ativado 🔊");
    }

    showToast("Clique na tela para ativar o som", 3500);

    document.addEventListener("click", enableSound, { once: true });

    copyBtn.addEventListener("click", () => {
      copyToClipboard(window.location.href)
        .then(() => showToast("Link copiado ✅"))
        .catch(() => showToast("Nao foi possivel copiar"));
    });

    document.querySelectorAll("img[data-fallback]").forEach((img) => {
      img.addEventListener("error", () => {
        const parent = img.closest(".meme-card");
        if (!parent) return;
        parent.textContent = `Arquivo ausente: ${img.dataset.fallback}`;
        parent.style.color = "#9aa3b2";
        parent.style.fontSize = "0.85rem";
        parent.style.padding = "16px";
      });
    });
  }

  initGeneratorPage();
  initParabensPage();
})();
