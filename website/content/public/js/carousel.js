(() => {
    'use strict';
    
    const shuffle = (items) => {
        let currentIndex = items.length;
        let temp, randomIndex;

        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temp = items[currentIndex];
            items[currentIndex] = items[randomIndex];
            items[randomIndex] = temp;
        }
    }

    const initializeCarousel = () => {
        const carousel = document.getElementById('featuredCarousel');

        if (!carousel)
            return;

		// Get all the carousel items from the document.
        let container = document.getElementById('carousel-item-container');
        if (!container)
            return;

        let items = Array.from(container.getElementsByClassName('carousel-item'));

		// Remove them before we add them back shuffled.
		for(let i = 0; i < items.length; i++)
            container.removeChild(items[i]);

		// Since we made a copy we can shuffle it directly.
        shuffle(items);

		// Add the items back in the new order.
        for(let i = 0; i < items.length; i++)
            container.appendChild(items[i]);

		// Make the first one visible.
		container.children[0].className += ' active';

        let carouselInView = false;

        const isEditableTarget = (target) => {
            return target instanceof HTMLElement && (
                target.isContentEditable ||
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
            );
        };

        const handleKeydown = (event) => {
            if (!carouselInView || isEditableTarget(event.target))
                return;

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                carousel.querySelector('.carousel-control-prev')?.click();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                carousel.querySelector('.carousel-control-next')?.click();
            }
        };

        const observer = new IntersectionObserver((entries) => {
            carouselInView = entries.some((entry) => entry.isIntersecting);
        }, { threshold: 0.1 });

        const initialBounds = carousel.getBoundingClientRect();
        carouselInView = initialBounds.bottom > 0 && initialBounds.top < window.innerHeight;

        observer.observe(carousel);
        window.addEventListener('keydown', handleKeydown);
    }

    initializeCarousel();

})();
