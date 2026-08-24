"use strict";

/* ============================================================
   Tusker — a simple home cleaning log
   Data is stored in localStorage under "tusker.data.v1".
   Structure: { version, areas: [{ id, name, items: [{ id, name, events: [{ id, task, date, note }] }] }] }
   ============================================================ */

/* ---------------- Utilities ---------------- */

const $ = (sel, root = document) => root.querySelector(sel);

const STORAGE_KEY = "tusker.data.v1";

function uid(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function escapeHTML(str) {
  // NOTE: "\u0026" is an escaped ampersand; writing entities literally in
  // source gets auto-decoded by editors, so we build them via escapes.
  const AMP = "\u0026";
  const map = {
    [AMP]: AMP + "amp;",
    "<": AMP + "lt;",
    ">": AMP + "gt;",
    '"': AMP + "quot;",
    "'": AMP + "#39;",
  };
  return String(str).replace(new RegExp(`[${AMP}<>"']`, "g"), (c) => map[c]);
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseISO(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function daysSince(iso) {
  const d = parseISO(iso);
  if (!d) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - d) / 86400000);
}

function formatDate(iso) {
  const d = parseISO(iso);
  if (!d) return "No date";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function relativeDays(n) {
  if (n === null) return "";
  if (n <= 0) return "today";
  if (n === 1) return "yesterday";
  if (n < 7) return `${n} days ago`;
  if (n < 30) {
    const w = Math.floor(n / 7);
    return w === 1 ? "1 week ago" : `${w} weeks ago`;
  }
  if (n < 365) {
    const m = Math.floor(n / 30);
    return m <= 1 ? "1 month ago" : `${m} months ago`;
  }
  const y = Math.floor(n / 365);
  return y <= 1 ? "1 year ago" : `${y} years ago`;
}

/* ---------------- Seed data (transcribed from the original notes) ---------------- */

function ev(task, date, note = "") {
  return { id: uid("e"), task, date, note };
}

function buildSeedData() {
  return {
    version: 1,
    areas: [
      {
        id: "a-first-floor",
        name: "First Floor",
        items: [
          {
            id: "i-living-room", name: "Living Room", events: [
              ev("Vacuumed", "2026-08-02"),
              ev("Mopped", "2026-08-02"),
            ],
          },
          {
            id: "i-sunroom", name: "Sunroom", events: [
              ev("Vacuumed", "2026-08-02"),
              ev("Mopped", "2026-08-02"),
            ],
          },
          {
            id: "i-bathroom-ff", name: "Bathroom", events: [
              ev("Vacuumed", "2026-08-02"),
              ev("Mopped", "2026-08-02"),
              ev("Cleaned", "2026-07-26"),
            ],
          },
          {
            id: "i-kitchen-ff", name: "Kitchen", events: [
              ev("Vacuumed", "2026-08-02"),
              ev("Mopped", "2026-08-02"),
            ],
          },
          {
            id: "i-couches", name: "Couches", events: [
              ev("Vacuumed", "2026-08-02", "Living room couch"),
              ev("Vacuumed", "2026-07-04", "Office room couch"),
            ],
          },
        ],
      },
      {
        id: "a-second-floor",
        name: "Second Floor",
        items: [
          {
            id: "i-bedrooms", name: "Bedrooms", events: [
              ev("Vacuumed", "2026-08-01"),
              ev("Mopped", "2026-08-01"),
            ],
          },
          {
            id: "i-bathrooms-sf", name: "Bathrooms", events: [
              ev("Vacuumed", "2026-07-05", "Guest bathroom"),
              ev("Mopped", "2026-07-05", "Guest bathroom"),
              ev("Cleaned", "2026-05-15", "Guest bathroom"),
              ev("Mopped", "2026-07-05", "Master bathroom"),
              ev("Cleaned", "2026-08-02", "Master bathroom"),
            ],
          },
          {
            id: "i-stairs", name: "Stairs", events: [
              ev("Vacuumed", "2026-06-08"),
              ev("Quick mop", "2026-02-01"),
            ],
          },
        ],
      },
      {
        id: "a-basement",
        name: "Basement",
        items: [
          {
            id: "i-basement", name: "Basement", events: [
              ev("Vacuumed", "2026-06-06"),
            ],
          },
        ],
      },
      {
        id: "a-garage",
        name: "Garage",
        items: [
          {
            id: "i-garage", name: "Garage", events: [
              ev("Cleaned", "2025-12-10"),
            ],
          },
        ],
      },
      {
        id: "a-appliances",
        name: "Appliances",
        category: "appliance",
        items: [
          {
            id: "i-eufy-ff", name: "Eufy - First Floor", events: [
              ev("Cleaned", "2026-08-15", "First floor unit"),
            ],
          },
          {
            id: "i-eufy-sf", name: "Eufy - Second Floor", events: [
              ev("Cleaned", "2026-08-15", "Second floor unit"),
            ],
          },
          {
            id: "i-roborock", name: "Roborock", events: [
              ev("Filter replaced", "2026-02-23", "Roborock filter"),
            ],
          },
          {
            id: "i-shark", name: "Shark", events: [
              ev("Filters cleaned", "2026-02-23", "Both filters"),
            ],
          },
          {
            id: "i-fridge", name: "Fridge", events: [
              ev("Deep cleaned", "2025-12-13"),
              ev("Quick clean", "2026-01-31"),
            ],
          },
          {
            id: "i-kitchen-appl", name: "Kitchen", events: [
              ev("Loofah changed", "2026-02-27"),
            ],
          },
          {
            id: "i-dryer", name: "Dryer", events: [
              ev("Cleaned", "2026-01-01"),
              ev("Full disassembly, fixed and deep cleaned", "2026-06-01"),
            ],
          },
          {
            id: "i-laundry", name: "Laundry", events: [
              ev("Cleaned", "2026-01-01"),
              ev("Full steam cycle with bleach and baking soda", "2026-01-01"),
              ev("Drained the water from the base, and cleaned the gunk out", "2025-12-30"),
            ],
          },
          {
            id: "i-ro", name: "Reverse Osmosis System", events: [
              ev("Stage 1: Sediment Filter", "2026-02-27"),
              ev("Stage 2: GAC (Granular Activated Carbon)", "2026-02-27"),
              ev("Stage 3: CTO (Carbon Block Filter)", "2026-02-27"),
              ev("Stage 4: RO Membrane", "2026-02-27"),
              ev("Stage 5: Post-Carbon Filter", null, "Did not change"),
              ev("Stage 6: Alkaline Remineralization (AK)", "2026-02-27"),
            ],
          },
        ],
      },
    ],
  };
}

const COMMON_TASKS = [
  "Vacuumed",
  "Mopped",
  "Cleaned",
  "Deep cleaned",
  "Quick clean",
  "Filter replaced",
  "Filters cleaned",
];

/* ---------------- State & persistence ---------------- */

let state = null;
const collapsed = new Set(); // area ids currently collapsed (not persisted)

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.areas)) return null;
    return normalizeData(data);
  } catch (err) {
    console.error("Tusker: failed to load saved data:", err);
    return null;
  }
}

