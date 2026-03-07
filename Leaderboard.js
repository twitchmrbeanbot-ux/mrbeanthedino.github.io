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
    const response = await fetch("ygo_collection.json");

    if (!response.ok) {
      throw new Error("Failed to load ygo_collection.json");
    }

    const data = await response.json();
    const cards = data.cards || [];
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
      if (b.totalCards !== a.totalCards) return b.totalCards - a.totalCards;
      return b.bestRank - a.bestRank;
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
        <div>Total Cards</div>
        <div>Best Rarity</div>
        <div>Best Card</div>
      </div>
    `;

    rows.forEach((user, index) => {
      html += `
        <div class="leaderboard-grid leaderboard-row">
          <div>#${index + 1}</div>
          <div><a class="leaderboard-link" href="./index.html?user=${encodeURIComponent(user.username)}">${user.username}</a></div>
          <div>${user.totalCards}</div>
          <div>${user.bestRarity}</div>
          <div>${user.bestCard}</div>
        </div>
      `;
    });

    leaderboardTable.innerHTML = html;
  } catch (error) {
    console.error(error);
    totalUsersText.textContent = "Error";
    leaderboardTable.innerHTML = '<div class="empty-state">Could not load leaderboard.</div>';
  }
}

loadLeaderboard();
