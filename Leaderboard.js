window.addEventListener("load", async function () {
  console.log("leaderboard.js started");

  const leaderboardBody = document.getElementById("leaderboard-body");
  const leaderboardStatus = document.getElementById("leaderboard-status");

  console.log("body found:", !!leaderboardBody);
  console.log("status found:", !!leaderboardStatus);

  try {
    const response = await fetch("./ygo_stats.json?t=" + Date.now());
    console.log("fetch status:", response.status);

    const data = await response.json();
    console.log("json data:", data);

    if (!data.users || !Array.isArray(data.users)) {
      throw new Error("No users array found in ygo_stats.json");
    }

    const rankings = data.users.slice().sort((a, b) => {
      if ((b.packs || 0) !== (a.packs || 0)) {
        return (b.packs || 0) - (a.packs || 0);
      }
      return (b.totalCards || 0) - (a.totalCards || 0);
    });

    console.log("rankings:", rankings);

    leaderboardStatus.style.display = "none";
    leaderboardBody.innerHTML = rankings.map((user, index) => `
      <tr>
        <td>#${index + 1}</td>
        <td>${user.username || "Unknown User"}</td>
        <td>${user.packs || 0}</td>
        <td>${user.totalCards || 0}</td>
      </tr>
    `).join("");

  } catch (error) {
    console.error("Leaderboard error:", error);
    if (leaderboardStatus) leaderboardStatus.textContent = "Failed to load leaderboard.";
    if (leaderboardBody) {
      leaderboardBody.innerHTML = `<tr><td colspan="4">Error loading leaderboard data.</td></tr>`;
    }
  }
});
