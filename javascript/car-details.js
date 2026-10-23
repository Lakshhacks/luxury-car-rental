
/* ==========================================
   LUXURY CAR RENTAL - CAR DETAILS
   File: javascript/car-details.js
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector("[data-car-gallery]");
    const mainImage = document.querySelector("[data-main-car-image]");
    const thumbnails = document.querySelectorAll("[data-car-thumbnail]");

    // Image gallery.
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener("click", () => {
            const imageUrl = thumbnail.dataset.image ||
                thumbnail.querySelector("img")?.src;

            if (!imageUrl || !mainImage) return;

            mainImage.src = imageUrl;

            thumbnails.forEach(item => {
                item.classList.remove("active");
                item.setAttribute("aria-pressed", "false");
            });

            thumbnail.classList.add("active");
            thumbnail.setAttribute("aria-pressed", "true");
        });
    });

    // Read the selected car details from the page.
    const details = document.querySelector("[data-car-details]") ||
        document.querySelector(".car-details");

    const carName = details?.dataset.carName ||
        document.querySelector("[data-car-name]")?.textContent.trim() ||
        document.querySelector(".car-details-title")?.textContent.trim() ||
        document.querySelector("h1")?.textContent.trim() ||
        "Luxury Vehicle";

    const dailyRate = Number(
        details?.dataset.dailyRate ||
        document.querySelector("[data-daily-rate]")?.dataset.dailyRate ||
        document.querySelector("[data-daily-rate]")?.textContent.replace(/[^\d.]/g, "") ||
        0
    );

    const currency = details?.dataset.currency || "USD";

    const pickupInput = document.querySelector("[data-pickup-date]");
    const returnInput = document.querySelector("[data-return-date]");
    const estimateElement = document.querySelector("[data-rental-estimate]");
    const daysElement = document.querySelector("[data-rental-days]");
    const bookingButton = document.querySelector("[data-book-car]");

    function localDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function parseDate(value) {
        if (!value) return null;

        const date = new Date(`${value}T12:00:00`);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function rentalDays() {
        const pickup = parseDate(pickupInput?.value);
        const dropoff = parseDate(returnInput?.value);

        if (!pickup || !dropoff || dropoff <= pickup) return 0;

        return Math.round((dropoff - pickup) / 86400000);
    }

    function formatMoney(amount) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function updateEstimate() {
        const days = rentalDays();

        if (daysElement) {
            daysElement.textContent = days
                ? `${days} day${days === 1 ? "" : "s"}`
                : "Select valid dates";
        }

        if (estimateElement) {
            estimateElement.textContent = days
                ? formatMoney(days * dailyRate)
                : formatMoney(0);
        }

        if (returnInput && pickupInput?.value) {
            returnInput.min = pickupInput.value;
        }

        if (bookingButton) {
            bookingButton.disabled = days === 0;
        }

        return days;
    }

    // Set today's date as the earliest pickup date.
    const today = localDateString(new Date());

    if (pickupInput) {
        pickupInput.min = today;

        if (!pickupInput.value) {
            pickupInput.value = today;
        }
    }

    if (returnInput) {
        returnInput.min = pickupInput?.value || today;

        if (!returnInput.value) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            returnInput.value = localDateString(tomorrow);
        }
    }

    pickupInput?.addEventListener("change", () => {
        if (
            returnInput &&
            returnInput.value &&
            returnInput.value <= pickupInput.value
        ) {
            const nextDay = parseDate(pickupInput.value);
            nextDay.setDate(nextDay.getDate() + 1);
            returnInput.value = localDateString(nextDay);
        }

        updateEstimate();
    });

    returnInput?.addEventListener("change", updateEstimate);

    // Save selected vehicle and dates before moving to booking.
    bookingButton?.addEventListener("click", event => {
        const days = updateEstimate();

        if (!days) {
            event.preventDefault();
            alert("Please select valid pickup and return dates.");
            return;
        }

        const booking = {
            carName,
            dailyRate,
            currency,
            pickupDate: pickupInput.value,
            returnDate: returnInput.value,
            days,
            estimatedTotal: days * dailyRate
        };

        try {
            sessionStorage.setItem(
                "luxuryCarRentalBooking",
                JSON.stringify(booking)
            );
        } catch {
            alert("Unable to save your selection. Please try again.");
            event.preventDefault();
            return;
        }

        // A link navigates naturally; a button can navigate here.
        if (bookingButton.tagName === "BUTTON") {
            window.location.href =
                bookingButton.dataset.bookingUrl || "booking.html";
        }
    });

    updateEstimate();
});
