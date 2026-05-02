// Login page logic. Submits credentials to the FastAPI auth endpoint, which
// sets an HTTP-only cookie on success. The cookie is invisible to this script,
// but the browser will send it on subsequent navigations and fetches.

(function () {
  const form = document.getElementById("login-form");
  const errorEl = document.getElementById("error");
  const submitBtn = document.getElementById("submit");

  // If we're already signed in, jump straight to the dashboard.
  fetch("/api/auth/me", { credentials: "same-origin" })
    .then((r) => { if (r.ok) window.location.replace("/dashboard/"); })
    .catch(() => {});

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    submitBtn.disabled = true;

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        window.location.replace("/dashboard/");
        return;
      }

      // Don't reveal which field was wrong; the server returns the same message anyway.
      errorEl.textContent = "Invalid username or password.";
    } catch (err) {
      errorEl.textContent = "Could not reach the server. Try again.";
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
