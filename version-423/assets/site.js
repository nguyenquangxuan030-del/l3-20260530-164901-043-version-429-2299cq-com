(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function initMobileMenu() {
        var toggle = document.querySelector(".mobile-menu-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var isOpen = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!isOpen));
            menu.hidden = isOpen;
            toggle.textContent = isOpen ? "☰" : "×";
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initCardFilters() {
        document.querySelectorAll("[data-card-filter]").forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var count = panel.querySelector("[data-filter-count]");
            var list = document.querySelector("[data-filter-list]");
            if (!input || !list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

            function applyFilter() {
                var keyword = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-category"),
                        card.getAttribute("data-genre")
                    ].join(" ").toLowerCase();
                    var matched = !keyword || haystack.indexOf(keyword) !== -1;
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = visible + " 部影片";
                }
            }

            input.addEventListener("input", applyFilter);
            applyFilter();
        });
    }

    function initPlayers() {
        document.querySelectorAll(".player-card").forEach(function (playerCard) {
            var video = playerCard.querySelector("video");
            var playButton = playerCard.querySelector(".player-cover-button");
            var source = playerCard.getAttribute("data-video-url");
            if (!video || !source) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                video.src = source;
            }

            function playVideo() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.then === "function") {
                    playPromise.catch(function () {
                        video.controls = true;
                    });
                }
            }

            if (playButton) {
                playButton.addEventListener("click", playVideo);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("play", function () {
                playerCard.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                playerCard.classList.remove("is-playing");
            });
        });
    }

    function getSearchParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function movieCardHTML(movie) {
        return [
            '<article class="movie-card" data-title="' + escapeHTML(movie.title) + '">',
            '    <a class="movie-poster" href="' + escapeHTML(movie.url) + '" aria-label="观看 ' + escapeHTML(movie.title) + '">',
            '        <img src="' + escapeHTML(movie.image) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy" onerror="this.style.opacity=\'0\';">',
            '        <span class="movie-badge">' + escapeHTML(movie.type) + '</span>',
            '        <span class="movie-score">★ ' + movie.rating.toFixed(1) + '</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <a href="' + escapeHTML(movie.url) + '" class="movie-card-title">' + escapeHTML(movie.title) + '</a>',
            '        <p class="movie-card-desc">' + escapeHTML(movie.oneLine) + '</p>',
            '        <div class="movie-meta-row">',
            '            <span>' + escapeHTML(movie.region) + '</span>',
            '            <span>' + escapeHTML(movie.year) + '</span>',
            '            <span>' + escapeHTML(movie.category) + '</span>',
            '        </div>',
            '        <div class="movie-tags">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHTML(tag) + '</span>'; }).join('') + '</div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function escapeHTML(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initSearchPage() {
        var app = document.querySelector("[data-search-app]");
        if (!app || !window.SEARCH_INDEX) {
            return;
        }
        var queryInput = app.querySelector("[data-search-query]");
        var categorySelect = app.querySelector("[data-search-category]");
        var yearSelect = app.querySelector("[data-search-year]");
        var regionSelect = app.querySelector("[data-search-region]");
        var results = app.querySelector("[data-search-results]");
        var summary = app.querySelector("[data-search-summary]");

        queryInput.value = getSearchParam("q");

        function applySearch() {
            var query = queryInput.value.trim().toLowerCase();
            var category = categorySelect.value;
            var year = yearSelect.value;
            var region = regionSelect.value;
            var matched = window.SEARCH_INDEX.filter(function (movie) {
                var haystack = [movie.title, movie.oneLine, movie.region, movie.year, movie.genre, movie.category].concat(movie.tags).join(" ").toLowerCase();
                return (!query || haystack.indexOf(query) !== -1) &&
                    (!category || movie.category === category) &&
                    (!year || movie.year === year) &&
                    (!region || movie.region === region);
            }).slice(0, 120);

            results.innerHTML = matched.map(movieCardHTML).join("");
            summary.textContent = "找到 " + matched.length + " 部影片" + (matched.length >= 120 ? "（已显示前 120 部）" : "");
        }

        [queryInput, categorySelect, yearSelect, regionSelect].forEach(function (control) {
            control.addEventListener("input", applySearch);
            control.addEventListener("change", applySearch);
        });
        applySearch();
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initCardFilters();
        initPlayers();
        initSearchPage();
    });
})();