// Upgrade older saved data so "Appliances" is treated as a special
// category rather than a regular area.
function normalizeData(data) {
  for (const area of data.areas) {
    if (!area.category && area.name.toLowerCase() === "appliances") {
      area.category = "appliance";
    }
  }
  // Split the combined "2 Eufys" item into per-floor items.
  for (const area of data.areas) {
    const combined = area.items.find((i) => i.name === "2 Eufys");
    if (!combined) continue;
    const idx = area.items.indexOf(combined);
    const shared = combined.events;
    const first = {
      id: uid("i"),
      name: "Eufy - First Floor",
      events: shared.map((e) => ({ ...e, id: uid("e"), note: e.note === "All units" ? "First floor unit" : e.note })),
    };
    const second = {
      id: uid("i"),
      name: "Eufy - Second Floor",
      events: shared.map((e) => ({ ...e, id: uid("e"), note: e.note === "All units" ? "Second floor unit" : e.note })),
    };
    area.items.splice(idx, 1, first, second);
  }
  // Rename "Filters changed" events to "Filters cleaned".
  for (const area of data.areas) {
    for (const item of area.items) {
      for (const e of item.events) {
        if (/^filters? changed$/i.test(e.task)) e.task = "Filters cleaned";
      }
    }
  }
  return data;
}

const VIEW_KEY = "tusker.view.v1";
const VIEWS = ["areas", "appliances", "stale"];

let currentView = "areas";
try {
  const savedView = localStorage.getItem(VIEW_KEY);
  if (VIEWS.includes(savedView)) currentView = savedView;
} catch (err) { /* ignore */ }

function setView(view) {
  if (!VIEWS.includes(view)) return;
  currentView = view;
  try { localStorage.setItem(VIEW_KEY, view); } catch (err) { /* ignore */ }
  render();
}

function regularAreas() {
  return state.areas.filter((a) => a.category !== "appliance");
}

function applianceAreas() {
  return state.areas.filter((a) => a.category === "appliance");
}

