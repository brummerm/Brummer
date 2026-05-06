// Dashboard: gates page on auth, renders tiles, wires up sign-out.

(async function () {
  // Auth gate. If not signed in, send to /login. The cookie is HTTP-only,
  // so we can't read it from JS — we just ask the server.
  try {
    const res = await fetch("/api/auth/me", { credentials: "same-origin" });
    if (!res.ok) {
      window.location.replace("/login/");
      return;
    }
    const data = await res.json();
    document.getElementById("username").textContent = data.username;
  } catch (e) {
    window.location.replace("/login/");
    return;
  }

  // Render tiles
  const grid = document.getElementById("grid");
  for (const app of window.APPS || []) {
    const a = document.createElement("a");
    a.className = "tile" + (app.enabled === false ? " disabled" : "");
    a.href = app.enabled === false ? "#" : app.href;
    if (app.target) a.target = app.target;

    a.innerHTML = `
      <div class="icon">${app.icon || "▢"}</div>
      <h2 class="title">${app.title}</h2>
      <p class="desc">${app.desc || ""}</p>
    `;
    grid.appendChild(a);
  }

  // Sign out
  document.getElementById("logout").addEventListener("click", async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } catch (e) { /* ignore */ }
    window.location.replace("/login/");
  });
})();
