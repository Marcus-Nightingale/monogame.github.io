(() => {
    'use strict';

    const setupBlogFilters = () => {
        const gallery = document.getElementById('blog-gallery');
        const pills = Array.from(document.querySelectorAll('[data-blog-category]'));
        const title = document.getElementById('blog-gallery-title');
        const count = document.getElementById('blog-gallery-count');

        if (!gallery || !pills.length || !title || !count) return;

        const cards = Array.from(gallery.querySelectorAll('[data-blog-tags]'));
        const allPill = pills.find((pill) => pill.dataset.blogCategory === 'all') || pills[0];
        const categoryNames = new Set(pills.map((pill) => pill.dataset.blogCategory));
        const matches = (card, categories) => categories.every((category) => card.dataset.blogTags.split('|').includes(category));
        const categoriesFromLocation = () => {
            const url = new URL(window.location.href);
            const selected = url.searchParams.get('categories');
            if (selected) return selected.split(',').filter((category) => categoryNames.has(category) && category !== 'all');
            const matchingPill = pills.find((pill) => new URL(pill.href).pathname === url.pathname);
            return matchingPill && matchingPill !== allPill ? [matchingPill.dataset.blogCategory] : [];
        };
        const setCategories = (categories, updateHistory = false) => {
            const selected = [...new Set(categories)].filter((category) => categoryNames.has(category) && category !== 'all');
            const visibleCount = cards.reduce((total, card) => {
                const isVisible = matches(card, selected);
                card.hidden = !isVisible;
                return total + (isVisible ? 1 : 0);
            }, 0);

            pills.forEach((pill) => {
                const category = pill.dataset.blogCategory;
                const active = category === 'all' ? selected.length === 0 : selected.includes(category);
                const candidate = category === 'all' || selected.includes(category) ? selected : [...selected, category];
                pill.classList.toggle('active', active);
                pill.setAttribute('aria-pressed', active ? 'true' : 'false');
                pill.toggleAttribute('aria-current', selected.length === 1 && active);
                pill.querySelector('.mg-showcase-filter-count').textContent = cards.filter((card) => matches(card, candidate)).length;
            });

            title.textContent = selected.length ? selected.join(' + ') : 'All posts';
            count.textContent = `${visibleCount} ${visibleCount === 1 ? 'post' : 'posts'}`;
            if (updateHistory) {
                const url = new URL(allPill.href, window.location.origin);
                if (selected.length === 1) url.pathname = new URL(pills.find((pill) => pill.dataset.blogCategory === selected[0]).href).pathname;
                if (selected.length > 1) url.searchParams.set('categories', selected.join(','));
                window.history.pushState({ blogCategories: selected }, '', url);
            }
        };

        pills.forEach((pill) => pill.addEventListener('click', (event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            const category = pill.dataset.blogCategory;
            const selected = categoriesFromLocation();
            setCategories(category === 'all' ? [] : selected.includes(category) ? selected.filter((value) => value !== category) : [...selected, category], true);
        }));

        window.addEventListener('popstate', () => setCategories(categoriesFromLocation()));
        setCategories(categoriesFromLocation());
    };

    setupBlogFilters();
})();
