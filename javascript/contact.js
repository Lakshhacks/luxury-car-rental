
/* ==========================================
   LUXURY CAR RENTAL - CONTACT PAGE
   File: javascript/contact.js
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("[data-contact-form]") ||
        document.querySelector(".contact-form");

    if (!form) return;

    const feedback = form.querySelector("[data-contact-message]") ||
        document.querySelector("[data-contact-message]");

    const submitButton = form.querySelector('[type="submit"]');

    function showMessage(message, type) {
        if (!feedback) {
            alert(message);
            return;
        }

        feedback.textContent = message;
        feedback.className = `contact-feedback show ${type}`;
        feedback.hidden = false;
        feedback.setAttribute("role", type === "error" ? "alert" : "status");
    }

    function clearMessage() {
        if (!feedback) return;

        feedback.textContent = "";
        feedback.hidden = true;
        feedback.className = "contact-feedback";
    }

    // Clear old feedback when the user edits the form.
    form.querySelectorAll("input, textarea, select").forEach(field => {
        field.addEventListener("input", clearMessage);
        field.addEventListener("change", clearMessage);
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();
        clearMessage();

        if (!form.reportValidity()) return;

        // Optional honeypot field to discourage simple automated spam.
        const honeypot = form.querySelector('[name="website"]');

        if (honeypot?.value.trim()) {
            showMessage(
                "Your message could not be processed.",
                "error"
            );
            return;
        }

        const endpoint = form.dataset.endpoint;

        // Without a backend endpoint, validate but do not claim delivery.
        if (!endpoint) {
            showMessage(
                "Your form is valid, but your message has not been sent. " +
                "Connect a backend or form service to enable delivery.",
                "success"
            );
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.dataset.originalText = submitButton.textContent;
            submitButton.textContent = "Sending...";
        }

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                body: new FormData(form),
                headers: {
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("The server could not accept your message.");
            }

            showMessage(
                "Thank you! Your message was submitted successfully.",
                "success"
            );

            form.reset();
        } catch (error) {
            showMessage(
                error.message ||
                "Unable to send your message. Please try again later.",
                "error"
            );
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent =
                    submitButton.dataset.originalText || "Send Message";
            }
        }
    });
});
