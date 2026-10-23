
/* ==========================================
   LUXURY CAR RENTAL - AUTHENTICATION PAGE
   File: javascript/auth.js
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#loginForm");
    const registerForm = document.querySelector("#registerForm");

    const loginPanel = document.querySelector("#loginPanel");
    const registerPanel = document.querySelector("#registerPanel");

    const loginSwitch = document.querySelectorAll("[data-show-login]");
    const registerSwitch = document.querySelectorAll("[data-show-register]");

    function showForm(type) {
        const showLogin = type === "login";

        if (loginPanel) loginPanel.hidden = !showLogin;
        if (registerPanel) registerPanel.hidden = showLogin;

        if (loginForm) loginForm.hidden = !showLogin;
        if (registerForm) registerForm.hidden = showLogin;

        loginSwitch.forEach(button => {
            button.classList.toggle("active", showLogin);
            button.setAttribute("aria-pressed", String(showLogin));
        });

        registerSwitch.forEach(button => {
            button.classList.toggle("active", !showLogin);
            button.setAttribute("aria-pressed", String(!showLogin));
        });

        const activeForm = showLogin ? loginForm : registerForm;
        activeForm?.querySelector("input:not([type='hidden'])")?.focus();
    }

    loginSwitch.forEach(button => {
        button.addEventListener("click", () => showForm("login"));
    });

    registerSwitch.forEach(button => {
        button.addEventListener("click", () => showForm("register"));
    });

    // Password visibility buttons should have data-toggle-password.
    document.querySelectorAll("[data-toggle-password]").forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.dataset.target;
            const input = targetId
                ? document.getElementById(targetId)
                : button.parentElement?.querySelector("input");

            if (!input || input.type !== "password" && input.type !== "text") {
                return;
            }

            const showPassword = input.type === "password";
            input.type = showPassword ? "text" : "password";

            button.setAttribute(
                "aria-label",
                showPassword ? "Hide password" : "Show password"
            );

            button.setAttribute("aria-pressed", String(showPassword));
        });
    });

    // Confirm password validation.
    if (registerForm) {
        const password = registerForm.querySelector('[name="password"]');
        const confirmPassword = registerForm.querySelector(
            '[name="confirmPassword"]'
        );

        function checkPasswords() {
            if (!password || !confirmPassword) return true;

            const matches = password.value === confirmPassword.value;

            confirmPassword.setCustomValidity(
                matches ? "" : "Passwords do not match."
            );

            return matches;
        }

        password?.addEventListener("input", checkPasswords);
        confirmPassword?.addEventListener("input", checkPasswords);
    }

    function showFeedback(form, message, type = "error") {
        let feedback = form.querySelector("[data-auth-message]");

        if (!feedback) {
            feedback = document.createElement("p");
            feedback.dataset.authMessage = "";
            feedback.setAttribute("role", "status");
            form.prepend(feedback);
        }

        feedback.className = `auth-message ${type}`;
        feedback.textContent = message;
    }

    // Login demo: validates input but does not sign a user in.
    loginForm?.addEventListener("submit", event => {
        event.preventDefault();

        if (!loginForm.reportValidity()) return;

        showFeedback(
            loginForm,
            "Your details passed basic validation. Connect an authentication backend to sign in.",
            "info"
        );
    });

    // Registration demo: never save or log the password in frontend storage.
    registerForm?.addEventListener("submit", event => {
        event.preventDefault();

        if (!registerForm.reportValidity()) return;

        const password = registerForm.querySelector('[name="password"]');
        const confirmPassword = registerForm.querySelector(
            '[name="confirmPassword"]'
        );

        if (
            password &&
            confirmPassword &&
            password.value !== confirmPassword.value
        ) {
            confirmPassword.setCustomValidity("Passwords do not match.");
            confirmPassword.reportValidity();
            return;
        }

        showFeedback(
            registerForm,
            "Your form is valid. Connect a secure registration backend to create an account.",
            "info"
        );
    });

    // Forgot-password demo.
    document.querySelectorAll("[data-forgot-password]").forEach(button => {
        button.addEventListener("click", () => {
            const form = button.closest("form");
            const email = form?.querySelector('[name="email"]');

            if (!email || !email.value.trim()) {
                email?.focus();
                showFeedback(
                    form,
                    "Enter your email address first to request a password reset."
                );
                return;
            }

            if (!email.checkValidity()) {
                email.reportValidity();
                return;
            }

            showFeedback(
                form,
                "Password reset requires a connected authentication service.",
                "info"
            );
        });
    });

    // Start with the panel marked active in HTML, or default to login.
    if (registerPanel?.hidden === false && !loginPanel) {
        showForm("register");
    } else {
        showForm("login");
    }
});
