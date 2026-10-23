
/* ==========================================
   LUXURY CAR RENTAL - MAIN JAVASCRIPT
   File: javascript/main.js
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Mobile navigation
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    if (menuToggle && navMenu) {
        menuToggle.setAttribute("aria-expanded", "false");

        menuToggle.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("open");

            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation menu" : "Open navigation menu"
            );

            menuToggle.textContent = isOpen ? "\u00D7" : "\u2630";
        });

        navMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.setAttribute("aria-label", "Open navigation menu");
                menuToggle.textContent = "\u2630";
            });
        });

        document.addEventListener("click", event => {
            if (
                !navMenu.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                navMenu.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.textContent = "\u2630";
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                navMenu.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.textContent = "\u2630";
                menuToggle.focus();
            }
        });
    }

    // Automatically highlight the current navigation link.
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".nav-menu a").forEach(link => {
        try {
            const linkPage = new URL(link.href, window.location.href)
                .pathname.split("/").pop();

            if (linkPage === currentPage) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            }
        } catch {
            // Ignore invalid navigation URLs.
        }
    });

    // Automatically update copyright year.
    document.querySelectorAll("[data-current-year], .footer-year").forEach(element => {
        element.textContent = new Date().getFullYear();
    });

    // Newsletter demo feedback.
    document.querySelectorAll("[data-newsletter-form]").forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();

            if (!form.reportValidity()) return;

            const message = form.querySelector("[data-newsletter-message]");

            if (message) {
                message.textContent =
                    "Thank you! Connect a newsletter service to save subscriptions.";
                message.hidden = false;
            }

            form.reset();
        });
    });

    // Smooth scrolling for in-page links.
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", event => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (target) {
                event.preventDefault();
                target.scrollIntoView({
                    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                        ? "auto"
                        : "smooth",
                    block: "start"
                });
            }
        });
    });
});
