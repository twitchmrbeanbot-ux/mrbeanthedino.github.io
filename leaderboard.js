<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>YGO Pack Leaderboard</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="site-shell">
    <header class="site-header">
      <div class="brand-block">
        <div class="eyebrow">Yu-Gi-Oh Viewer Project</div>
        <h1>Pack Leaderboard</h1>
        <p class="subtitle">Track pack openings and jump directly into a viewer’s binder.</p>
      </div>

      <nav class="site-nav">
        <a href="index.html">Binder</a>
        <a href="leaderboard.html" class="active">Leaderboard</a>
      </nav>
    </header>

    <main class="panel">
      <div class="panel-header">
        <h2>Top Pack Openers</h2>
        <p class="panel-copy">Click a viewer name to open their binder collection.</p>
      </div>

      <p id="leaderboard-status">Loading leaderboard...</p>

      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Viewer</th>
            <th>Packs Opened</th>
            <th>Cards</th>
          </tr>
        </thead>
        <tbody id="leaderboard-body">
          <tr>
            <td colspan="4">Loading...</td>
          </tr>
        </tbody>
      </table>
    </main>

    <footer class="site-footer">
      <p>
        This fan-made project is for entertainment only and is not affiliated with or endorsed by Konami.
        Yu-Gi-Oh! and related names/images belong to their respective owners.
      </p>
    </footer>
  </div>

  <script src="./leaderboard.js"></script>
</body>
</html>
