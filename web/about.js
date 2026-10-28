/**
 * Code-Karo.dev — About Page Script
 * Loads and renders the 4 team cards from /team.json
 */
(() => {
  "use strict";

  const linkedInSvg = `
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64c-.88 0-1.6.72-1.6 1.6s.72 1.6 1.6 1.6 1.6-.72 1.6-1.6-.72-1.6-1.6-1.6z"/>
    </svg>
  `;

  const gitHubSvg = `
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  `;

  function renderTeamCard(member) {
    const card = document.createElement("article");
    card.className = "team-card";

    // 1. Photo: aspect-ratio 1 / 1, object-fit cover, object-position from data, no text on photo
    const photoWrap = document.createElement("div");
    photoWrap.className = "team-card__photo-wrap";

    const img = document.createElement("img");
    img.className = "team-card__photo";
    img.src = member.image || "";
    img.alt = member.name || "Team member";
    img.loading = "lazy";
    img.style.objectPosition = member.photoPosition || "center 20%";

    const initialsWrap = document.createElement("div");
    initialsWrap.className = "team-card__initials";
    const initials = (member.name || "")
      .split(" ")
      .filter(Boolean)
      .map(w => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    initialsWrap.textContent = initials;

    img.addEventListener("error", () => {
      img.style.display = "none";
      initialsWrap.style.display = "flex";
    });

    photoWrap.appendChild(img);
    photoWrap.appendChild(initialsWrap);
    card.appendChild(photoWrap);

    // 2. Name, then role
    const nameHeading = document.createElement("h3");
    nameHeading.className = "team-card__name";
    nameHeading.textContent = member.name || "";
    card.appendChild(nameHeading);

    const roleText = (member.role || "").trim();
    if (roleText) {
      const roleP = document.createElement("p");
      roleP.className = "team-card__role";
      roleP.textContent = roleText;
      card.appendChild(roleP);
    }

    // 3. Meta line: "2nd year · BRANCH · COLLEGE", skipping empty parts. Hide if all empty.
    const metaParts = [member.year, member.branch, member.college]
      .map(p => (typeof p === "string" ? p.trim() : ""))
      .filter(Boolean);

    if (metaParts.length > 0) {
      const metaP = document.createElement("p");
      metaP.className = "team-card__meta";
      metaP.textContent = metaParts.join(" · ");
      card.appendChild(metaP);
    }

    // 4. Bio: the "did" text, max 3 lines. Hide if empty.
    const bioText = (member.did || "").trim();
    if (bioText) {
      const bioP = document.createElement("p");
      bioP.className = "team-card__bio";
      bioP.textContent = bioText;
      card.appendChild(bioP);
    }

    // 5. Skill chips. Hide row if empty.
    const skillsList = Array.isArray(member.skills)
      ? member.skills.map(s => (typeof s === "string" ? s.trim() : "")).filter(Boolean)
      : [];

    if (skillsList.length > 0) {
      const chipsWrap = document.createElement("div");
      chipsWrap.className = "team-card__skills";
      skillsList.forEach(skill => {
        const chip = document.createElement("span");
        chip.className = "team-card__chip";
        chip.textContent = skill;
        chipsWrap.appendChild(chip);
      });
      card.appendChild(chipsWrap);
    }

    // 6. Footer row pinned to the bottom (margin-top: auto): 40px round icon-only buttons side by side in ONE row
    const footer = document.createElement("div");
    footer.className = "team-card__footer";

    if (member.linkedin) {
      const inBtn = document.createElement("a");
      inBtn.className = "team-card__btn";
      inBtn.href = member.linkedin;
      inBtn.target = "_blank";
      inBtn.rel = "noopener noreferrer";
      inBtn.setAttribute("aria-label", `${member.name} on LinkedIn`);
      inBtn.innerHTML = linkedInSvg;
      footer.appendChild(inBtn);
    }

    if (member.github) {
      const ghBtn = document.createElement("a");
      ghBtn.className = "team-card__btn";
      ghBtn.href = member.github;
      ghBtn.target = "_blank";
      ghBtn.rel = "noopener noreferrer";
      ghBtn.setAttribute("aria-label", `${member.name} on GitHub`);
      ghBtn.innerHTML = gitHubSvg;
      footer.appendChild(ghBtn);
    }

    card.appendChild(footer);
    return card;
  }

  async function loadTeam() {
    const grid = document.getElementById("team-grid");
    if (!grid) return;

    try {
      const res = await fetch("/team.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const members = await res.json();
      if (Array.isArray(members) && members.length > 0) {
        grid.replaceChildren();
        members.forEach(member => {
          grid.appendChild(renderTeamCard(member));
        });
      }
    } catch (err) {
      console.warn("Could not load dynamic team data:", err);
    }
  }

  // --- Workspace Panel ---
  function getRunnerUrl() {
    try {
      const param = new URLSearchParams(window.location.search).get("runner_url");
      if (param) {
        const clean = param.replace(/\/+$/, "");
        localStorage.setItem("oops_runner_url", clean);
        return clean;
      }
      const stored = localStorage.getItem("oops_runner_url");
      if (stored) return stored.replace(/\/+$/, "");
    } catch (e) {}

    if (window.CONFIG && window.CONFIG.RUNNER_URL) {
      return window.CONFIG.RUNNER_URL.replace(/\/+$/, "");
    }

    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const localUrl = window.location.port
      ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
      : `${window.location.protocol}//${window.location.hostname}:8000`;

    return isLocal ? localUrl : "https://oops-judge.onrender.com";
  }

  function initWorkspace() {
    const panel = document.getElementById("workspace-panel");
    if (!panel) return;

    const statusRow = document.getElementById("workspace-status-row");
    const statusDot = document.getElementById("workspace-status-dot");
    const statusText = document.getElementById("workspace-status-text");

    const problemsCount = document.getElementById("workspace-problems-count");
    const chipsContainer = document.getElementById("workspace-chips");

    const progressVal = document.getElementById("workspace-progress-val");

    const randomBtn = document.getElementById("workspace-random-btn");
    const continueBtn = document.getElementById("workspace-continue-btn");
    const firstBtn = document.getElementById("workspace-first-btn");

    let problemsData = [];
    let isCheckingHealth = false;
    let healthAbortController = null;

    function setStatus(state, message, label) {
      if (statusDot) {
        statusDot.className = `workspace-dot workspace-dot--${state}`;
        statusDot.setAttribute("aria-label", label || state);
      }
      if (statusText) {
        statusText.textContent = message;
      }
    }

    async function checkCompilerHealth() {
      if (isCheckingHealth && healthAbortController) {
        healthAbortController.abort();
      }
      isCheckingHealth = true;
      healthAbortController = new AbortController();
      const signal = healthAbortController.signal;

      setStatus("checking", "checking…", "Checking compiler status");

      const runnerUrl = getRunnerUrl();
      const startTime = performance.now();
      let isTimedOut = false;

      const wakeTimer = setTimeout(() => {
        setStatus("waking", "Waking up…", "Compiler waking up");
      }, 3000);

      const maxTimer = setTimeout(() => {
        isTimedOut = true;
        if (healthAbortController) healthAbortController.abort();
        setStatus("offline", "Compiler offline", "Compiler offline");
        isCheckingHealth = false;
      }, 60000);

      try {
        const res = await fetch(`${runnerUrl}/health`, {
          method: "GET",
          mode: "cors",
          signal,
        });
        clearTimeout(wakeTimer);
        clearTimeout(maxTimer);
        isCheckingHealth = false;

        if (res.ok) {
          const elapsed = Math.round(performance.now() - startTime);
          setStatus("online", `Compiler online · ${elapsed} ms`, "Compiler online");
        } else {
          setStatus("offline", "Compiler offline", "Compiler offline");
        }
      } catch (err) {
        clearTimeout(wakeTimer);
        clearTimeout(maxTimer);
        isCheckingHealth = false;
        if (err.name === "AbortError" && isTimedOut) {
          setStatus("offline", "Compiler offline", "Compiler offline");
        } else if (err.name !== "AbortError") {
          setStatus("offline", "Compiler offline", "Compiler offline");
        }
      }
    }

    if (statusRow) {
      statusRow.addEventListener("click", () => checkCompilerHealth());
      statusRow.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          checkCompilerHealth();
        }
      });
    }

    function getSignedInUser() {
      try {
        const raw = localStorage.getItem("oops_session");
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" && parsed.id ? parsed : null;
      } catch (e) {
        return null;
      }
    }

    function updateButtons(problems, user) {
      if (!problems || problems.length === 0) {
        if (randomBtn) randomBtn.href = "/practice";
        if (continueBtn) continueBtn.hidden = true;
        if (firstBtn) {
          firstBtn.hidden = false;
          firstBtn.textContent = "Start with the first problem";
          firstBtn.href = "/practice";
        }
        return;
      }

      // 1. "Random problem" button: link format /practice?problem=<id>
      const pickRandomHref = () => {
        const p = problems[Math.floor(Math.random() * problems.length)];
        return `/practice?problem=${encodeURIComponent(p.id)}`;
      };

      if (randomBtn) {
        randomBtn.href = pickRandomHref();
        randomBtn.onclick = () => {
          randomBtn.href = pickRandomHref();
        };
      }

      // 2. "Continue" button: attempted-but-unsolved problem
      let attemptedProblem = null;
      if (user && user.id) {
        attemptedProblem = problems.find(p => {
          try {
            const status = localStorage.getItem(`oops_status:${user.id}:${p.id}`);
            if (status === "attempted") return true;
            if (status !== "solved") {
              const subs = localStorage.getItem(`oops_sub:${user.id}:${p.id}`);
              if (subs && subs !== "[]") return true;
              const code = localStorage.getItem(`oops_code_${p.id}`);
              if (code) return true;
            }
          } catch (e) {}
          return false;
        });
      }

      if (attemptedProblem) {
        if (continueBtn) {
          continueBtn.hidden = false;
          continueBtn.textContent = "Continue";
          continueBtn.href = `/practice?problem=${encodeURIComponent(attemptedProblem.id)}`;
        }
        if (firstBtn) firstBtn.hidden = true;
      } else {
        if (continueBtn) continueBtn.hidden = true;
        if (firstBtn) {
          firstBtn.hidden = false;
          firstBtn.textContent = "Start with the first problem";
          firstBtn.href = `/practice?problem=${encodeURIComponent(problems[0].id)}`;
        }
      }
    }

    function updateProgress(problems, user) {
      if (!progressVal) return;
      progressVal.replaceChildren();

      if (!user) {
        const link = document.createElement("a");
        link.className = "workspace-link";
        link.href = "/practice?auth=signin";
        link.textContent = "Sign in to track progress";
        progressVal.appendChild(link);
        return;
      }

      if (!problems || problems.length === 0) {
        progressVal.textContent = "Progress unavailable";
        return;
      }

      let solvedCount = 0;
      problems.forEach(p => {
        try {
          const st = localStorage.getItem(`oops_status:${user.id}:${p.id}`);
          if (st === "solved") solvedCount++;
        } catch (e) {}
      });

      progressVal.textContent = `${solvedCount} / ${problems.length} solved`;
    }

    async function loadProblems() {
      try {
        const res = await fetch("/api/problems");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        problemsData = Array.isArray(data.problems) ? data.problems : [];

        if (problemsCount) {
          problemsCount.textContent = `${problemsData.length} Java problems`;
        }

        if (chipsContainer) {
          chipsContainer.replaceChildren();
          const counts = { Easy: 0, Medium: 0, Hard: 0 };
          let hasDifficulty = false;
          problemsData.forEach(p => {
            if (p.difficulty && Object.prototype.hasOwnProperty.call(counts, p.difficulty)) {
              counts[p.difficulty]++;
              hasDifficulty = true;
            }
          });

          if (hasDifficulty) {
            const diffs = ["Easy", "Medium", "Hard"];
            diffs.forEach((diff, i) => {
              if (i > 0) {
                const sep = document.createElement("span");
                sep.className = "workspace-chip-dot";
                sep.textContent = "·";
                chipsContainer.appendChild(sep);
              }
              const chip = document.createElement("span");
              chip.className = `workspace-chip chip--${diff.toLowerCase()}`;
              chip.textContent = `${diff} ${counts[diff]}`;
              chipsContainer.appendChild(chip);
            });
          }
        }

        const user = getSignedInUser();
        updateProgress(problemsData, user);
        updateButtons(problemsData, user);
      } catch (err) {
        if (problemsCount) problemsCount.textContent = "Problems unavailable";
        if (chipsContainer) chipsContainer.replaceChildren();
        const user = getSignedInUser();
        updateProgress(null, user);
        updateButtons([], user);
      }
    }

    checkCompilerHealth();
    loadProblems();
  }

  function init() {
    loadTeam();
    initWorkspace();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
