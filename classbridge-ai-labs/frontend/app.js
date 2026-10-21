const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const STORAGE_KEY = "classbridge-demo-v1";
let currentActivity = "fractions";
let quizChecked = false;

const activities = {
  fractions: {
    title: "Explore fractions",
    subject: "Mathematics",
    level: "PRIMARY MATHEMATICS",
    intro:
      "Change how many equal parts make up a whole. Notice how the fraction changes.",
    tutor:
      "A fraction describes equal parts of a whole. Change the number of parts and how many are shaded, then compare the fraction.",
    prompts: [
      "Explain the numerator",
      "What is the denominator?",
      "Give me a hint",
    ],
    quiz: {
      q: "If a whole is divided into 4 equal parts and 1 part is shaded, what fraction is shaded?",
      options: ["1/2", "1/4", "4/1"],
      correct: 1,
      explanation:
        "The denominator is the total number of equal parts (4); the numerator is the shaded part (1).",
    },
  },
  "water-cycle": {
    title: "Discover the water cycle",
    subject: "Science",
    level: "PRIMARY SCIENCE",
    intro:
      "Explore how the Sun's energy, clouds and rainfall are connected in the water cycle.",
    tutor:
      "The water cycle describes how water moves between Earth's surface and the atmosphere. Explore how warming water relates to evaporation.",
    prompts: [
      "Explain evaporation",
      "What causes condensation?",
      "Give me a hint",
    ],
    quiz: {
      q: "What is the process called when liquid water changes into water vapour?",
      options: ["Precipitation", "Evaporation", "Condensation"],
      correct: 1,
      explanation:
        "Evaporation is the change from liquid water to water vapour. In nature, energy from the Sun helps drive this process.",
    },
  },
  reaction: {
    title: "Reaction observation",
    subject: "Chemistry",
    level: "SECONDARY CHEMISTRY",
    intro:
      "Model a small-scale vinegar and baking soda reaction and practise recording observations.",
    tutor:
      "When vinegar (which contains acetic acid) and baking soda (sodium bicarbonate) react, carbon dioxide gas is produced. This model illustrates bubbling, not measured laboratory data.",
    prompts: [
      "Why are bubbles formed?",
      "Identify the reactants",
      "Give me a hint",
    ],
    quiz: {
      q: "Which gas is commonly produced in the vinegar and baking soda reaction?",
      options: ["Oxygen", "Carbon dioxide", "Helium"],
      correct: 1,
      explanation:
        "The reaction produces carbon dioxide gas, which appears as bubbles. This is a simplified conceptual model.",
    },
  },
};

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}
function setProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function saveAttempt(activityId, extra = {}) {
  const data = getProgress();
  data[activityId] = {
    ...(data[activityId] || {}),
    ...extra,
    title: activities[activityId].title,
    subject: activities[activityId].subject,
    updatedAt: new Date().toISOString(),
  };
  setProgress(data);
  updateTeacherDashboard();
}
function setView(view) {
  $("#learn-view").classList.toggle("hidden", view !== "learn");
  $("#teacher-view").classList.toggle("hidden", view !== "teacher");
  $("#activity-view").classList.toggle("hidden", view !== "activity");
  $$(".nav-link").forEach((btn) =>
    btn.classList.toggle(
      "active",
      btn.dataset.view === view ||
        (view === "activity" && btn.dataset.view === "learn"),
    ),
  );
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (view === "teacher") updateTeacherDashboard();
}
function renderSimulation(id) {
  const area = $("#simulation-area");
  if (id === "fractions") {
    area.innerHTML = `<div class="sim-top"><h3>Fraction builder</h3><span class="sim-hint">Try different combinations</span></div>
      <div class="control-row"><label for="parts">Equal parts: <strong id="parts-value">4</strong></label><input id="parts" type="range" min="2" max="8" value="4" /></div>
      <div class="control-row"><label for="shaded">Parts shaded: <strong id="shaded-value">1</strong></label><input id="shaded" type="range" min="0" max="4" value="1" /></div>
      <div id="fraction-pieces" class="fraction-bars"></div>
      <div class="sim-output" id="fraction-output"></div>`;
    const update = () => {
      const parts = Number($("#parts").value),
        shaded = Math.min(Number($("#shaded").value), parts);
      $("#shaded").max = parts;
      $("#shaded-value").textContent = shaded;
      $("#parts-value").textContent = parts;
      $("#fraction-pieces").innerHTML = Array.from(
        { length: parts },
        (_, i) =>
          `<div class="fraction-piece ${i < shaded ? "filled" : ""}">${i < shaded ? "●" : "○"}</div>`,
      ).join("");
      const frac = `${shaded}/${parts}`;
      $("#fraction-output").innerHTML =
        `<strong>What you made: ${frac}</strong><br>${shaded === 0 ? "No parts are shaded yet." : shaded === parts ? "All equal parts are shaded, so the whole is represented." : `${shaded} of the ${parts} equal parts are shaded.`} ${simplifyFraction(shaded, parts)}`;
      saveAttempt(id, { started: true, simulation: { parts, shaded } });
    };
    $("#parts").addEventListener("input", update);
    $("#shaded").addEventListener("input", update);
    update();
  } else if (id === "water-cycle") {
    area.innerHTML = `<div class="sim-top"><h3>Water cycle explorer</h3><span class="sim-hint">Adjust the Sun's energy</span></div>
      <div class="control-row"><label for="heat">Sun energy: <strong id="heat-value">Medium</strong></label><input id="heat" type="range" min="1" max="3" value="2" /></div>
      <div class="water-diagram"><span class="water-sun">☼</span><span class="water-cloud">☁</span><span class="water-rain">⋮ ⋮ ⋮</span><span class="water-arrow arrow-evap">↑ Evaporation</span><span class="water-arrow arrow-cond">☁ Condensation</span><span class="water-arrow arrow-rain">↓ Precipitation</span><div class="water-sea"></div></div>
      <div class="sim-output" id="water-output"></div>`;
    const update = () => {
      const heat = Number($("#heat").value),
        labels = ["Low", "Medium", "High"];
      $("#heat-value").textContent = labels[heat - 1];
      $("#water-output").innerHTML =
        `<strong>${labels[heat - 1]} Sun energy</strong><br>${heat === 1 ? "With less energy, evaporation generally happens more slowly." : heat === 2 ? "Sunlight provides energy for water to evaporate from the surface." : "In this simplified model, more solar energy increases the rate of evaporation. Real conditions also depend on wind, humidity and temperature."} Water vapour can cool and condense into droplets, and water may later fall as precipitation.`;
      saveAttempt(id, { started: true, simulation: { heat } });
    };
    $("#heat").addEventListener("input", update);
    update();
  } else {
    area.innerHTML = `<div class="sim-top"><h3>Reaction model</h3><span class="sim-hint">Conceptual simulation — not real lab data</span></div>
      <div class="control-row"><label for="amount">Baking soda amount: <strong id="amount-value">2</strong> units</label><input id="amount" type="range" min="1" max="5" value="2" /></div>
      <div class="reaction-vessels"><div class="beaker"><div class="beaker-fill"></div></div><span class="reaction-symbol">+</span><div class="beaker"><div class="beaker-fill foam"></div><span class="bubble-dot" style="left:18px;bottom:28px"></span><span class="bubble-dot" style="left:35px;bottom:43px;animation-delay:.5s"></span></div><span class="reaction-symbol">→</span><div class="beaker"><div id="reaction-foam" class="beaker-fill foam"></div><span class="bubble-dot" style="left:18px;bottom:35px"></span><span class="bubble-dot" style="left:35px;bottom:53px;animation-delay:.5s"></span></div></div>
      <div class="sim-output" id="reaction-output"></div>`;
    const update = () => {
      const amount = Number($("#amount").value);
      $("#amount-value").textContent = amount;
      $("#reaction-foam").style.height = `${35 + amount * 8}%`;
      $("#reaction-output").innerHTML =
        `<strong>Observation model: bubbling</strong><br>You selected ${amount} conceptual unit${amount === 1 ? "" : "s"} of baking soda. Bubbles represent carbon dioxide gas. This slider is illustrative only: it does not calculate real gas volume or predict a laboratory yield.`;
      saveAttempt(id, { started: true, simulation: { amount } });
    };
    $("#amount").addEventListener("input", update);
    update();
  }
}
function simplifyFraction(n, d) {
  if (!n) return "Zero parts are shaded.";
  if (n === d) return "This is one whole.";
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b)),
    g = gcd(n, d);
  return g > 1 ? `Equivalent simplified fraction: ${n / g}/${d / g}.` : "";
}
function renderQuiz(id) {
  quizChecked = false;
  $("#quiz-feedback").innerHTML = "";
  const q = activities[id].quiz;
  $("#quiz-content").innerHTML =
    `<p class="quiz-question">${q.q}</p>${q.options.map((opt, i) => `<label class="quiz-option"><input type="radio" name="quiz-answer" value="${i}"><span>${opt}</span></label>`).join("")}`;
}
function startActivity(id) {
  currentActivity = id;
  const a = activities[id];
  $("#activity-title").textContent = a.title;
  $("#activity-intro").textContent = a.intro;
  $("#activity-subject").textContent = a.subject;
  $("#activity-level").textContent = a.level;
  const previous = getProgress()[id] || {};
  $("#hypothesis").value = previous.hypothesis || "";
  $("#observations").value = previous.observations || "";
  $("#conclusion").value = previous.conclusion || "";
  $("#tutor-message").textContent = a.tutor;
  $("#tutor-prompts").innerHTML = a.prompts
    .map((p) => `<button type="button" class="prompt-chip">${p}</button>`)
    .join("");
  $$("#tutor-prompts button").forEach((b, i) =>
    b.addEventListener("click", () => respondToTutor(a.prompts[i])),
  );
  renderSimulation(id);
  renderQuiz(id);
  setView("activity");
}
function respondToTutor(question) {
  const a = activities[currentActivity];
  let answer = a.tutor;
  if (/numerator/i.test(question))
    answer =
      "The numerator is the top number in a fraction. It tells how many equal parts are being considered or shaded.";
  else if (/denominator/i.test(question))
    answer =
      "The denominator is the bottom number in a fraction. It tells how many equal parts the whole is divided into.";
  else if (/evaporation/i.test(question))
    answer =
      "Evaporation is when liquid water changes into water vapour. Energy, often from sunlight, helps drive it.";
  else if (/condensation/i.test(question))
    answer =
      "Condensation happens when water vapour cools and changes into tiny liquid droplets, such as in clouds.";
  else if (/bubbles/i.test(question))
    answer =
      "The bubbles in this conceptual model represent carbon dioxide gas formed in the reaction between vinegar and baking soda.";
  else if (/reactants/i.test(question))
    answer =
      "The reactants are vinegar (containing acetic acid) and baking soda (sodium bicarbonate).";
  else if (/hint/i.test(question))
    answer =
      "Change one setting at a time, watch what changes, and write an observation before reading the explanation. What pattern do you notice?";
  $("#tutor-message").textContent = answer;
}
function updateTeacherDashboard() {
  const data = getProgress(),
    rows = Object.entries(data).sort((a, b) =>
      (b[1].updatedAt || "").localeCompare(a[1].updatedAt || ""),
    );
  const completed = rows.filter(([, v]) => v.completed).length,
    scores = rows
      .filter(([, v]) => Number.isFinite(v.score))
      .map(([, v]) => v.score);
  $("#teacher-completed").textContent = completed;
  $("#teacher-started").textContent = rows.filter(([, v]) => v.started).length;
  $("#teacher-average").textContent = scores.length
    ? `${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%`
    : "—";
  const wrap = $("#teacher-table-wrap");
  if (!rows.length) {
    wrap.innerHTML =
      '<div class="empty-state">No learner activity saved yet. Open a practical and save your progress to see it here.</div>';
    return;
  }
  wrap.innerHTML = `<table class="data-table"><thead><tr><th>Activity</th><th>Last updated</th><th>Quiz score</th><th>Status</th></tr></thead><tbody>${rows.map(([, v]) => `<tr><td><strong>${escapeHtml(v.title || "Activity")}</strong><br><span class="muted">${escapeHtml(v.subject || "")}</span></td><td>${v.updatedAt ? new Date(v.updatedAt).toLocaleDateString() : "—"}</td><td>${Number.isFinite(v.score) ? `${v.score}%` : "—"}</td><td>${v.completed ? "Completed" : v.started ? "In progress" : "Saved"}</td></tr>`).join("")}</tbody></table>`;
}
function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function saveCurrent() {
  saveAttempt(currentActivity, {
    started: true,
    hypothesis: $("#hypothesis").value,
    observations: $("#observations").value,
    conclusion: $("#conclusion").value,
    completed:
      quizChecked && Boolean(getProgress()[currentActivity]?.completed),
  });
  $("#save-activity").textContent = "Progress saved ✓";
  setTimeout(
    () => ($("#save-activity").textContent = "Save my progress"),
    1600,
  );
}
$("#submit-quiz").addEventListener("click", () => {
  const chosen = $('input[name="quiz-answer"]:checked');
  if (!chosen) {
    $("#quiz-feedback").className = "quiz-feedback try";
    $("#quiz-feedback").textContent = "Choose an answer first, then check it.";
    return;
  }
  const q = activities[currentActivity].quiz,
    correct = Number(chosen.value) === q.correct,
    score = correct ? 100 : 0;
  quizChecked = true;
  $("#quiz-feedback").className = `quiz-feedback ${correct ? "good" : "try"}`;
  $("#quiz-feedback").textContent =
    (correct ? "Correct! " : "Not quite. ") + q.explanation;
  saveAttempt(currentActivity, {
    started: true,
    score,
    completed: correct,
    hypothesis: $("#hypothesis").value,
    observations: $("#observations").value,
    conclusion: $("#conclusion").value,
  });
});
$("#save-activity").addEventListener("click", saveCurrent);
$("#tutor-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = $("#tutor-question").value.trim();
  if (!q) return;
  respondToTutor(q);
  $("#tutor-question").value = "";
});
$("#back-to-learning").addEventListener("click", () => setView("learn"));
$$(".nav-link").forEach((b) =>
  b.addEventListener("click", () => setView(b.dataset.view)),
);
$$("[data-activity]").forEach((b) =>
  b.addEventListener("click", () => startActivity(b.dataset.activity)),
);
$("#explore-btn").addEventListener("click", () =>
  $("#learn-view").scrollIntoView({ behavior: "smooth" }),
);
$("#subject-filter").addEventListener("change", (e) => {
  $$(".activity-card").forEach((card) =>
    card.classList.toggle(
      "hidden",
      e.target.value !== "all" && card.dataset.subject !== e.target.value,
    ),
  );
});
$("#reset-progress").addEventListener("click", () => {
  if (confirm("Clear all ClassBridge demo progress saved on this device?")) {
    localStorage.removeItem(STORAGE_KEY);
    updateTeacherDashboard();
    if (!$("#activity-view").classList.contains("hidden"))
      startActivity(currentActivity);
  }
});
function connectionStatus() {
  const el = $("#connection-status");
  if (navigator.onLine) {
    el.innerHTML = "<i></i> Online";
    el.querySelector("i").style.background = "#5da77b";
  } else {
    el.innerHTML = "<i></i> Offline · local progress";
    el.querySelector("i").style.background = "#d7a644";
  }
}
window.addEventListener("online", connectionStatus);
window.addEventListener("offline", connectionStatus);
connectionStatus();
updateTeacherDashboard();
if ("serviceWorker" in navigator && location.protocol.startsWith("http"))
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
