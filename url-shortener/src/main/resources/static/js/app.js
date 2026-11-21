(() => {
    const root = document.documentElement;
    const toastRegion = document.getElementById('toast-region');

    function showToast(message, isError = false) {
        if (!toastRegion) return;

        const toast = document.createElement('div');
        toast.className = `toast${isError ? ' toast-error' : ''}`;
        toast.setAttribute('role', isError ? 'alert' : 'status');
        toast.innerHTML = isError
            ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5m0 3h.01"/></svg>'
            : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
        const text = document.createElement('span');
        text.textContent = message;
        toast.append(text);
        toastRegion.append(toast);

        window.setTimeout(() => {
            toast.classList.add('is-leaving');
            window.setTimeout(() => toast.remove(), 220);
        }, 2600);
    }

    async function copyText(value) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(value);
            return;
        }

        const input = document.createElement('textarea');
        input.value = value;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.append(input);
        input.select();
        const copied = document.execCommand('copy');
        input.remove();
        if (!copied) throw new Error('Clipboard access is unavailable in this browser.');
    }

    window.shortlyToast = showToast;
    window.shortlyCopy = copyText;

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const theme = root.dataset.theme === 'light' ? 'dark' : 'light';
            root.dataset.theme = theme;
            localStorage.setItem('shortly-theme', theme);
            button.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
            window.dispatchEvent(new CustomEvent('shortly:themechange'));
        });
        button.setAttribute('aria-label', `Switch to ${root.dataset.theme === 'light' ? 'dark' : 'light'} theme`);
    });

    document.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-copy-text], .copy-link');
        if (!button) return;

        const rawValue = button.dataset.copyText || button.dataset.shortUrl;
        if (!rawValue) return;
        const value = button.dataset.shortUrl
            ? new URL(rawValue, window.location.origin).href
            : rawValue;
        try {
            await copyText(value);
            showToast('Copied to clipboard.');
        } catch (error) {
            showToast(error.message || 'Could not copy this link.', true);
        }
    });

    const globalSearch = document.getElementById('global-search');
    const tableSearch = document.getElementById('table-search');
    if (globalSearch && tableSearch) {
        globalSearch.addEventListener('input', () => {
            tableSearch.value = globalSearch.value;
            tableSearch.dispatchEvent(new Event('input'));
        });
        tableSearch.addEventListener('input', () => {
            if (globalSearch.value !== tableSearch.value) globalSearch.value = tableSearch.value;
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                event.preventDefault();
                globalSearch.focus();
            }
        });
    }

    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('[data-menu-toggle]');
    if (sidebar && menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isOpen = sidebar.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });
        sidebar.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', () => {
                sidebar.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const form = document.getElementById('shortenForm');
    const submitButton = form && form.querySelector('[data-submit-button]');
    if (form && submitButton) {
        form.addEventListener('submit', () => {
            submitButton.disabled = true;
            const label = submitButton.querySelector('span');
            if (label) label.textContent = 'Creating your link...';
        });
    }

    const sections = document.querySelectorAll('[data-nav]');
    if ('IntersectionObserver' in window && sections.length) {
        const observer = new IntersectionObserver((entries) => {
            const visible = entries.filter((entry) => entry.isIntersecting)
                .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
            if (!visible) return;
            document.querySelectorAll('.nav-link[data-nav]').forEach((link) => {
                link.classList.toggle('is-active', link.dataset.nav === visible.target.id);
            });
        }, { rootMargin: '-15% 0px -70% 0px', threshold: [0, .2, .5] });
        sections.forEach((section) => observer.observe(document.getElementById(section.dataset.nav)));
    }
})();