// Flat list of { area, item, last, days } sorted worst-first: items that
// haven't been cleaned the longest (or never logged) come first.
function staleItems() {
  const rows = [];
  for (const area of state.areas) {
    for (const item of area.items) {
      const last = lastCleaned(item);
      const days = last === null ? null : daysSince(last);
      rows.push({ area, item, last, days });
    }
  }
  rows.sort((a, b) => {
    if (a.days === null && b.days === null) return 0;
    if (a.days === null) return -1; // never logged => most neglected
    if (b.days === null) return 1;
    return b.days - a.days;
  });
  return rows;
}


function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Tusker: failed to save data:", err);
  }
  schedulePush(); // keep the cloud copy in step (no-op if not syncing)
}

/* ---------------- Lookups ---------------- */

function findArea(areaId) {
  return state.areas.find((a) => a.id === areaId) || null;
}

function findItem(areaId, itemId) {
  const area = findArea(areaId);
  return area ? area.items.find((i) => i.id === itemId) || null : null;
}

function sortedEvents(item) {
  return [...item.events].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;   // undated entries sink to the bottom
    if (!b.date) return -1;
    return b.date.localeCompare(a.date); // newest first
  });
}

function lastCleaned(item) {
  let latest = null;
  for (const e of item.events) {
    if (e.date && (!latest || e.date > latest)) latest = e.date;
  }
  return latest;
}

function freshnessClass(iso) {
  const n = daysSince(iso);
  if (n === null) return "none";
  if (n <= 7) return "ok";
  if (n <= 30) return "warn";
  return "late";
}

function quickTasks(item) {
  const seen = new Set();
  const tasks = [];
  for (const e of sortedEvents(item)) {
    const key = e.task.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      tasks.push(e.task);
    }
    if (tasks.length >= 4) break;
  }
  return tasks;
}

/* ---------------- Rendering ---------------- */

function eventHTML(e) {
  const rel = e.date ? relativeDays(daysSince(e.date)) : "";
  return `
    <li class="event">
      <div class="event-main">
        <span class="event-task">${escapeHTML(e.task)}</span>
        ${e.note ? `<span class="event-note">${escapeHTML(e.note)}</span>` : ""}
      </div>
      <div class="event-meta">
        <span>${escapeHTML(formatDate(e.date))}</span>
        ${rel ? `<span class="sep">·</span><span>${escapeHTML(rel)}</span>` : ""}
      </div>
      <button class="event-delete" data-action="delete-event" data-event-id="${e.id}" title="Delete entry">✕</button>
    </li>`;
}

function itemHTML(item) {
  const last = lastCleaned(item);
  const badgeClass = freshnessClass(last);
  const badgeText = last ? relativeDays(daysSince(last)) : "never logged";
  const chips = quickTasks(item);
  const events = sortedEvents(item);

  return `
    <article class="item" data-item-id="${item.id}">
      <div class="item-header">
        <div class="item-title">
          <h3>${escapeHTML(item.name)}</h3>
          <span class="badge ${badgeClass}" title="Last cleaned">${escapeHTML(badgeText)}</span>
        </div>
        <div class="item-actions">
          <button class="btn btn-small btn-primary" data-action="log">+ Log</button>
          <button class="btn btn-small btn-icon" data-action="rename-item" title="Rename item">✎</button>
          <button class="btn btn-small btn-icon danger" data-action="delete-item" title="Delete item">✕</button>
        </div>
      </div>
      ${chips.length
        ? `<div class="chips">${chips.map((t) =>
            `<button class="chip" data-action="quick-log" data-task="${escapeHTML(t)}" title="Log “${escapeHTML(t)}” for today">${escapeHTML(t)}</button>`
          ).join("")}</div>`
        : ""}
      ${events.length
        ? `<ul class="events">${events.map(eventHTML).join("")}</ul>`
        : `<p class="empty">No cleanings logged yet.</p>`}
    </article>`;
}

function matchesSearch(item) {
  const q = $("#search").value.trim().toLowerCase();
  if (!q) return true;
  if (item.name.toLowerCase().includes(q)) return true;
  return item.events.some(
    (e) => e.task.toLowerCase().includes(q) || (e.note || "").toLowerCase().includes(q)
  );
}

