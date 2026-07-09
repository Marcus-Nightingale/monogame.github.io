(async () => {
    'use strict';

    const animations = new WeakMap();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function countUp(element, end, format, duration = 900) {
        if (!element || !Number.isFinite(end)) {
            return;
        }

        const previous = animations.get(element);
        const start = previous?.value ?? 0;

        if (previous?.frame) {
            cancelAnimationFrame(previous.frame);
        }

        if (reducedMotion || start === end) {
            element.textContent = format(end);
            animations.set(element, { value: end, frame: null });
            return;
        }

        const startedAt = performance.now();
        const state = { value: start, frame: null };
        animations.set(element, state);

        const update = (now) => {
            const progress = Math.min((now - startedAt) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            state.value = start + ((end - start) * eased);
            element.textContent = format(state.value);

            if (progress < 1) {
                state.frame = requestAnimationFrame(update);
            } else {
                state.value = end;
                state.frame = null;
                element.textContent = format(end);
            }
        };

        state.frame = requestAnimationFrame(update);
    }

    const totalPatrons = document.getElementById('total-patrons');
    const perMonth = document.getElementById('per-month');
    const openSourcePercent = document.getElementById('open-source-percent');
    const formatCurrency = (value) => (value / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    });

    // These values are available with the page, so do not wait on Patreon to show them.
    let patronCount = gh_sponsor_count;
    let pledgeSum = gh_sponsor_sum + 100000 + 125000;

    countUp(totalPatrons, patronCount, (value) => Math.round(value).toLocaleString('en-US'));
    countUp(perMonth, pledgeSum, formatCurrency);
    countUp(openSourcePercent, 100, (value) => `${Math.round(value)}%`);

    try {
        const response = await fetch('https://api.patreon.com/platform/users?filter[patreon_url]=https://www.patreon.com/MonoGame');

        if (!response.ok) {
            return;
        }

        const data = await response.json();
        if (data.included?.length > 0) {
            const attributes = data.included[0].attributes;
            patronCount += Number(attributes.paid_member_count) || 0;
            pledgeSum += Number(attributes.pledge_sum) || 0;

            countUp(totalPatrons, patronCount, (value) => Math.round(value).toLocaleString('en-US'), 650);
            countUp(perMonth, pledgeSum, formatCurrency, 650);
        }
    } catch {
        // The known sponsorship totals remain visible if Patreon is unavailable.
    }
})();
