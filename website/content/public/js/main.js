function seedRandom(seed) {
    let m = 0x80000000,
        a = 1103515245,
        c = 12345;
    seed = seed & (m - 1);
    return function () {
        seed = (a * seed + c) % m;
        return seed / (m - 1);
    };
}

function getHourSeed() {
    const d = new Date();
    return d.getFullYear() + d.getMonth() + d.getDate() + d.getHours();
}

function shuffle(items) {
    const seed = getHourSeed();
    const random = seedRandom(seed);
    let currentIndex = items.length;
    let temp, randomIndex;

    while(currentIndex != 0) {
        randomIndex = Math.floor(random() * currentIndex);
        currentIndex -= 1;

        temp = items[currentIndex];
        items[currentIndex] = items[randomIndex];
        items[randomIndex] = temp;
    }
}

function maybeSwapHeroTitle() {
    const heroTitle = document.querySelector('.mg-home-hero-title');

    if (!heroTitle) {
        return;
    }

    if (Math.random() < 0.0001) {
        heroTitle.innerHTML = 'Write Once,<br/>Play Everywhere.';
    }
}

function setupBlogTocHighlighter() {
    const toc = document.querySelector('.blog-toc');
    const article = document.querySelector('.blog-post');

    if (!toc || !article) {
        return;
    }

    const links = Array.from(toc.querySelectorAll('a[href^="#"]'));
    const headings = Array.from(article.querySelectorAll('h2[id], h3[id], h4[id]'));

    if (!links.length || !headings.length || !('IntersectionObserver' in window)) {
        return;
    }

    const linkById = new Map(
        links.map((link) => [link.getAttribute('href').slice(1), link])
    );

    function setActive(id) {
        links.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('is-active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    const observer = new IntersectionObserver((entries) => {
        const visibleEntries = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length > 0) {
            const topEntry = visibleEntries[0];
            const link = linkById.get(topEntry.target.id);

            if (link) {
                setActive(topEntry.target.id);
            }
        }
    }, {
        rootMargin: '-20% 0px -65% 0px',
        threshold: [0.1, 0.2, 0.3, 0.4, 0.5]
    });

    headings.forEach((heading, index) => {
        observer.observe(heading);
        if (index === 0) {
            setActive(heading.id);
        }
    });
}

window.addEventListener('DOMContentLoaded', maybeSwapHeroTitle);
window.addEventListener('DOMContentLoaded', setupBlogTocHighlighter);