function render() {
  const app = $("#app");
  app.innerHTML = "";
  updateAddButton();

  // Sync tab active states
  for (const btn of document.querySelectorAll(".view-tab")) {
    btn.classList.toggle("active", btn.dataset.view === currentView);
    btn.setAttribute("aria-selected", String(btn.dataset.view === currentView));
  }

  let shown = 0;
  if (currentView === "stale") {
    shown = renderStaleView(app);
  } else {
    const areas = currentView === "appliances" ? applianceAreas() : regularAreas();
    const q = $("#search").value.trim().toLowerCase();

    for (const area of areas) {
      const items = area.items.filter(matchesSearch);
      if (q && items.length === 0) continue;
      shown++;

      const dates = area.items.map(lastCleaned).filter(Boolean).sort();
      const lastActivity = dates.length ? relativeDays(daysSince(dates[dates.length - 1])) : "";

      const section = document.createElement("section");
      section.className =
        "area" + (area.category === "appliance" ? " special" : "") +
        (collapsed.has(area.id) ? " collapsed" : "");
      section.dataset.areaId = area.id;

      section.innerHTML = `
      <div class="area-header">
        <button class="area-toggle" data-action="toggle-area" aria-expanded="${!collapsed.has(area.id)}">
          <span class="chevron">▾</span>
          ${area.category === "appliance" ? '<span class="area-icon">🔌</span>' : ""}
          <h2>${escapeHTML(area.name)}</h2>
          <span class="area-sub">${area.items.length} ${area.items.length === 1 ? "item" : "items"}${lastActivity ? ` · last activity ${escapeHTML(lastActivity)}` : ""}</span>
        </button>
        <div class="area-actions">
          <button class="btn btn-small" data-action="add-item">+ Item</button>
          <button class="btn btn-small btn-icon" data-action="rename-area" title="Rename category">✎</button>
          <button class="btn btn-small btn-icon danger" data-action="delete-area" title="Delete category">✕</button>
        </div>
      </div>
      <div class="area-body">
        ${items.length === 0
          ? `<p class="empty">No items yet. Click “+ Item” to add one.</p>`
          : items.map(itemHTML).join("")}
      </div>`;

      app.appendChild(section);
    }
  }

  if (shown === 0 && !$("#search").value.trim()) {
    app.innerHTML = `<p class="empty big">${currentView === "appliances"
      ? "No appliance categories yet."
      : "Nothing here yet. Click “+ Area” to add one."}</p>`;
  } else if (shown === 0) {
    app.innerHTML = `<p class="empty big">No matches for “${escapeHTML($("#search").value.trim())}”.</p>`;
  }

  updateStats();
}

/* Needs-cleaning view: everything sorted worst-first so you can see at a
   glance what hasn't been cleaned in a while. */
function renderStaleView(app) {
  const q = $("#search").value.trim().toLowerCase();
  const rows = staleItems().filter((r) => matchesSearch(r.item));

  const wrap = document.createElement("section");
  wrap.className = "stale-view";

  wrap.innerHTML = `
    <div class="stale-intro">
      <h2>🧹 Needs cleaning</h2>
      <p>Sorted with the most neglected first — start from the top.</p>
    </div>`;

  if (rows.length === 0) {
    wrap.innerHTML += `<p class="empty big">${q
      ? `No matches for “${escapeHTML(q)}”.`
      : "Nothing logged yet — add areas and items to get started."}</p>`;
    app.appendChild(wrap);
    return rows.length;
  }

  for (const { area, item } of rows) {
    const last = lastCleaned(item);
    const badgeClass = freshnessClass(last);
    const badgeText = last ? relativeDays(daysSince(last)) : "never logged";
    const chips = quickTasks(item);

    const card = document.createElement("article");
    card.className = "item stale-card";
    card.dataset.areaId = area.id;
    card.dataset.itemId = item.id;

    card.innerHTML = `
      <div class="item-header">
        <div class="item-title">
          <h3>${escapeHTML(item.name)}</h3>
          <span class="stale-where">${area.category === "appliance" ? "🔌" : ""} ${escapeHTML(area.name)}</span>
          <span class="badge ${badgeClass}" title="Last cleaned">${escapeHTML(badgeText)}</span>
        </div>
        <div class="item-actions">
          <button class="btn btn-small btn-primary" data-action="log">+ Log</button>
          <button class="btn btn-small" data-action="go-to-item" title="Show in its area">Open</button>
        </div>
      </div>
      ${chips.length
        ? `<div class="chips">${chips.map((t) =>
            `<button class="chip" data-action="quick-log" data-task="${escapeHTML(t)}" title="Log “${escapeHTML(t)}” for today">${escapeHTML(t)}</button>`
          ).join("")}</div>`
        : `<p class="empty">No cleanings logged yet.</p>`}
      ${last ? `<p class="stale-last">Last cleaned: ${escapeHTML(formatDate(last))}</p>` : ""}`;

    wrap.appendChild(card);
  }

  app.appendChild(wrap);
  return rows.length;
}

function updateStats() {
  const areas = regularAreas().length;
  const appliances = applianceAreas().reduce((s, a) => s + a.items.length, 0);
  const items = state.areas.reduce((s, a) => s + a.items.length, 0);
  const events = state.areas.reduce(
    (s, a) => s + a.items.reduce((t, i) => t + i.events.length, 0), 0
  );
  $("#stats").textContent = `${areas} areas · ${items} items (${appliances} in Appliances) · ${events} cleanings logged`;
}

