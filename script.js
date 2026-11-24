(() => {
  "use strict";

  const root = document.documentElement;
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  /** Display transient toast status feedback. */
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.hidden = true;
    }, 2600);
  }

  /** Copy text to clipboard with fallback for non-HTTPS/file contexts. */
  async function copyToClipboard(text, label) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const helper = document.createElement("textarea");
        helper.value = text;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        document.body.removeChild(helper);
      }
      showToast(`${label} copied to clipboard`);
    } catch {
      showToast(`Unable to copy automatically — please copy manually`);
    }
  }

  /** Theme persistence and toggle handling. */
  function initTheme() {
    const toggleBtn = document.getElementById("theme-toggle");
    const storageKey = "shehzad-portfolio-theme";

    function applyTheme(theme) {
      root.setAttribute("data-theme", theme);
      if (toggleBtn) {
        toggleBtn.setAttribute(
          "aria-label",
          theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
        );
      }
    }

    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved === "light" || saved === "dark") {
        applyTheme(saved);
      }
    } catch {
      // Ignore storage restriction errors in sandboxed contexts
    }

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
        const next = current === "dark" ? "light" : "dark";
        applyTheme(next);
        try {
          window.localStorage.setItem(storageKey, next);
        } catch {
          // Ignore storage restriction errors
        }
      });
    }
  }

  /** Mobile drawer toggle and keyboard escape handling. */
  function initMobileNav() {
    const toggle = document.getElementById("nav-toggle");
    const drawer = document.getElementById("mobile-drawer");
    if (!toggle || !drawer) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      drawer.hidden = !open;
    }

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
    });

    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768 && !drawer.hidden) {
        setOpen(false);
      }
    });

    const mobilePrintBtn = document.getElementById("mobile-print-cv-btn");
    if (mobilePrintBtn) {
      mobilePrintBtn.addEventListener("click", () => {
        setOpen(false);
        window.print();
      });
    }
  }

  /** Print CV button handler. */
  function initPrintButton() {
    const printBtn = document.getElementById("print-cv-btn");
    if (printBtn) {
      printBtn.addEventListener("click", () => window.print());
    }
  }

  /** Work focus-area category filtering. */
  function initWorkFilters() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll("#work-grid .work-card");
    if (!filterButtons.length || !cards.length) return;

    filterButtons.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.classList.contains("active")));

      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter || "all";

        filterButtons.forEach((item) => {
          const isActive = item === btn;
          item.classList.toggle("active", isActive);
          item.setAttribute("aria-pressed", String(isActive));
        });

        cards.forEach((card) => {
          const categories = (card.dataset.category || "").split(/\s+/);
          const visible = filter === "all" || categories.includes(filter);
          card.hidden = !visible;
          if (visible) {
            card.classList.add("is-revealed");
          }
        });
      });
    });
  }

  /** Click-to-copy contact triggers and interactive email draft composer. */
  function initContactUtilities() {
    document.querySelectorAll("[data-copy]").forEach((el) => {
      el.addEventListener("click", () => {
        const value = el.getAttribute("data-copy");
        const label = el.getAttribute("data-label") || "Value";
        if (value) copyToClipboard(value, label);
      });
    });

    const form = document.getElementById("contact-form");
    const copyDraftBtn = document.getElementById("copy-draft-btn");
    if (!form) return;

    function buildDraft() {
      const nameInput = document.getElementById("sender-name");
      const subjectInput = document.getElementById("inquiry-subject");
      const messageInput = document.getElementById("inquiry-message");

      const sender = (nameInput?.value || "").trim() || "Visitor";
      const subject = (subjectInput?.value || "").trim() || "Portfolio Inquiry";
      const message = (messageInput?.value || "").trim();

      const body = `${message}\n\nBest regards,\n${sender}`;
      return { sender, subject, message, body };
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const { subject, body } = buildDraft();
      const mailtoUrl = `mailto:shahzadhussain4595@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
      showToast("Opening email client with your inquiry...");
    });

    if (copyDraftBtn) {
      copyDraftBtn.addEventListener("click", () => {
        const { subject, body } = buildDraft();
        if (!body.trim() || body.startsWith("\n\n")) {
          showToast("Please write a message before copying");
          return;
        }
        const formatted = `To: shahzadhussain4595@gmail.com\nSubject: ${subject}\n\n${body}`;
        copyToClipboard(formatted, "Inquiry draft");
      });
    }
  }

  /** Highlight active navigation link based on scroll position. */
  function initScrollSpy() {
    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll(".primary-nav .nav-link");
    if (!sections.length || !navLinks.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  /** Subtle geometric node graph inside the dossier header canvas. */
  function initNeuralCanvas() {
    const canvas = document.getElementById("neural-canvas");
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodeCount = 22;
    let width = 0;
    let height = 0;
    let animId = null;

    const nodes = Array.from({ length: nodeCount }, (_, idx) => ({
      x: ((idx * 53) % 100) / 100,
      y: ((idx * 37) % 100) / 100,
      vx: (((idx % 5) - 2) * 0.00045) || 0.0003,
      vy: ((((idx + 2) % 5) - 2) * 0.00045) || -0.00025,
      r: (idx % 3) + 1.4
    }));

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawFrame(stepMovement) {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (stepMovement) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0.03 || n.x > 0.97) n.vx *= -1;
          if (n.y < 0.08 || n.y > 0.92) n.vy *= -1;
        }
      }

      const maxDist = 105;
      for (let i = 0; i < nodes.length; i++) {
        const ax = nodes[i].x * width;
        const ay = nodes[i].y * height;

        for (let j = i + 1; j < nodes.length; j++) {
          const bx = nodes[j].x * width;
          const by = nodes[j].y * height;
          const dist = Math.hypot(ax - bx, ay - by);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.35;
            ctx.strokeStyle = `rgba(45, 212, 191, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }

        ctx.fillStyle = "rgba(94, 234, 212, 0.7)";
        ctx.beginPath();
        ctx.arc(ax, ay, nodes[i].r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop() {
      if (!document.hidden) {
        drawFrame(true);
      }
      animId = window.requestAnimationFrame(loop);
    }

    resize();
    drawFrame(false);

    if (!reducedMotion) {
      animId = window.requestAnimationFrame(loop);
    }

    window.addEventListener("resize", () => {
      resize();
      if (reducedMotion) drawFrame(false);
    });

    window.addEventListener("beforeunload", () => {
      if (animId) window.cancelAnimationFrame(animId);
    });
  }

  /** Scroll-reactive header compaction and reading progress bar. */
  function initHeaderEffects() {
    const header = document.querySelector(".site-header");
    const progressEl = document.getElementById("scroll-progress");
    if (!header) return;

    let ticking = false;

    function updateHeader() {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      header.classList.toggle("is-scrolled", scrollY > 18);

      if (progressEl) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;
        progressEl.style.setProperty("--scroll-progress", ratio.toFixed(4));
      }
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateHeader);
          ticking = true;
        }
      },
      { passive: true }
    );

    updateHeader();
  }

  /** Animated typewriter role subtitle in the hero section. */
  function initTypedRole() {
    const target = document.getElementById("typed-role");
    if (!target) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const phrases = [
      "AI/ML & Data Science",
      "Python Developer",
      "Data Cleaning & Preprocessing",
      "Exploratory Data Analysis",
      "Machine Learning Models",
      "Data Visualization & SQL"
    ];

    let phraseIdx = 0;
    let charIdx = phrases[0].length;
    let isDeleting = false;
    let timerId = null;

    function schedule(delay) {
      timerId = window.setTimeout(tick, delay);
    }

    function tick() {
      if (document.hidden) {
        schedule(400);
        return;
      }

      const current = phrases[phraseIdx];

      if (!isDeleting) {
        if (charIdx < current.length) {
          charIdx += 1;
          target.textContent = current.slice(0, charIdx);
          schedule(44);
        } else {
          isDeleting = true;
          schedule(2100);
        }
      } else if (charIdx > 0) {
        charIdx -= 1;
        target.textContent = current.slice(0, charIdx);
        schedule(24);
      } else {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        schedule(320);
      }
    }

    schedule(2400);

    window.addEventListener("beforeunload", () => {
      if (timerId) window.clearTimeout(timerId);
    });
  }

  /** Scroll-triggered entrance animations for sections and cards. */
  function initScrollReveals() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) return;

    const selectors = [
      ".section-head",
      ".about-photo-card",
      ".about-narrative",
      ".timeline-item",
      ".work-card",
      ".work-cta-banner",
      ".skills-panel",
      ".certs-panel",
      ".edu-card",
      ".contact-cards",
      ".contact-form"
    ];

    const targets = Array.from(document.querySelectorAll(selectors.join(", ")));
    if (!targets.length) return;

    targets.forEach((el) => {
      el.setAttribute("data-reveal", "");
      const parent = el.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter((child) =>
          selectors.some((sel) => child.matches(sel))
        );
        const siblingIdx = siblings.indexOf(el);
        if (siblingIdx > 0) {
          el.style.setProperty("--reveal-delay", `${Math.min(siblingIdx, 4) * 70}ms`);
        }
      }
    });

    root.classList.add("js-anim");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    const viewHeight = window.innerHeight || document.documentElement.clientHeight;
    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < viewHeight * 0.95) {
        el.classList.add("is-revealed");
      } else {
        observer.observe(el);
      }
    });
  }

  /** Expand or collapse the full 39-skill LinkedIn inventory. */
  function initSkillsDrawer() {
    const btn = document.getElementById("toggle-all-skills-btn");
    const drawer = document.getElementById("all-skills-drawer");
    if (!btn || !drawer) return;

    btn.addEventListener("click", () => {
      const isExpanded = btn.getAttribute("aria-expanded") === "true";
      const next = !isExpanded;
      btn.setAttribute("aria-expanded", String(next));
      drawer.hidden = !next;
      btn.textContent = next ? "Show fewer skills" : "View all 39 skills";
    });
  }

  /** Keep copyright year current if viewed directly. */
  function initFooterYear() {
    const yearEl = document.getElementById("current-year");
    if (yearEl) {
      yearEl.textContent = String(Math.max(2026, new Date().getFullYear()));
    }
  }

  initTheme();
  initHeaderEffects();
  initMobileNav();
  initPrintButton();
  initTypedRole();
  initScrollReveals();
  initWorkFilters();
  initSkillsDrawer();
  initContactUtilities();
  initScrollSpy();
  initNeuralCanvas();
  initFooterYear();
})();
