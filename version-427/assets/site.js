(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = $('[data-menu-toggle]');
        var nav = $('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = $('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = $all('[data-hero-slide]', hero);
        var previous = $('[data-hero-prev]', hero);
        var next = $('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            slides[index].classList.remove('active');
            index = (nextIndex + slides.length) % slides.length;
            slides[index].classList.add('active');
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function setupFilters() {
        $all('[data-filter-panel]').forEach(function (panel) {
            var scope = panel.closest('[data-filter-scope]') || document;
            var cards = $all('[data-card]', scope);
            var searchInput = $('[data-search-input]', panel);
            var yearSelect = $('[data-filter-year]', panel);
            var regionSelect = $('[data-filter-region]', panel);
            var typeSelect = $('[data-filter-type]', panel);
            var emptyState = $('[data-empty-state]', scope);

            function includesText(card, keyword) {
                if (!keyword) {
                    return true;
                }
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();
                return text.indexOf(keyword) !== -1;
            }

            function update() {
                var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
                var year = yearSelect ? yearSelect.value : '';
                var region = regionSelect ? regionSelect.value : '';
                var type = typeSelect ? typeSelect.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var match = includesText(card, keyword);
                    if (year && card.getAttribute('data-year') !== year) {
                        match = false;
                    }
                    if (region && card.getAttribute('data-region') !== region) {
                        match = false;
                    }
                    if (type && card.getAttribute('data-type') !== type) {
                        match = false;
                    }
                    card.hidden = !match;
                    if (match) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.classList.toggle('show', visible === 0);
                }
            }

            ['input', 'change'].forEach(function (eventName) {
                [searchInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
                    if (control) {
                        control.addEventListener(eventName, update);
                    }
                });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());