/* ---------------- Actions ---------------- */

function logCleaning(areaId, itemId, task, date, note) {
  const item = findItem(areaId, itemId);
  if (!item) return;
  item.events.push({ id: uid("e"), task, date, note });
  saveState();
  render();
  toast(`Logged “${task}” for ${item.name}`);
}

function addArea() {
  const isAppliance = currentView === "appliances";
  const name = prompt(isAppliance
    ? 'New appliance category name (e.g. "HVAC"):'
    : 'New area name (e.g. "Attic"):', "");
  if (!name || !name.trim()) return;
  const trimmed = name.trim();
  const newArea = { id: uid("a"), name: trimmed, items: [] };
  if (isAppliance) newArea.category = "appliance";
  state.areas.push(newArea);
  saveState();
  render();
  toast(`Added ${isAppliance ? "appliance category" : "area"} "${trimmed}"`);
}

function addItem(areaId) {
  const area = findArea(areaId);
  if (!area) return;
  const name = prompt(`Add an item to "${area.name}":`, "");
  if (!name || !name.trim()) return;
  const trimmed = name.trim();
  area.items.push({ id: uid("i"), name: trimmed, events: [] });
  saveState();
  render();
  toast(`Added "${trimmed}"`);
}

function renameArea(areaId) {
  const area = findArea(areaId);
  if (!area) return;
  const name = prompt("Rename area:", area.name);
  if (!name || !name.trim() || name.trim() === area.name) return;
  area.name = name.trim();
  saveState();
  render();
}

function renameItem(areaId, itemId) {
  const item = findItem(areaId, itemId);
  if (!item) return;
  const name = prompt("Rename item:", item.name);
  if (!name || !name.trim() || name.trim() === item.name) return;
  item.name = name.trim();
  saveState();
  render();
}

function deleteArea(areaId) {
  const area = findArea(areaId);
  if (!area) return;
  const n = area.items.length;
  const msg = n > 0
    ? `Delete "${area.name}" and its ${n} item(s)? This cannot be undone.`
    : `Delete "${area.name}"? This cannot be undone.`;
  if (!confirm(msg)) return;
  state.areas = state.areas.filter((a) => a.id !== areaId);
  collapsed.delete(areaId);
  saveState();
  render();
  toast(`Deleted area "${area.name}"`);
}

function deleteItem(areaId, itemId) {
  const item = findItem(areaId, itemId);
  if (!item) return;
  if (!confirm(`Delete "${item.name}" and its cleaning history? This cannot be undone.`)) return;
  const area = findArea(areaId);
  area.items = area.items.filter((i) => i.id !== itemId);
  saveState();
  render();
  toast(`Deleted "${item.name}"`);
}

function deleteEvent(areaId, itemId, eventId) {
  const item = findItem(areaId, itemId);
  if (!item) return;
  item.events = item.events.filter((e) => e.id !== eventId);
  saveState();
  render();
}

/* ---------------- Log modal ---------------- */

let modalCtx = null; // { areaId, itemId }

function openLogModal(areaId, itemId, presetTask = "", focusDate = false) {
  const area = findArea(areaId);
  const item = findItem(areaId, itemId);
  if (!area || !item) return;
  modalCtx = { areaId, itemId };
  $("#modal-subtitle").textContent = `${item.name} — ${area.name}`;
  $("#log-task").value = presetTask;
  $("#log-date").value = todayISO();
  $("#log-note").value = "";
  fillSuggestions(item);
  $("#modal-overlay").classList.remove("hidden");
  // Task is already filled for quick actions, so point the user at the date.
  (focusDate ? $("#log-date") : $("#log-task")).focus();
}

function closeLogModal() {
  modalCtx = null;
  $("#modal-overlay").classList.add("hidden");
}

function fillSuggestions(item) {
  const seen = new Set();
  const out = [];
  for (const e of sortedEvents(item)) {
    const key = e.task.toLowerCase();
    if (!seen.has(key)) { seen.add(key); out.push(e.task); }
  }
  for (const t of COMMON_TASKS) {
    const key = t.toLowerCase();
    if (!seen.has(key)) { seen.add(key); out.push(t); }
  }
  $("#task-suggestions").innerHTML =
    out.slice(0, 15).map((t) => `<option value="${escapeHTML(t)}"></option>`).join("");
}

/* ---------------- Toast ---------------- */

let toastTimer = null;

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 2200);
}

