async function loadLeaderboard() {
  const leaderboardBody = document.getElementById("leaderboard-body");
  const leaderboardStatus = document.getElementById("leaderboard-status");

  try {
    const response = await fetch("./ygo_collection.json?t=" + Date.now());
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    console.log("YGO JSON loaded:", data);

    if (!data.cards || !Array.isArray(data.cards)) {
      throw new Error("JSON does not contain a valid cards array.");
    }

    const userMap = {};

    data.cards.forEach(card => {
      const userId = card.userId || "unknown";
      const username = card.username || "Unknown User";

      if (!userMap[userId]) {
        userMap[userId] = {
          userId: userId,
          username: username,
          cards: 0
        };
      }

      userMap[userId].cards += 1;
      userMap[userId].username = username;
    });

    const rankings = Object.values(userMap)
      .map(user => ({
        username: user.username,
        cards: user.cards,
        packs: Math.floor(user.cards / 8)
      }))
      .sort((a, b) => {
        if (b.packs !== a.packs) return b.packs - a.packs;
        return b.cards - a.cards;
      });

    if (!rankings.length) {
      leaderboardStatus.textContent = "No leaderboard data found.";
      leaderboardBody.innerHTML = `
        <tr>
          <td colspan="4">No users found.</td>
        </tr>
      `;
      return;
    }

    leaderboardStatus.style.display = "none";

    leaderboardBody.innerHTML = rankings.map((user, index) => `
      <tr>
        <td>#${index + 1}</td>
        <td>${escapeHtml(user.username)}</td>
        <td>${user.packs}</td>
        <td>${user.cards}</td>
      </tr>
    `).join("");

  } catch (error) {
    console.error("Leaderboard load error:", error);
    leaderboardStatus.textContent = "Failed to load leaderboard.";
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="4">Error loading leaderboard data.</td>
      </tr>
    `;
  }
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
