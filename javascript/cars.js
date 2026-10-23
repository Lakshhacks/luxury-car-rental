
/* ==========================================
   LUXURY CAR RENTAL - CARS PAGE
   File: javascript/cars.js
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".cars-grid");
    if (!grid) return;

    const cards = [...grid.querySelectorAll(".car-card")];
    const searchForm = document.querySelector(".cars-search-form");
    const searchInput = document.querySelector(
        '[data-car-search], .cars-search-field input[type="search"]'
    );
    const categorySelect = document.querySelector("[data-category-select]");
    const sortSelect = document.querySelector(".cars-sort select");
    const priceRange = document.querySelector(
        'input[type="range"][data-price-range]'
    );
    const priceMin = document.querySelector("[data-price-min]");
    const priceMax = document.querySelector("[data-price-max]");
    const countElement = document.querySelector(".cars-results-count strong");
    const emptyState = document.querySelector(".cars-empty-state");
    const resetButton = document.querySelector(".cars-filter-reset");
    const viewButtons = document.querySelectorAll(".cars-view-btn");
    const filterCheckboxes = document.querySelectorAll(
        "[data-filter-category]"
    );

    // Read and normalize car data from each card.
    const getCarData = card => ({
        name: (
            card.dataset.name ||
            card.querySelector(".car-card-title")?.textContent ||
            ""
        ).toLowerCase(),
        category: (card.dataset.category || "").toLowerCase(),
        price: Number(
            card.dataset.price ||
            card.querySelector(".car-card-price strong")?.textContent
                ?.replace(/[^\d.]/g, "") ||
            0
        )
    });

    const initialCards = cards.map((card, index) => ({
        card,
        index,
        ...getCarData(card)
    }));

    const favoriteKey = "luxuryCarRentalFavorites";

    function getFavorites() {
        try {
            const data = JSON.parse(localStorage.getItem(favoriteKey) || "[]");
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    function getCarId(card, index) {
        return card.dataset.id || card.dataset.name ||
            card.querySelector(".car-card-title")?.textContent.trim() ||
            String(index);
    }

    // Set initial price slider maximum from available cars.
    if (priceRange && cards.length) {
        const maximum = Math.max(...initialCards.map(item => item.price), 0);

        if (!priceRange.hasAttribute("max")) {
            priceRange.max = String(maximum);
        }

        if (!priceRange.hasAttribute("value")) {
            priceRange.value = String(maximum);
        }

        if (priceMax) {
            priceMax.textContent = formatPrice(Number(priceRange.value));
        }
    }

    function formatPrice(price) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        }).format(price);
    }

    // Favorites persist in this browser only.
    function initializeFavorites() {
        const favorites = getFavorites();

        initialCards.forEach(({ card, index }) => {
            const button = card.querySelector(".car-card-favorite");
            if (!button) return;

            const id = getCarId(card, index);
            const active = favorites.includes(id);

            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
            button.setAttribute(
                "aria-label",
                active ? "Remove from favorites" : "Add to favorites"
            );
        });
    }

    grid.addEventListener("click", event => {
        const button = event.target.closest(".car-card-favorite");
        if (!button) return;

        const card = button.closest(".car-card");
        const index = cards.indexOf(card);
        if (!card) return;

        const id = getCarId(card, index);
        const favorites = getFavorites();
        const active = favorites.includes(id);
        const updated = active
            ? favorites.filter(item => item !== id)
            : [...favorites, id];

        try {
            localStorage.setItem(favoriteKey, JSON.stringify(updated));
        } catch {
            // Favorites will work for the current page even if storage is blocked.
        }

        button.classList.toggle("active", !active);
        button.setAttribute("aria-pressed", String(!active));
        button.setAttribute(
            "aria-label",
            active ? "Add to favorites" : "Remove from favorites"
        );
    });

    function applyFilters() {
        const searchTerm = (searchInput?.value || "").trim().toLowerCase();
        const selectedCategory = (categorySelect?.value || "").toLowerCase();
        const maxPrice = priceRange
            ? Number(priceRange.value)
            : Infinity;

        const selectedCategories = [...filterCheckboxes]
            .filter(input => input.checked)
            .map(input => (
                input.dataset.filterCategory ||
                input.value
            ).toLowerCase());

        let visible = initialCards.filter(item => {
            const searchableText = [
                item.name,
                item.category,
                item.card.textContent
            ].join(" ").toLowerCase();

            const matchesSearch = searchableText.includes(searchTerm);

            const matchesSelect = !selectedCategory ||
                selectedCategory === "all" ||
                item.category === selectedCategory;

            const matchesCheckboxes = selectedCategories.length === 0 ||
                selectedCategories.includes(item.category);

            const matchesPrice = item.price <= maxPrice;

            return matchesSearch &&
                matchesSelect &&
                matchesCheckboxes &&
                matchesPrice;
        });

        const sortValue = sortSelect?.value || "default";

        if (sortValue === "price-low") {
            visible.sort((a, b) => a.price - b.price);
        } else if (sortValue === "price-high") {
            visible.sort((a, b) => b.price - a.price);
        } else if (sortValue === "name") {
            visible.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortValue === "name-desc") {
            visible.sort((a, b) => b.name.localeCompare(a.name));
        } else {
            visible.sort((a, b) => a.index - b.index);
        }

        visible.forEach(item => grid.appendChild(item.card));

        initialCards.forEach(item => {
            item.card.hidden = !visible.includes(item);
        });

        if (countElement) {
            countElement.textContent = String(visible.length);
        }

        if (emptyState) {
            emptyState.classList.toggle("visible", visible.length === 0);
        }

        // Reapply the selected view after filtering.
        grid.classList.toggle(
            "list-view",
            grid.dataset.view === "list"
        );
    }

    function resetFilters() {
        if (searchInput) searchInput.value = "";
        if (categorySelect) categorySelect.value = "";

        filterCheckboxes.forEach(input => {
            input.checked = false;
        });

        if (priceRange) {
            priceRange.value = priceRange.max;
            if (priceMax) {
                priceMax.textContent = formatPrice(Number(priceRange.value));
            }
        }

        if (priceMin) priceMin.textContent = formatPrice(0);

        if (sortSelect) sortSelect.value = "default";

        applyFilters();
    }

    // Search form
    if (searchForm) {
        searchForm.addEventListener("submit", event => {
            event.preventDefault();
            applyFilters();
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    if (categorySelect) {
        categorySelect.addEventListener("change", applyFilters);
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", applyFilters);
    }

    filterCheckboxes.forEach(input => {
        input.addEventListener("change", applyFilters);
    });

    if (priceRange) {
        priceRange.addEventListener("input", () => {
            if (priceMax) {
                priceMax.textContent = formatPrice(Number(priceRange.value));
            }

            applyFilters();
        });
    }

    if (resetButton) {
        resetButton.addEventListener("click", resetFilters);
    }

    // Grid and list buttons.
    viewButtons.forEach(button => {
        button.addEventListener("click", () => {
            const view = button.dataset.view ||
                (button.classList.contains("list-view-btn") ? "list" : "grid");

            grid.dataset.view = view;
            grid.classList.toggle("list-view", view === "list");

            viewButtons.forEach(item => {
                const itemView = item.dataset.view ||
                    (item.classList.contains("list-view-btn") ? "list" : "grid");

                item.classList.toggle("active", itemView === view);
                item.setAttribute("aria-pressed", String(itemView === view));
            });
        });
    });

    initializeFavorites();
    applyFilters();
});