/* ---------------- Backup / restore ---------------- */

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tusker-backup-${todayISO()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast("Backup downloaded");
}

async function importData(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data || !Array.isArray(data.areas)) throw new Error("File does not look like a Tusker backup.");
    if (!confirm("Importing will replace your current data. Continue?")) return;
    state = data;
    collapsed.clear();
    saveState();
    render();
    toast("Backup imported");
  } catch (err) {
    alert(`Could not import: ${err.message}`);
  }
}

function resetData() {
  if (!confirm("Reset all data back to the original sample notes? This cannot be undone.")) return;
  state = buildSeedData();
  collapsed.clear();
  saveState();
  render();
  toast("Reset to sample data");
}

/* ---------------- Cross-device sync (Firebase Firestore) ----------------
   One cloud document per household holds the whole state blob.
   - Local writes: debounced push to Firestore.
   - Remote writes: onSnapshot listener adopts newer data and re-renders.
   - Conflict strategy: last writer wins (writes are rare; acceptable here).
   Requires firebase-config.js to be filled in (see FIREBASE_SETUP.md). */

const HOUSEHOLD_KEY = "tusker.household.v1";
const SYNC = { db: null, docRef: null, unsub: null, householdId: null,
               lastPushedJSON: null, lastPushMs: 0, pushTimer: null,
               status: "off", statusDetail: "", applyingRemote: false };

function syncAvailable() {
  return typeof firebase !== "undefined" && firebaseConfigured();
}

async function SyncInit() {
  if (!syncAvailable()) { setSyncStatus("off"); return; }
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    SYNC.db = firebase.firestore();
    await firebase.auth().signInAnonymously();
  } catch (err) {
    console.error("Tusker: Firebase init failed:", err);
    setSyncStatus("error", "Sync unavailable");
    return;
  }

  let saved = null;
  try { saved = localStorage.getItem(HOUSEHOLD_KEY); } catch (err) { /* ignore */ }
  if (saved) joinHousehold(saved);
  else setSyncStatus("unpaired");
}

function makeHouseholdCode() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789"; // no ambiguous chars
  let code = "";
  const rand = new Uint8Array(8);
  crypto.getRandomValues(rand);
  for (const b of rand) code += alphabet[b % alphabet.length];
  return `tusker-${code}`;
}

function detachListener() {
  if (SYNC.unsub) { SYNC.unsub(); SYNC.unsub = null; }
}

function createHouseholdInto(ref) {
  SYNC.lastPushedJSON = JSON.stringify(state);
  SYNC.lastPushMs = Date.now();
  return ref.set({ data: JSON.parse(JSON.stringify(state)), updatedAt: Date.now() });
}

// Pair this device to a household document and start listening.
async function joinHousehold(code) {
  detachListener();
  SYNC.householdId = code;
  SYNC.docRef = SYNC.db.collection("households").doc(code);
  try { localStorage.setItem(HOUSEHOLD_KEY, code); } catch (err) { /* ignore */ }
  setSyncStatus("connecting");

  SYNC.unsub = SYNC.docRef.onSnapshot((snap) => {
    if (!snap.exists) { setSyncStatus("missing"); return; }
    applyRemote(snap.data());
  }, (err) => {
    console.error("Tusker: snapshot error:", err);
    setSyncStatus("error", "Connection lost");
  });

  const snap = await SYNC.docRef.get();
  if (!snap.exists) {
    // Household doc vanished; recreate it from local data.
    await createHouseholdInto(SYNC.docRef);
  } else {
    applyRemote(snap.data());
  }
  setSyncStatus("synced");
}

function applyRemote(docData) {
  if (!docData || !Array.isArray(docData.data && docData.data.areas)) return;
  const remoteJSON = JSON.stringify(docData.data);
  if (remoteJSON === SYNC.lastPushedJSON) return; // echo of our own push

  // If we just made a local change that hasn't been pushed yet, prefer ours.
  const hasUnpushedLocal = JSON.stringify(state) !== SYNC.lastPushedJSON &&
                           SYNC.lastPushMs > 0 && Date.now() - SYNC.lastPushMs < 10000;
  if (hasUnpushedLocal) { schedulePush(0); return; }

  SYNC.applyingRemote = true;
  state = docData.data;
  collapsed.clear();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (err) { /* ignore */ }
  SYNC.applyingRemote = false;
  SYNC.lastPushedJSON = remoteJSON;
  setSyncStatus("synced");
  render();
}

// Called from saveState(). Debounced so rapid edits cause one write.
function schedulePush(delay = 600) {
  if (!SYNC.docRef || SYNC.applyingRemote) return;
  clearTimeout(SYNC.pushTimer);
  SYNC.pushTimer = setTimeout(pushState, delay);
}

