let allCards = [];
let currentUserCards = [];

const usernameInput = document.getElementById("usernameInput");
const loadButton = document.getElementById("loadButton");

const pageTitle = document.getElementById("pageTitle");
const totalCards = document.getElementById("totalCards");
const bestCard = document.getElementById("bestCard");
const bestRarity = document.getElementById("bestRarity");

const rarityBreakdown = document.getElementById("rarityBreakdown");
const cardGrid = document.getElementById("cardGrid");
const showingText = document.getElementById("showingText");
const statusText = document.getElementById("statusText");

const rarityRank = {
  "Collector": 6,
  "Secret": 5,
  "Ultra": 4,
  "Super": 3,
  "Rare": 2,
  "Common": 1
};

let currentFilter = "All";

fetch("ygo_collection.json")
  .then(response => response.json())
  .then(data => {
    allCards = data.cards || [];
  })
  .catch(err => {
    console.error(err);
    statusText.textContent = "Could not load ygo_collection.json";
  });

loadButton.addEventListener("click", loadUserBinder);

function loadUserBinder() {

  const username = usernameInput.value.trim();

  if (!username) {
    statusText.textContent = "Please enter a viewer name.";
    return;
  }

  const normalizedInput = username.toLowerCase();

  currentUserCards = allCards.filter(card => {

    const cardUser = (card.username || "").trim().toLowerCase();

    return cardUser === normalizedInput;

  });

  if (currentUserCards.length === 0) {

    pageTitle.textContent = username + "'s Binder";
    totalCards.textContent = "0";
    bestCard.textContent = "None";
    bestRarity.textContent = "-";

    rarityBreakdown.innerHTML = "";
    cardGrid.innerHTML = "No cards found for this viewer.";
    showingText.textContent = "Showing 0 cards";

    statusText.textContent = "No collection found for " + username;

    return;

  }

  currentUserCards.sort((a,b) => {

    const rarityDiff =
      (rarityRank[b.rarity] || 0) -
      (rarityRank[a.rarity] || 0);

    if (rarityDiff !== 0) return rarityDiff;

    return (a.cardName || "").localeCompare(b.cardName || "");

  });

  const best = currentUserCards[0];

  pageTitle.textContent = username + "'s Binder";
  totalCards.textContent = currentUserCards.length;
  bestCard.textContent = best.cardName || "Unknown";
  bestRarity.textContent = best.rarity || "-";

  statusText.textContent = "Loaded binder for " + username;

  renderRarityBreakdown();
  renderCards();

}

function renderRarityBreakdown() {

  const counts = {};

  currentUserCards.forEach(card => {

    const r = card.rarity || "Common";

    counts[r] = (counts[r] || 0) + 1;

  });

  rarityBreakdown.innerHTML = "";

  Object.keys(rarityRank).forEach(r => {

    const div = document.createElement("div");

    div.textContent = r + ": " + (counts[r] || 0);

    rarityBreakdown.appendChild(div);

  });

}

function renderCards() {

  cardGrid.innerHTML = "";

  let filtered = currentUserCards;

  if (currentFilter !== "All") {

    filtered = currentUserCards.filter(
      c => c.rarity === currentFilter
    );

  }

  showingText.textContent = "Showing " + filtered.length + " cards";

  filtered.forEach(card => {

    const div = document.createElement("div");

    div.className = "card";

    const img = document.createElement("img");

    img.src =
      "https://twitchmrbeanbot-ux.github.io/mrbeanthedino.github.io/images/" +
      card.cardId +
      ".jpg";

    const name = document.createElement("div");

    name.textContent = card.cardName;

    const rarity = document.createElement("div");

    rarity.textContent = card.rarity;

    div.appendChild(img);
    div.appendChild(name);
    div.appendChild(rarity);

    cardGrid.appendChild(div);

  });

}

function setFilter(r) {

  currentFilter = r;

  renderCards();

}
