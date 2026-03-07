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
    const response = await fetch("ygo_stats.json");

    if (!response.ok) {
      throw new Error("Failed to load ygo_stats.json");
    }

    const data = await response.json();
    const users = data.users || [];

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
  } catch (error) {
    console.error(error);
    totalUsersText.textContent = "Error";
    leaderboardTable.innerHTML = '<div class="empty-state">Could not load leaderboard.</div>';
  }
}

loadLeaderboard();