async function pushState() {
  if (!SYNC.docRef || SYNC.applyingRemote) return;
  const json = JSON.stringify(state);
  if (json === SYNC.lastPushedJSON) return; // nothing changed
  SYNC.lastPushedJSON = json;
  SYNC.lastPushMs = Date.now();
  try {
    await SYNC.docRef.set({ data: JSON.parse(json), updatedAt: Date.now() });
    setSyncStatus("synced");
  } catch (err) {
    console.error("Tusker: push failed:", err);
    SYNC.lastPushedJSON = null; // allow retry on next edit/snapshot
    setSyncStatus("error", "Offline — will retry on next change");
  }
}

function leaveHousehold() {
  if (!confirm("Stop syncing on this device? Data stays on this device but will no longer update from other devices.")) return;
  detachListener();
  try { localStorage.removeItem(HOUSEHOLD_KEY); } catch (err) { /* ignore */ }
  SYNC.householdId = null;
  SYNC.docRef = null;
  setSyncStatus("unpaired");
  renderSyncDialogBody();
}

/* ---------------- Sync dialog UI ---------------- */

function setSyncStatus(status, detail = "") {
  SYNC.status = status;
  SYNC.statusDetail = detail;
}

function syncStatusText() {
  switch (SYNC.status) {
    case "synced":     return `✅ Synced — household code: ${SYNC.householdId || "?"}`;
    case "connecting": return "⏳ Connecting…";
    case "unpaired":   return "This device is not paired to a household yet.";
    case "error":      return `⚠️ ${SYNC.statusDetail || "Sync problem"}`;
    case "missing":    return "⚠️ Household not found — check the code.";
    default:           return "Cloud sync is not configured (see firebase-config.js). Data stays on this device.";
  }
}

function openSyncDialog() {
  $("#menu-dropdown").classList.add("hidden");
  renderSyncDialogBody();
  $("#sync-status").textContent = syncStatusText();
  $("#sync-overlay").classList.remove("hidden");
  const input = $("#sync-code-input");
  if (input && !SYNC.householdId) input.focus();
}

function closeSyncDialog() {
  $("#sync-overlay").classList.add("hidden");
}

function renderSyncDialogBody() {
  const body = $("#sync-body");
  const leaveBtn = $("#sync-leave");

  if (!syncAvailable()) {
    body.innerHTML = `<p class="empty">To enable sync, fill in your free Firebase project config in <code>firebase-config.js</code>. See <code>FIREBASE_SETUP.md</code> for the ~5-minute one-time setup.</p>`;
    leaveBtn.classList.add("hidden");
    return;
  }

  leaveBtn.classList.toggle("hidden", !SYNC.householdId);

  if (SYNC.householdId) {
    body.innerHTML = `
      <p>This device is synced with household:</p>
      <p class="sync-code">${escapeHTML(SYNC.householdId)}</p>
      <p>On another phone or browser, choose <strong>“Join with a code”</strong> and enter it there. Changes appear on all devices automatically.</p>`;
    return;
  }

  body.innerHTML = `
    <div class="sync-options">
      <div>
        <h3>New household</h3>
        <p>Upload this device's data and get a share code for other devices.</p>
        <button type="button" id="btn-sync-create" class="btn btn-primary">Create household</button>
      </div>
      <hr>
      <div>
        <h3>Join with a code</h3>
        <label>Household code
          <input type="text" id="sync-code-input" placeholder="tusker-xxxxxxxx" autocomplete="off">
        </label>
        <button type="button" id="btn-sync-join" class="btn">Join</button>
      </div>
    </div>`;

  $("#btn-sync-create").addEventListener("click", async () => {
    try {
      setSyncStatus("connecting");
      const id = makeHouseholdCode();
      await createHouseholdInto(SYNC.db.collection("households").doc(id));
      await joinHousehold(id);
      toast("Household created — sync is on");
    } catch (err) {
      console.error(err);
      alert(`Could not create household: ${err.message}`);
      setSyncStatus("error", "Create failed");
    }
    renderSyncDialogBody();
  });

  $("#btn-sync-join").addEventListener("click", async () => {
    const code = $("#sync-code-input").value.trim().toLowerCase();
    if (!/^tusker-[a-z0-9]{6,}$/.test(code)) {
      alert("That doesn't look like a Tusker household code.");
      return;
    }
    try {
      setSyncStatus("connecting");
      const snap = await SYNC.db.collection("households").doc(code).get();
      if (!snap.exists) {
        setSyncStatus("missing");
        alert("No household found with that code.");
        renderSyncDialogBody();
        return;
      }
      const hasLocalData = state.areas.some((a) => a.items.length > 0);
      if (hasLocalData && !confirm(
        "Joining will replace this device's data with the household's data.\n" +
        "(Export a backup first if you want to keep local changes.) Continue?"
      )) { setSyncStatus("unpaired"); renderSyncDialogBody(); return; }
      await joinHousehold(code);
      toast("Joined household — sync is on");
    } catch (err) {
      console.error(err);
      alert(`Could not join: ${err.message}`);
      setSyncStatus("error", "Join failed");
    }
    renderSyncDialogBody();
  });
}

