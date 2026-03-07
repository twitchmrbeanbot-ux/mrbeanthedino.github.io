let allCards = [];
let currentUserCards = [];
let currentFilter = "All";

const rarityOrder = ["Common", "Rare", "Super", "Ultra", "Secret", "Collector"];
const rarityRank = {
  Common: 1,
  Rare: 2,
  Super: 3,
  Ultra: 4,
  Secret: 5,
  Collector: 6
};

const pageTitle = document.getElementById("pageTitle");
const totalCards = document.getElementById("totalCards");
const bestCard = document.getElementById("bestCard");
const bestRarity = document.getElementById("bestRarity");
const statusText = document.getElementById("statusText");
const rarityBreakdown = document.getElementById("rarityBreakdown");
const cardGrid = document.getElementById("cardGrid");
const showingText = document.getElementById("showingText");
const usernameInput = document.getElementById("usernameInput");
const loadBtn = document.getElementById("loadBtn");
const filterButtons = document.querySelectorAll(".filter-btn");

if (loadBtn) {
  loadBtn.addEventListener("click", loadUserBinder);
}

if (usernameInput) {
  usernameInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      loadUserBinder();
    }
  });
}

filterButtons.forEach(btn => {
  btn.addEventListener("click", function () {
    filterButtons.forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    currentFilter = this.dataset.rarity;
    renderCards();
  });
});

fetch("ygo_collection.json")
  .then(response => response.json())
  .then(data => {
    allCards = data.cards || [];

    const urlParams = new URLSearchParams(window.location.search);
    const userFromUrl = urlParams.get("user");

    if (userFromUrl && usernameInput) {
      usernameInput.value = userFromUrl;
      loadUserBinder();
    } else if (statusText) {
      statusText.textContent = "Collection data loaded. Enter a viewer name to load their collection.";
    }
  })
  .catch(err => {
    console.error(err);
    if (statusText) statusText.textContent = "Could not load ygo_collection.json";
  });

function loadUserBinder() {
  if (!usernameInput) return;

  const username = usernameInput.value.trim();

  if (!username) {
    if (statusText) statusText.textContent = "Please enter a viewer name.";
    return;
  }

  const normalizedInput = username.toLowerCase();

  currentUserCards = allCards.filter(card => {
    const cardUser = String(card.username || "").trim().toLowerCase();
    return cardUser === normalizedInput;
  });

  if (currentUserCards.length === 0) {
    if (pageTitle) pageTitle.textContent = username + "'s Binder";
    if (totalCards) totalCards.textContent = "0";
    if (bestCard) bestCard.textContent = "None";
    if (bestRarity) bestRarity.textContent = "-";
    if (rarityBreakdown) rarityBreakdown.innerHTML = "";
    if (cardGrid) cardGrid.innerHTML = '<div class="empty-state">No cards found for this viewer.</div>';
    if (showingText) showingText.textContent = "Showing 0 cards";
    if (statusText) statusText.textContent = "No collection found for " + username;
    return;
  }

  currentUserCards.sort((a, b) => {
    const rarityDiff = (rarityRank[b.rarity] || 0) - (rarityRank[a.rarity] || 0);
    if (rarityDiff !== 0) return rarityDiff;
    return String(a.cardName || "").localeCompare(String(b.cardName || ""));
  });

  const best = currentUserCards[0];

  if (pageTitle) pageTitle.textContent = username + "'s Binder";
  if (totalCards) totalCards.textContent = String(currentUserCards.length);
  if (bestCard) bestCard.textContent = best.cardName || "Unknown";
  if (bestRarity) bestRarity.textContent = best.rarity || "-";
  if (statusText) statusText.textContent = "Loaded binder for " + username;

  renderRarityBreakdown();
  renderCards();

  const newUrl = window.location.pathname + "?user=" + encodeURIComponent(username);
  window.history.replaceState({}, "", newUrl);
}

function renderRarityBreakdown() {
  if (!rarityBreakdown) return;

  const counts = {
    Common: 0,
    Rare: 0,
    Super: 0,
    Ultra: 0,
    Secret: 0,
    Collector: 0
  };

  currentUserCards.forEach(card => {
    if (counts.hasOwnProperty(card.rarity)) {
      counts[card.rarity]++;
    }
  });

  rarityBreakdown.innerHTML = "";

  rarityOrder.forEach(rarity => {
    const count = counts[rarity];
    const percent = currentUserCards.length > 0
      ? Math.max(4, (count / currentUserCards.length) * 100)
      : 0;

    const row = document.createElement("div");
    row.className = "rarity-row";
    row.innerHTML = `
      <div class="rarity-top">
        <span>${rarity}</span>
        <span>${count}</span>
      </div>
      <div class="rarity-bar-bg">
        <div class="rarity-bar-fill" style="width:${percent}%"></div>
      </div>
    `;
    rarityBreakdown.appendChild(row);
  });
}

function renderCards() {
  if (!cardGrid) return;

  let filtered = currentUserCards;

  if (currentFilter !== "All") {
    filtered = currentUserCards.filter(card => card.rarity === currentFilter);
  }

  if (showingText) showingText.textContent = "Showing " + filtered.length + " cards";

  if (filtered.length === 0) {
    cardGrid.innerHTML = '<div class="empty-state">No cards match this filter.</div>';
    return;
  }

  cardGrid.innerHTML = "";

  filtered.forEach(card => {
    const tile = document.createElement("div");
    tile.className = "card-tile " + getGlowClass(card.rarity);

    const img = document.createElement("img");
    img.className = "card-image";
    img.src = "https://twitchmrbeanbot-ux.github.io/mrbeanthedino.github.io/images/" + card.cardId + ".jpg";
    img.alt = card.cardName || "Card";
    img.onerror = function () {
      this.src = "https://placehold.co/300x420/111827/e5e7eb?text=No+Image";
    };

    const name = document.createElement("div");
    name.className = "card-name";
    name.textContent = card.cardName || "Unknown Card";

    const rarity = document.createElement("div");
    rarity.className = "card-rarity";
    rarity.textContent = card.rarity || "Unknown";

    tile.appendChild(img);
    tile.appendChild(name);
    tile.appendChild(rarity);

    cardGrid.appendChild(tile);
  });
}

function getGlowClass(rarity) {
  switch (rarity) {
    case "Rare": return "glow-rare";
    case "Super": return "glow-super";
    case "Ultra": return "glow-ultra";
    case "Secret": return "glow-secret";
    case "Collector": return "glow-collector";
    default: return "glow-common";
  }
}