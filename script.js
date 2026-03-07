let allCards = [];
let filteredCards = [];
let activeViewer = "";
let activeFilter = "All";
let lastCollectionSnapshot = "";

window.addEventListener("load", async function () {
  wireUi();
  await tryAutoLoadFromQuery();
  setInterval(refreshActiveViewer, 15000);
});

function wireUi() {
  const loadBtn = document.getElementById("loadBinderBtn");
  const searchInput = document.getElementById("viewerSearch");
  const filterWrap = document.getElementById("filter-buttons");

  if (loadBtn) {
    loadBtn.addEventListener("click", loadViewerFromInput);
  }

  if (searchInput) {
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        loadViewerFromInput();
      }
    });
  }

  if (filterWrap) {
    filterWrap.addEventListener("click", function (e) {
      const btn = e.target.closest("button[data-rarity]");
      if (!btn) return;

      activeFilter = btn.getAttribute("data-rarity") || "All";

      document.querySelectorAll("#filter-buttons button").forEach(b => {
        b.classList.remove("active-filter");
      });

      btn.classList.add("active-filter");
      applyFilterAndRender();
    });
  }
}

async function tryAutoLoadFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const viewer = (params.get("viewer") || "").trim();

  if (!viewer) return;

  const input = document.getElementById("viewerSearch");
  if (input) input.value = viewer;

  await loadViewer(viewer, true);
}

function loadViewerFromInput() {
  const input = document.getElementById("viewerSearch");
  const viewer = input ? input.value.trim() : "";

  if (!viewer) return;
  loadViewer(viewer, true);
}

async function refreshActiveViewer() {
  if (!activeViewer) return;
  await loadViewer(activeViewer, false);
}

async function loadViewer(viewerName, updateUrlFlag) {
  const loadedMessage = document.getElementById("loadedMessage");

  try {
    const response = await fetch("./ygo_collection.json?t=" + Date.now());
    if (!response.ok) throw new Error("Failed to load ygo_collection.json");

    const data = await response.json();
    const snapshot = JSON.stringify(data);
    const cards = Array.isArray(data.cards) ? data.cards : [];

    const viewerCards = cards.filter(card =>
      String(card.username || "").toLowerCase() === viewerName.toLowerCase()
    );

    const viewerSnapshot = JSON.stringify(viewerCards);

    if (!updateUrlFlag && viewerName === activeViewer && viewerSnapshot === lastCollectionSnapshot) {
      return;
    }

    lastCollectionSnapshot = viewerSnapshot;
    activeViewer = viewerName;
    allCards = viewerCards;

    if (loadedMessage) {
      loadedMessage.textContent = allCards.length
        ? `Loaded binder for ${viewerName}`
        : `No cards found for ${viewerName}`;
    }

    updateSummary(viewerName, allCards);
    applyFilterAndRender();

    if (updateUrlFlag) {
      updateUrl(viewerName);
    }

  } catch (error) {
    console.error("Binder load error:", error);
    if (loadedMessage) loadedMessage.textContent = "Failed to load binder data.";
  }
}

function updateSummary(viewerName, cards) {
  const cardsOwned = document.getElementById("cardsOwned");
  const bestCard = document.getElementById("bestCard");
  const bestRarity = document.getElementById("bestRarity");
  const viewerNameDisplay = document.getElementById("viewerNameDisplay");
  const binderTitle = document.getElementById("binder-title");

  const rarityCounts = {
    Common: 0,
    Rare: 0,
    Super: 0,
    Ultra: 0,
    Secret: 0,
    Collector: 0
  };

  let best = null;

  cards.forEach(card => {
    const rarity = normalizeRarity(card.rarity);
    if (rarityCounts[rarity] !== undefined) {
      rarityCounts[rarity]++;
    }

    if (!best || rarityRank(rarity) > rarityRank(normalizeRarity(best.rarity))) {
      best = card;
    }
  });

  if (cardsOwned) cardsOwned.textContent = cards.length;
  if (bestCard) bestCard.textContent = best ? (best.cardName || "-") : "-";
  if (bestRarity) bestRarity.textContent = best ? normalizeRarity(best.rarity) : "-";
  if (viewerNameDisplay) viewerNameDisplay.textContent = viewerName || "-";
  if (binderTitle) binderTitle.textContent = viewerName ? `${viewerName}'s Binder` : "Viewer Binder";

  setText("rarityCommon", rarityCounts.Common);
  setText("rarityRare", rarityCounts.Rare);
  setText("raritySuper", rarityCounts.Super);
  setText("rarityUltra", rarityCounts.Ultra);
  setText("raritySecret", rarityCounts.Secret);
  setText("rarityCollector", rarityCounts.Collector);
}

function applyFilterAndRender() {
  if (activeFilter === "All") {
    filteredCards = allCards.slice();
  } else {
    filteredCards = allCards.filter(card =>
      normalizeRarity(card.rarity) === activeFilter
    );
  }

  renderCards(filteredCards);
}

function renderCards(cards) {
  const grid = document.getElementById("card-grid");
  const showingCount = document.getElementById("showingCount");

  if (showingCount) {
    showingCount.textContent = `Showing ${cards.length} card${cards.length === 1 ? "" : "s"}`;
  }

  if (!grid) return;

  if (!cards.length) {
    grid.innerHTML = `<div class="empty-state">No cards found for this filter.</div>`;
    return;
  }

  grid.innerHTML = cards.map(card => {
    const rarity = normalizeRarity(card.rarity);
    const rarityClass = `rarity-${rarity.toLowerCase()}`;
    const imageUrl = `https://images.ygoprodeck.com/images/cards/${card.cardId}.jpg`;

    return `
      <div class="binder-card ${rarityClass}">
        <img
          src="${imageUrl}"
          alt="${escapeHtml(card.cardName || "Card")}"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://images.ygoprodeck.com/images/cards/back.jpg';"
        />
        <div class="binder-card-name">
          ${escapeHtml(card.cardName || "Unknown Card")}
        </div>
        <div class="binder-card-rarity ${rarityClass}">
          ${escapeHtml(rarity)}
        </div>
      </div>
    `;
  }).join("");
}

function normalizeRarity(rarity) {
  const value = String(rarity || "").trim().toLowerCase();

  if (value === "common") return "Common";
  if (value === "rare") return "Rare";
  if (value === "super") return "Super";
  if (value === "ultra") return "Ultra";
  if (value === "secret") return "Secret";
  if (value === "collector") return "Collector";

  return "Common";
}

function rarityRank(rarity) {
  if (rarity === "Collector") return 6;
  if (rarity === "Secret") return 5;
  if (rarity === "Ultra") return 4;
  if (rarity === "Super") return 3;
  if (rarity === "Rare") return 2;
  return 1;
}

function updateUrl(viewerName) {
  const url = new URL(window.location.href);
  url.searchParams.set("viewer", viewerName);
  window.history.replaceState({}, "", url.toString());
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
