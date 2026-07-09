(() => {
    'use strict';

    const setupResourceFilters = () => {
        const gallery = document.getElementById('resource-gallery');
        const pills = Array.from(document.querySelectorAll('[data-resource-category]'));
        const title = document.getElementById('resource-gallery-title');
        const count = document.getElementById('resource-gallery-count');

        if (!gallery || !pills.length || !title || !count) return;

        const cards = Array.from(gallery.querySelectorAll('[data-tags]'));
        const allPill = pills.find((pill) => pill.dataset.resourceCategory === 'all') || pills[0];
        const categoryNames = new Set(pills.map((pill) => pill.dataset.resourceCategory));
        const cardMatchesCategories = (card, categories) => {
            const tags = card.dataset.tags.split(',').map((tag) => tag.trim());
            return categories.every((category) => tags.includes(category));
        };

        const getCategoriesFromLocation = () => {
            const url = new URL(window.location.href);
            const queryCategories = url.searchParams.get('categories');

            if (queryCategories) {
                return queryCategories.split(',').filter((category) => categoryNames.has(category) && category !== 'all');
            }

            const matchingPill = pills.find((pill) => new URL(pill.href).pathname === url.pathname);
            return matchingPill && matchingPill !== allPill ? [matchingPill.dataset.resourceCategory] : [];
        };

        const setCategories = (categories, { updateHistory = false } = {}) => {
            const selectedCategories = [...new Set(categories)].filter((category) => categoryNames.has(category) && category !== 'all');
            let visibleCount = 0;

            cards.forEach((card) => {
                const matches = cardMatchesCategories(card, selectedCategories);
                card.hidden = !matches;
                visibleCount += matches ? 1 : 0;
            });

            pills.forEach((pill) => {
                const category = pill.dataset.resourceCategory;
                const isActive = category === 'all' ? selectedCategories.length === 0 : selectedCategories.includes(category);
                pill.classList.toggle('active', isActive);
                pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                pill.toggleAttribute('aria-current', selectedCategories.length === 1 && isActive);

                const candidateCategories = category === 'all' || selectedCategories.includes(category)
                    ? selectedCategories
                    : [...selectedCategories, category];
                const countLabel = pill.querySelector('.mg-showcase-filter-count');

                if (countLabel) {
                    countLabel.textContent = cards.filter((card) => cardMatchesCategories(card, candidateCategories)).length;
                }
            });

            title.textContent = selectedCategories.length
                ? selectedCategories.map((category) => pills.find((pill) => pill.dataset.resourceCategory === category).dataset.resourceLabel).join(' + ')
                : 'All resources';
            count.textContent = `${visibleCount} ${visibleCount === 1 ? 'resource' : 'resources'}`;

            if (updateHistory) {
                const url = new URL(allPill.href, window.location.origin);

                if (selectedCategories.length === 1) {
                    const selectedPill = pills.find((pill) => pill.dataset.resourceCategory === selectedCategories[0]);
                    url.pathname = new URL(selectedPill.href).pathname;
                } else if (selectedCategories.length > 1) {
                    url.searchParams.set('categories', selectedCategories.join(','));
                }

                window.history.pushState({ resourceCategories: selectedCategories }, '', url);
            }
        };

        pills.forEach((pill) => {
            const category = pill.dataset.resourceCategory;

            pill.addEventListener('click', (event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

                event.preventDefault();
                const selectedCategories = getCategoriesFromLocation();
                const nextCategories = category === 'all'
                    ? []
                    : selectedCategories.includes(category)
                        ? selectedCategories.filter((selectedCategory) => selectedCategory !== category)
                        : [...selectedCategories, category];

                setCategories(nextCategories, { updateHistory: true });
            });
        });

        window.addEventListener('popstate', () => setCategories(getCategoriesFromLocation()));
        setCategories(getCategoriesFromLocation());
    };

    document.addEventListener('DOMContentLoaded', setupResourceFilters);
})();
