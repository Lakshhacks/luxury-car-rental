
/* ==========================================
   LUXURY CAR RENTAL - BOOKING PAGE
   File: javascript/booking.js
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("[data-booking-form]") ||
        document.querySelector(".booking-form");

    if (!form) return;

    const carNameElement = document.querySelector("[data-booking-car]");
    const dailyRateElement = document.querySelector("[data-booking-rate]");
    const daysElement = document.querySelector("[data-booking-days]");
    const subtotalElement = document.querySelector("[data-booking-subtotal]");
    const extrasElement = document.querySelector("[data-booking-extras]");
    const totalElement = document.querySelector("[data-booking-total]");
    const messageElement = document.querySelector("[data-booking-message]");
    const pickupInput = form.querySelector('[name="pickupDate"]');
    const returnInput = form.querySelector('[name="returnDate"]');
    const submitButton = form.querySelector('[type="submit"]');

    let selectedCar = {};

    try {
        selectedCar = JSON.parse(
            sessionStorage.getItem("luxuryCarRentalBooking") || "{}"
        ) || {};
    } catch {
        selectedCar = {};
    }

    const currency = selectedCar.currency || "USD";
    const dailyRate = Number(selectedCar.dailyRate) || 0;

    function money(value) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            maximumFractionDigits: 2
        }).format(value);
    }

    function dateDays() {
        if (!pickupInput?.value || !returnInput?.value) return 0;

        const start = new Date(`${pickupInput.value}T12:00:00`);
        const end = new Date(`${returnInput.value}T12:00:00`);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) ||
            end <= start
        ) {
            return 0;
        }

        return Math.round((end - start) / 86400000);
    }

    function checkedCost(selector) {
        return [...form.querySelectorAll(selector)]
            .filter(input => input.checked)
            .reduce((total, input) => {
                return total + (Number(input.dataset.price) || 0);
            }, 0);
    }

    function updateSummary() {
        const days = dateDays();
        const subtotal = days * dailyRate;

        // Optional extras use data-price="..." on checkboxes.
        const extraPerDay = checkedCost(
            '[data-extra-type="daily"]'
        );

        const extraOneTime = checkedCost(
            '[data-extra-type="once"]'
        );

        const extras = (extraPerDay * days) + extraOneTime;
        const total = subtotal + extras;

        if (carNameElement) {
            carNameElement.textContent = selectedCar.carName ||
                "Please select a vehicle";
        }

        if (dailyRateElement) {
            dailyRateElement.textContent = money(dailyRate);
        }

        if (daysElement) {
            daysElement.textContent = String(days);
        }

        if (subtotalElement) {
            subtotalElement.textContent = money(subtotal);
        }

        if (extrasElement) {
            extrasElement.textContent = money(extras);
        }

        if (totalElement) {
            totalElement.textContent = money(total);
        }

        if (returnInput && pickupInput?.value) {
            returnInput.min = pickupInput.value;
        }

        return { days, subtotal, extras, total };
    }

    function showMessage(message, type = "error") {
        if (!messageElement) {
            alert(message);
            return;
        }

        messageElement.textContent = message;
        messageElement.className =
            `booking-message ${type} show`;
        messageElement.hidden = false;
        messageElement.setAttribute("role", "status");
    }

    // Populate the form with previously selected dates.
    if (pickupInput && selectedCar.pickupDate) {
        pickupInput.value = selectedCar.pickupDate;
    }

    if (returnInput && selectedCar.returnDate) {
        returnInput.value = selectedCar.returnDate;
    }

    const today = new Date();
    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    if (pickupInput) {
        pickupInput.min = todayString;
    }

    if (returnInput) {
        returnInput.min = pickupInput?.value || todayString;
    }

    pickupInput?.addEventListener("change", () => {
        if (
            returnInput &&
            pickupInput.value &&
            returnInput.value <= pickupInput.value
        ) {
            const nextDate = new Date(`${pickupInput.value}T12:00:00`);
            nextDate.setDate(nextDate.getDate() + 1);

            returnInput.value = [
                nextDate.getFullYear(),
                String(nextDate.getMonth() + 1).padStart(2, "0"),
                String(nextDate.getDate()).padStart(2, "0")
            ].join("-");
        }

        updateSummary();
    });

    returnInput?.addEventListener("change", updateSummary);

    form.querySelectorAll("[data-extra-type]").forEach(input => {
        input.addEventListener("change", updateSummary);
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        if (!selectedCar.carName || dailyRate <= 0) {
            showMessage(
                "Please select a vehicle from the cars page before booking."
            );
            return;
        }

        const totals = updateSummary();

        if (totals.days <= 0) {
            showMessage("Please choose valid pickup and return dates.");
            return;
        }

        const formData = new FormData(form);
        const bookingReference = "DEMO-" +
            Math.random().toString(36).slice(2, 8).toUpperCase();

        // Demo confirmation only: no reservation is sent to a server.
        const confirmation = {
            reference: bookingReference,
            carName: selectedCar.carName,
            pickupDate: pickupInput.value,
            returnDate: returnInput.value,
            days: totals.days,
            estimatedTotal: totals.total,
            currency,
            customerName: String(formData.get("fullName") || "")
        };

        showMessage(
            `Demo booking prepared successfully. Reference: ${bookingReference}. ` +
            `Estimated total: ${money(totals.total)}. ` +
            "No real reservation has been made.",
            "success"
        );

        const summary = document.querySelector("[data-booking-confirmation]");

        if (summary) {
            summary.hidden = false;
            summary.textContent =
                `Reference: ${confirmation.reference} | ` +
                `${confirmation.carName} | ` +
                `${confirmation.days} days | ` +
                `${money(confirmation.estimatedTotal)}`;
        }

        // Avoid accidental repeat submission during this demo interaction.
        if (submitButton) {
            submitButton.textContent = "Demo Booking Prepared";
            submitButton.disabled = true;
        }
    });

    updateSummary();
});
