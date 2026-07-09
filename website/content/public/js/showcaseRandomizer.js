(() => {
    'use strict';
    
    const shuffleShowcaseItems = () => {
        const container = document.getElementById('showcase-gallery');

        if (!container) return;

        const items = container.getElementsByClassName('mg-showcase-card');
        const order = Array.from( {length: items.length}, (value, index) => index);
        shuffleRandom(order);
        for(let i = 0; i < order.length; i++) {
            container.appendChild(items[order[i]]);
        }
    }

    const addHeroLogos = () => {
        const hero = document.querySelector('.mg-showcase-hero-logos');
        const logos = Array.from(document.querySelectorAll('.mg-showcase-card-logo'));

        if (!hero || !logos.length) return;

        shuffleRandom(logos);
        logos.slice(0, 10).forEach((logo, index) => {
            const floatingLogo = document.createElement('img');
            floatingLogo.src = logo.currentSrc || logo.src;
            floatingLogo.alt = '';
            floatingLogo.decoding = 'async';
            floatingLogo.className = `mg-showcase-hero-logo mg-showcase-hero-logo--${index + 1}`;
            hero.appendChild(floatingLogo);
        });
    };

    const setupShowcaseFilters = () => {
        const gallery = document.getElementById('showcase-gallery');
        const pills = Array.from(document.querySelectorAll('[data-showcase-category]'));
        const title = document.getElementById('showcase-gallery-title');
        const count = document.getElementById('showcase-gallery-count');

        if (!gallery || !pills.length || !title || !count) return;

        const cards = Array.from(gallery.querySelectorAll('[data-showcase-tags]'));
        const allPill = pills.find((pill) => pill.dataset.showcaseCategory === 'all') || pills[0];
        const categoryNames = new Set(pills.map((pill) => pill.dataset.showcaseCategory));
        const cardMatchesCategories = (card, categories) => {
            const tags = card.dataset.showcaseTags.split('|');
            return categories.every((category) => tags.includes(category));
        };

        const getCategoriesFromLocation = () => {
            const url = new URL(window.location.href);
            const queryCategories = url.searchParams.get('categories');

            if (queryCategories) {
                return queryCategories.split(',').filter((category) => categoryNames.has(category) && category !== 'all');
            }

            const matchingPill = pills.find((pill) => new URL(pill.href).pathname === url.pathname);
            return matchingPill && matchingPill !== allPill ? [matchingPill.dataset.showcaseCategory] : [];
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
                const category = pill.dataset.showcaseCategory;
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

            title.textContent = selectedCategories.length ? selectedCategories.join(' + ') : 'All projects';
            count.textContent = `${visibleCount} ${visibleCount === 1 ? 'project' : 'projects'} and counting`;

            if (updateHistory) {
                const url = new URL(allPill.href, window.location.origin);

                if (selectedCategories.length === 1) {
                    const selectedPill = pills.find((pill) => pill.dataset.showcaseCategory === selectedCategories[0]);
                    url.pathname = new URL(selectedPill.href).pathname;
                } else if (selectedCategories.length > 1) {
                    url.searchParams.set('categories', selectedCategories.join(','));
                }

                window.history.pushState({ showcaseCategories: selectedCategories }, '', url);
            }
        };

        pills.forEach((pill) => {
            pill.addEventListener('click', (event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

                event.preventDefault();
                const category = pill.dataset.showcaseCategory;
                const selectedCategories = getCategoriesFromLocation();
                const nextCategories = category === 'all'
                    ? []
                    : selectedCategories.includes(category)
                        ? selectedCategories.filter((selectedCategory) => selectedCategory !== category)
                        : [...selectedCategories, category];

                setCategories(nextCategories, { updateHistory: true });
            });
        });

        window.addEventListener('popstate', () => {
            setCategories(getCategoriesFromLocation());
        });

        setCategories(getCategoriesFromLocation());
    };

    shuffleShowcaseItems();
    addHeroLogos();
    setupShowcaseFilters();
})();
