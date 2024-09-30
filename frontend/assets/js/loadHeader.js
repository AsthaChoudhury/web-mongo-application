// assets/js/loadHeader.js
export function loadHeader() {
  fetch("/header.html")
    .then((response) => response.text())
    .then((data) => {
      document.querySelector("#header-container").innerHTML = data;
      updateAuthButtons();
    })
    .catch((error) => console.error("Error loading header:", error));
}

function updateAuthButtons() {
  fetch("/api/user/status", {
    method: "GET",
    credentials: "include", // Ensure credentials are sent with the request
  })
    .then((response) => response.json())
    .then((data) => {
      const authButtons = document.querySelector("#auth-buttons");

      if (data.loggedIn) {
        authButtons.innerHTML = `
              <a href="/profile" class="header__action-btn">Profile</a>
              <a href="/api/user/logout" id="logout" class="header__login-btn">Logout</a>
          `;

        document
          .querySelector("#logout")
          ?.addEventListener("click", (event) => {
            event.preventDefault();
            fetch("/api/user/logout", {
              method: "GET",
              credentials: "include",
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.message === "Logged out successfully") {
                  window.location.href = "/login"; // Redirect to login page
                }
              })
              .catch((error) => console.error("Error logging out:", error));
          });
      } else {
        authButtons.innerHTML = `
              <a href="/login" class="header__login-btn">Login</a>
              <a href="/register" class="header__register-btn">Register</a>
          `;
      }
    })
    .catch((error) =>
      console.error("Error loading authentication status:", error)
    );
}
