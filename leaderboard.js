window.addEventListener("load", async function () {
  const leaderboardBody = document.getElementById("leaderboard-body");
  const leaderboardStatus = document.getElementById("leaderboard-status");

  try {
    const response = await fetch("./ygo_stats.json?t=" + Date.now());

    if (!response.ok) {
      throw new Error("Failed to load ygo_stats.json");
    }

    const data = await response.json();
    console.log("Loaded stats JSON:", data);

    if (!data.leaderboard || !Array.isArray(data.leaderboard)) {
      throw new Error("No leaderboard array found in ygo_stats.json");
    }

    const rankings = data.leaderboard
      .slice()
      .sort((a, b) => {
        if ((b.packsOpened || 0) !== (a.packsOpened || 0)) {
          return (b.packsOpened || 0) - (a.packsOpened || 0);
        }
        return (b.totalCards || 0) - (a.totalCards || 0);
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
        <td>${escapeHtml(user.username || "Unknown User")}</td>
        <td>${user.packsOpened || 0}</td>
        <td>${user.totalCards || 0}</td>
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
});

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
