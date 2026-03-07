async function loadLeaderboard() {
  const leaderboardBody = document.getElementById("leaderboard-body");
  const leaderboardStatus = document.getElementById("leaderboard-status");

  try {
   const response = await fetch("./ygo_collection.json?t=" + Date.now());
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    console.log("YGO JSON loaded:", data);

    const players = extractPlayers(data);
    const rankings = players
      .map(player => ({
        username: getUsername(player),
        packs: getPacksOpened(player),
        cards: getCardCount(player)
      }))
      .filter(player => player.username && player.packs > 0)
      .sort((a, b) => b.packs - a.packs);

    if (!rankings.length) {
      if (leaderboardStatus) {
        leaderboardStatus.textContent = "No leaderboard data found.";
      }
      if (leaderboardBody) {
        leaderboardBody.innerHTML = `
          <tr>
            <td colspan="4">No users with pack data found.</td>
          </tr>
        `;
      }
      return;
    }

    if (leaderboardStatus) leaderboardStatus.style.display = "none";

    leaderboardBody.innerHTML = rankings
      .map((player, index) => `
        <tr>
          <td>#${index + 1}</td>
          <td>${escapeHtml(player.username)}</td>
          <td>${player.packs}</td>
          <td>${player.cards}</td>
        </tr>
      `)
      .join("");

  } catch (error) {
    console.error("Leaderboard load error:", error);

    if (leaderboardStatus) {
      leaderboardStatus.textContent = "Failed to load leaderboard.";
    }

    if (leaderboardBody) {
      leaderboardBody.innerHTML = `
        <tr>
          <td colspan="4">Error loading leaderboard data.</td>
        </tr>
      `;
    }
  }
}

function extractPlayers(data) {
  if (!data) return [];

  // Case 1: array at root
  if (Array.isArray(data)) return data;

  // Case 2: object with players/users/collections
  if (Array.isArray(data.players)) return data.players;
  if (Array.isArray(data.users)) return data.users;
  if (Array.isArray(data.collections)) return data.collections;

  // Case 3: object keyed by username
  if (typeof data === "object") {
    return Object.entries(data).map(([key, value]) => {
      if (value && typeof value === "object") {
        return { username: key, ...value };
      }
      return null;
    }).filter(Boolean);
  }

  return [];
}

function getUsername(player) {
  return (
    player.username ||
    player.user ||
    player.name ||
    player.displayName ||
    player.twitchName ||
    "Unknown User"
  );
}

function getPacksOpened(player) {
  return Number(
    player.packsOpened ??
    player.packs_opened ??
    player.packs ??
    player.packCount ??
    player.pack_count ??
    player.totalPacks ??
    player.total_packs ??
    player.openedPacks ??
    0
  );
}

function getCardCount(player) {
  if (typeof player.totalCards === "number") return player.totalCards;
  if (typeof player.cardCount === "number") return player.cardCount;
  if (typeof player.total_cards === "number") return player.total_cards;
  if (Array.isArray(player.cards)) return player.cards.length;
  if (player.cards && typeof player.cards === "object") return Object.keys(player.cards).length;
  if (player.collection && typeof player.collection === "object") return Object.keys(player.collection).length;
  return 0;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", loadLeaderboard);
