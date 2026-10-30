/* Melhorias progressivas: o conteúdo continua disponível sem JavaScript. */
(() => {
  "use strict";
  document.documentElement.classList.add("js-enabled");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  menuButton.hidden = false;
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  };
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener("click", event => {
    if (!event.target.closest(".site-header")) closeMenu();
  });
  window.matchMedia("(min-width: 901px)").addEventListener("change", closeMenu);

  const filters = document.querySelector(".filters");
  const entries = [...document.querySelectorAll(".timeline-item")];
  filters.hidden = false;
  filters.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filters.querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      let count = 0;
      entries.forEach(entry => {
        entry.hidden = filter !== "todos" && entry.dataset.category !== filter;
        if (!entry.hidden) count += 1;
      });
      document.getElementById("timeline-status").textContent = `${count} etapas apresentadas: ${button.textContent}.`;
    });
  });

  if ("IntersectionObserver" in window) {
    const navLinks = [...nav.querySelectorAll("a")];
    const sections = navLinks.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    const observer = new IntersectionObserver(records => {
      records.forEach(record => {
        if (!record.isIntersecting) return;
        navLinks.forEach(link => {
          if (link.getAttribute("href") === `#${record.target.id}`) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, {rootMargin: "-15% 0px -55% 0px", threshold: 0});
    sections.forEach(section => observer.observe(section));
    observer.observe(document.getElementById("inicio"));
  }

  const config = window.PORTFOLIO_CONFIG || {};
  // Só ligações de perfil público, sem parâmetros de seguimento.
  if (typeof config.linkedinUrl === "string" && config.linkedinUrl.trim()) {
    try {
      const url = new URL(config.linkedinUrl.trim());
      if (url.protocol === "https:" && ["www.linkedin.com", "linkedin.com"].includes(url.hostname) && /^\/in\/[^/]+\/?$/.test(url.pathname) && !url.username && !url.password) {
        url.search = "";
        url.hash = "";
        const link = document.getElementById("linkedin-link");
        link.href = url.href;
        link.hidden = false;
        document.getElementById("linkedin-pending").hidden = true;
      }
    } catch { /* Um endereço inválido mantém a indicação de perfil pendente. */ }
  }

  // Conteúdos multimédia locais: sem cookies nem pedidos a plataformas externas.
  const localMedia = (value, extension) => typeof value === "string" &&
    /^assets\/media\/[a-zA-Z0-9_./-]+$/.test(value) &&
    !value.split("/").includes("..") && extension.test(value);
  if (localMedia(config.videoSrc, /\.(mp4|webm)$/i)) {
    const video = document.getElementById("pitch-video");
    const player = document.getElementById("pitch-player");
    const placeholder = document.getElementById("pitch-placeholder");
    video.src = config.videoSrc;
    if (localMedia(config.videoPoster, /\.(jpg|jpeg|png|webp)$/i)) video.poster = config.videoPoster;
    if (localMedia(config.videoCaptions, /\.vtt$/i)) {
      const track = document.createElement("track");
      track.kind = "captions";
      track.label = "Português";
      track.srclang = "pt";
      track.src = config.videoCaptions;
      track.default = true;
      video.append(track);
    }
    if (localMedia(config.videoTranscript, /\.(txt|html|pdf)$/i)) {
      const transcript = document.getElementById("pitch-transcript");
      transcript.href = config.videoTranscript;
      transcript.hidden = false;
    }
    video.addEventListener("error", () => {document.getElementById("video-error").hidden = false;});
    player.hidden = false;
    if (placeholder) placeholder.hidden = true;
  }
})();
