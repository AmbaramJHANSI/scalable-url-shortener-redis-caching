(() => {
    const tableBody = document.getElementById('links-table-body');
    const searchInput = document.getElementById('table-search');
    const statusFilter = document.getElementById('status-filter');
    const rows = tableBody ? Array.from(tableBody.querySelectorAll('tr')) : [];
    const pageSize = 8;
    let currentPage = 1;
    let sortField = '';
    let sortDirection = 1;

    function renderTable() {
        if (!tableBody) return;

        const query = searchInput.value.trim().toLowerCase();
        const status = statusFilter.value;
        const filtered = rows.filter((row) => {
            const matchesQuery = !query ||
                row.dataset.code.toLowerCase().includes(query) ||
                row.dataset.destination.toLowerCase().includes(query);
            return matchesQuery && (status === 'all' || row.dataset.status === status);
        });

        if (sortField) {
            filtered.sort((left, right) => {
                const leftValue = left.dataset[sortField] || '';
                const rightValue = right.dataset[sortField] || '';
                const comparison = sortField === 'clicks'
                    ? Number(leftValue) - Number(rightValue)
                    : leftValue.localeCompare(rightValue, undefined, { numeric: true, sensitivity: 'base' });
                return comparison * sortDirection;
            });
        }

        const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
        currentPage = Math.min(currentPage, pageCount);
        const start = (currentPage - 1) * pageSize;
        const visibleRows = new Set(filtered.slice(start, start + pageSize));
        rows.forEach((row) => {
            row.hidden = !visibleRows.has(row);
        });

        const emptyState = document.getElementById('empty-state');
        const paginationSummary = document.getElementById('pagination-summary');
        const pageIndicator = document.getElementById('page-indicator');
        const previousButton = document.getElementById('previous-page');
        const nextButton = document.getElementById('next-page');
        emptyState.hidden = filtered.length !== 0;
        paginationSummary.textContent = filtered.length
            ? `Showing ${start + 1}–${Math.min(start + pageSize, filtered.length)} of ${filtered.length} links`
            : 'Showing 0 links';
        pageIndicator.textContent = `${currentPage} / ${pageCount}`;
        previousButton.disabled = currentPage <= 1;
        nextButton.disabled = currentPage >= pageCount;
    }

    if (tableBody) {
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            renderTable();
        });
        statusFilter.addEventListener('change', () => {
            currentPage = 1;
            renderTable();
        });
        document.querySelectorAll('[data-sort]').forEach((button) => {
            button.addEventListener('click', () => {
                const field = button.dataset.sort;
                sortDirection = sortField === field ? -sortDirection : 1;
                sortField = field;
                currentPage = 1;
                document.querySelectorAll('.sort-indicator').forEach((indicator) => {
                    indicator.textContent = '↕';
                });
                button.querySelector('.sort-indicator').textContent = sortDirection === 1 ? '↑' : '↓';
                renderTable();
            });
        });
        document.getElementById('previous-page').addEventListener('click', () => {
            currentPage = Math.max(1, currentPage - 1);
            renderTable();
        });
        document.getElementById('next-page').addEventListener('click', () => {
            currentPage += 1;
            renderTable();
        });
        renderTable();
    }

    const popularCanvas = document.getElementById('popularChart');
    const statusCanvas = document.getElementById('statusChart');
    const charts = [];

    function cssVariable(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    function renderCharts() {
        if (typeof Chart === 'undefined') {
            window.shortlyToast('Charts could not load. Check your connection and refresh.', true);
            return;
        }

        const chartText = cssVariable('--text-secondary');
        const chartMuted = cssVariable('--muted');
        const chartBorder = cssVariable('--border');
        const accent = cssVariable('--accent');
        const blue = cssVariable('--blue');
        const labels = Array.from(document.querySelectorAll('#popular-chart-data [data-label]'));

        if (popularCanvas) {
            charts.push(new Chart(popularCanvas, {
                type: 'bar',
                data: {
                    labels: labels.map((item) => item.dataset.label),
                    datasets: [{
                        label: 'Clicks',
                        data: labels.map((item) => Number(item.dataset.clicks)),
                        backgroundColor: labels.map((_, index) => index === 0 ? accent : `${blue}b8`),
                        borderRadius: 5,
                        borderSkipped: false,
                        maxBarThickness: 26
                    }]
                },
                options: {
                    indexAxis: 'y',
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            displayColors: false,
                            backgroundColor: cssVariable('--surface-raised'),
                            titleColor: cssVariable('--text'),
                            bodyColor: chartText,
                            borderColor: chartBorder,
                            borderWidth: 1,
                            callbacks: { label: (context) => `${context.parsed.x.toLocaleString()} clicks` }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: { color: chartMuted, precision: 0, font: { size: 9 } },
                            grid: { color: chartBorder, drawTicks: false },
                            border: { display: false }
                        },
                        y: {
                            ticks: { color: chartText, font: { size: 10 } },
                            grid: { display: false },
                            border: { display: false }
                        }
                    }
                }
            }));
        }

        if (statusCanvas) {
            charts.push(new Chart(statusCanvas, {
                type: 'doughnut',
                data: {
                    labels: ['Active', 'Expired'],
                    datasets: [{
                        data: [Number(statusCanvas.dataset.active), Number(statusCanvas.dataset.expired)],
                        backgroundColor: [accent, chartBorder],
                        borderColor: cssVariable('--surface'),
                        borderWidth: 4,
                        hoverOffset: 5
                    }]
                },
                options: {
                    cutout: '74%',
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: cssVariable('--surface-raised'),
                            titleColor: cssVariable('--text'),
                            bodyColor: chartText,
                            borderColor: chartBorder,
                            borderWidth: 1,
                            callbacks: {
                                label: (context) => ` ${context.label}: ${context.parsed.toLocaleString()}`
                            }
                        }
                    }
                }
            }));
        }
    }

    if (popularCanvas || statusCanvas) {
        if (typeof Chart !== 'undefined') {
            renderCharts();
        } else {
            window.addEventListener('load', renderCharts, { once: true });
        }
    }
    window.addEventListener('shortly:themechange', () => {
        if (typeof Chart === 'undefined') return;
        charts.forEach((chart) => chart.destroy());
        charts.length = 0;
        renderCharts();
    });

    const qrSelect = document.getElementById('qr-url-select');
    const qrButton = document.getElementById('generate-qr-button');
    const qrPreview = document.getElementById('qr-preview');
    const qrResult = document.getElementById('qr-result');
    const qrPlaceholder = document.getElementById('qr-placeholder');
    const qrUrl = document.getElementById('qr-short-url');
    const qrDownload = document.getElementById('download-qr');
    const qrError = document.getElementById('qr-error');
    let qrObjectUrl = '';

    async function generateQr(shortCode) {
        if (!shortCode) {
            qrError.textContent = 'Select a short link first.';
            qrError.hidden = false;
            return;
        }

        qrError.hidden = true;
        qrButton.disabled = true;
        qrButton.querySelector('svg').hidden = true;
        qrButton.lastChild.textContent = ' Generating...';

        try {
            const response = await fetch(`/dashboard/qr/${encodeURIComponent(shortCode)}`, {
                headers: { Accept: 'image/png' }
            });
            if (!response.ok) throw new Error('The QR code could not be generated for this link.');

            const image = await response.blob();
            if (qrObjectUrl) URL.revokeObjectURL(qrObjectUrl);
            qrObjectUrl = URL.createObjectURL(image);
            const shortUrl = new URL(`/${encodeURIComponent(shortCode)}`, window.location.origin).href;
            qrPreview.src = qrObjectUrl;
            qrUrl.href = shortUrl;
            qrUrl.textContent = shortUrl;
            qrDownload.href = qrObjectUrl;
            qrDownload.download = `shortly-${shortCode}-qr.png`;
            qrPlaceholder.hidden = true;
            qrResult.hidden = false;
        } catch (error) {
            qrError.textContent = error.message || 'The QR code could not be generated. Try again.';
            qrError.hidden = false;
        } finally {
            qrButton.disabled = false;
            qrButton.querySelector('svg').hidden = false;
            qrButton.lastChild.textContent = ' Generate QR code';
        }
    }

    if (qrSelect && qrButton) {
        qrButton.addEventListener('click', () => generateQr(qrSelect.value));
        document.querySelectorAll('.open-qr').forEach((button) => {
            button.addEventListener('click', () => {
                qrSelect.value = button.dataset.shortCode;
                document.getElementById('qr-codes').scrollIntoView({ behavior: 'smooth' });
                generateQr(qrSelect.value);
            });
        });
        document.getElementById('copy-qr-url').addEventListener('click', async () => {
            try {
                await window.shortlyCopy(qrUrl.href);
                window.shortlyToast('Copied to clipboard.');
            } catch (error) {
                window.shortlyToast(error.message || 'Could not copy this link.', true);
            }
        });
    }
})();
