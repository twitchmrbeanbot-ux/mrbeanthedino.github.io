const leaderboardTable = document.getElementById("leaderboardTable");
const totalUsersText = document.getElementById("totalUsersText");

const rarityRank = {
  Common: 1,
  Rare: 2,
  Super: 3,
  Ultra: 4,
  Secret: 5,
  Collector: 6
};

async function loadLeaderboard() {
  try {
    // Try stats file first
    const statsResponse = await fetch("ygo_stats.json");

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      const users = statsData.users || [];

      renderStatsLeaderboard(users);
      return;
    }

    throw new Error("ygo_stats.json not available");
  } catch (statsError) {
    console.warn("Stats leaderboard unavailable, falling back to collection data.", statsError);

    try {
      const collectionResponse = await fetch("ygo_collection.json");

      if (!collectionResponse.ok) {
        throw new Error("Failed to load ygo_collection.json");
      }

      const collectionData = await collectionResponse.json();
      const cards = collectionData.cards || [];
      const users = {};

      cards.forEach(card => {
        const username = String(card.username || "").trim();
        if (!username) return;

        if (!users[username]) {
          users[username] = {
            username: username,
            totalCards: 0,
            bestCard: "None",
            bestRarity: "-",
            bestRank: 0
          };
        }

        users[username].totalCards++;

        const rank = rarityRank[card.rarity] || 0;
        if (rank > users[username].bestRank) {
          users[username].bestRank = rank;
          users[username].bestRarity = card.rarity || "-";
          users[username].bestCard = card.cardName || "Unknown Card";
        }
      });

      const rows = Object.values(users).sort((a, b) => {
        if ((b.totalCards || 0) !== (a.totalCards || 0)) return (b.totalCards || 0) - (a.totalCards || 0);
        return (b.bestRank || 0) - (a.bestRank || 0);
      });

      totalUsersText.textContent = rows.length + " users ranked";

      if (rows.length === 0) {
        leaderboardTable.innerHTML = '<div class="empty-state">No collection data found.</div>';
        return;
      }

      let html = `
        <div class="leaderboard-grid leaderboard-head">
          <div>Rank</div>
          <div>User</div>
          <div>Cards</div>
          <div>Best Rarity</div>
          <div>Best Card</div>
        </div>
      `;

      rows.forEach((user, index) => {
        html += `
          <div class="leaderboard-grid leaderboard-row">
            <div>#${index + 1}</div>
            <div><a class="leaderboard-link" href="index.html?user=${encodeURIComponent(user.username)}">${user.username}</a></div>
            <div>${user.totalCards || 0}</div>
            <div>${user.bestRarity || "-"}</div>
            <div>${user.bestCard || "None"}</div>
          </div>
        `;
      });

      leaderboardTable.innerHTML = html;
    } catch (collectionError) {
      console.error(collectionError);
      totalUsersText.textContent = "Error";
      leaderboardTable.innerHTML = '<div class="empty-state">Could not load leaderboard data.</div>';
    }
  }
}

function renderStatsLeaderboard(users) {
  const rows = users.sort((a, b) => {
    if ((b.packs || 0) !== (a.packs || 0)) return (b.packs || 0) - (a.packs || 0);

    const aRank = rarityRank[a.bestRarity] || 0;
    const bRank = rarityRank[b.bestRarity] || 0;
    return bRank - aRank;
  });

  totalUsersText.textContent = rows.length + " users ranked";

  if (rows.length === 0) {
    leaderboardTable.innerHTML = '<div class="empty-state">No stats data found.</div>';
    return;
  }

  let html = `
    <div class="leaderboard-grid leaderboard-head">
      <div>Rank</div>
      <div>User</div>
      <div>Packs</div>
      <div>Cards</div>
      <div>Best Pull</div>
    </div>
  `;

  rows.forEach((user, index) => {
    html += `
      <div class="leaderboard-grid leaderboard-row">
        <div>#${index + 1}</div>
        <div><a class="leaderboard-link" href="index.html?user=${encodeURIComponent(user.username)}">${user.username}</a></div>
        <div>${user.packs || 0}</div>
        <div>${user.totalCards || 0}</div>
        <div>${user.bestRarity || "-"}${user.bestCard ? " — " + user.bestCard : ""}</div>
      </div>
    `;
  });

  leaderboardTable.innerHTML = html;
}

loadLeaderboard();
