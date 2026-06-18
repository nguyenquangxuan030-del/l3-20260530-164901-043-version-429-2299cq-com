(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var menuToggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuToggle && mobileNav) {
            menuToggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
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
        });

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var targetId = panel.getAttribute("data-filter-target");
            var scope = targetId ? document.getElementById(targetId) : null;
            if (!scope) {
                return;
            }
            var input = panel.querySelector("[data-filter-input]");
            var category = panel.querySelector("[data-filter-category]");
            var year = panel.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var empty = scope.parentElement ? scope.parentElement.querySelector("[data-empty-state]") : null;
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q");

            if (initialQuery && input) {
                input.value = initialQuery;
            }

            function matchesYear(cardYear, selectedYear) {
                if (!selectedYear) {
                    return true;
                }
                if (selectedYear === "2010") {
                    return Number(cardYear) >= 2010 && Number(cardYear) <= 2019;
                }
                if (selectedYear === "2000") {
                    return Number(cardYear) >= 2000 && Number(cardYear) <= 2009;
                }
                return cardYear === selectedYear;
            }

            function applyFilter() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var selectedCategory = category ? category.value : "";
                var selectedYear = year ? year.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-genre") || "",
                        card.getAttribute("data-year") || ""
                    ].join(" ").toLowerCase();
                    var cardCategory = card.getAttribute("data-category") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var ok = (!query || haystack.indexOf(query) !== -1) &&
                        (!selectedCategory || cardCategory === selectedCategory) &&
                        matchesYear(cardYear, selectedYear);
                    card.classList.toggle("hidden", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            [input, category, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });

            applyFilter();
        });

        document.querySelectorAll(".movie-player").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".player-cover");
            var source = player.getAttribute("data-source");
            var hls = null;

            function attachSource() {
                if (!video || !source || video.getAttribute("data-ready") === "1") {
                    return;
                }
                video.setAttribute("data-ready", "1");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    return;
                }
                video.src = source;
            }

            function playVideo() {
                attachSource();
                player.classList.add("is-playing");
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        player.classList.remove("is-playing");
                    });
                }
            }

            if (button && video) {
                button.addEventListener("click", playVideo);
            }

            if (video) {
                video.addEventListener("play", function () {
                    player.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    if (video.currentTime === 0) {
                        player.classList.remove("is-playing");
                    }
                });
                video.addEventListener("click", function () {
                    if (video.paused) {
                        playVideo();
                    }
                });
            }

            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    });
})();