/* ---------------- Event wiring ---------------- */

$("#app").addEventListener("click", (e) => {
  const actionEl = e.target.closest("[data-action]");
  if (!actionEl) return;
  const action = actionEl.dataset.action;
  const areaEl = actionEl.closest("[data-area-id]");
  const areaId = areaEl ? areaEl.dataset.areaId : null;
  const itemEl = actionEl.closest("[data-item-id]");
  const itemId = itemEl ? itemEl.dataset.itemId : null;

  switch (action) {
    case "toggle-area":
      if (collapsed.has(areaId)) collapsed.delete(areaId);
      else collapsed.add(areaId);
      render();
      break;
    case "go-to-item":
      setView(applianceAreas().some((a) => a.id === areaId) ? "appliances" : "areas");
      if (collapsed.has(areaId)) collapsed.delete(areaId);
      render();
      {
        const target = document.querySelector(`[data-area-id="${CSS.escape(areaId)}"] [data-item-id="${CSS.escape(itemId)}"]`);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.classList.add("flash");
          setTimeout(() => target.classList.remove("flash"), 1600);
        }
      }
      break;
    case "add-area": addArea(); break;
    case "add-item": addItem(areaId); break;
    case "rename-area": renameArea(areaId); break;
    case "delete-area": deleteArea(areaId); break;
    case "rename-item": renameItem(areaId, itemId); break;
    case "delete-item": deleteItem(areaId, itemId); break;
    case "log": openLogModal(areaId, itemId); break;
    case "quick-log":
      openLogModal(areaId, itemId, actionEl.dataset.task, true);
      break;
    case "delete-event":
      deleteEvent(areaId, itemId, actionEl.dataset.eventId);
      break;
  }
});

$("#search").addEventListener("input", render);

$("#btn-add-area").addEventListener("click", addArea);

// Keep the "+ Area"/"+ Category" button label in sync with the active view.
function updateAddButton() {
  const btn = $("#btn-add-area");
  // The "Needs Cleaning" view is a read-only summary; hide the add button there.
  if (currentView === "stale") {
    btn.classList.add("hidden");
    return;
  }
  btn.classList.remove("hidden");
  if (currentView === "appliances") {
    btn.textContent = "+ Appliance";
    btn.title = "Add a new appliance category";
  } else {
    btn.textContent = "+ Area";
    btn.title = "Add a new area";
  }
}

document.querySelectorAll(".view-tab").forEach((tab) => {
  tab.addEventListener("click", () => setView(tab.dataset.view));
});

$("#btn-menu").addEventListener("click", (e) => {
  e.stopPropagation();
  $("#menu-dropdown").classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".menu")) $("#menu-dropdown").classList.add("hidden");
});

$("#btn-export").addEventListener("click", () => {
  $("#menu-dropdown").classList.add("hidden");
  exportData();
});

$("#btn-import").addEventListener("click", () => {
  $("#menu-dropdown").classList.add("hidden");
  $("#import-file").click();
});

$("#import-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  importData(file);
});

$("#btn-reset").addEventListener("click", () => {
  $("#menu-dropdown").classList.add("hidden");
  resetData();
});

$("#btn-sync").addEventListener("click", openSyncDialog);
$("#sync-close").addEventListener("click", closeSyncDialog);
$("#sync-leave").addEventListener("click", leaveHousehold);

$("#sync-overlay").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeSyncDialog();
});

$("#log-form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!modalCtx) return;
  const task = $("#log-task").value.trim();
  const date = $("#log-date").value;
  const note = $("#log-note").value.trim();
  if (!task || !date) return;
  logCleaning(modalCtx.areaId, modalCtx.itemId, task, date, note);
  closeLogModal();
});

$("#log-cancel").addEventListener("click", closeLogModal);

$("#modal-overlay").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeLogModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeLogModal();
    closeSyncDialog();
    $("#menu-dropdown").classList.add("hidden");
  }
});

/* ---------------- Init ---------------- */

state = loadState();
if (!state) {
  state = buildSeedData();
  saveState();
}
render();

// Start cloud sync in the background (no-op if Firebase isn't configured).
SyncInit();