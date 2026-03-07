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

    if (!data.users || !Array.isArray(data.users)) {
      throw new Error("No users array found in ygo_stats.json");
    }

    const rankings = data.users
      .slice()
      .sort((a, b) => {
        if ((b.packs || 0) !== (a.packs || 0)) {
          return (b.packs || 0) - (a.packs || 0);
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
        <td>${user.packs || 0}</td>
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
