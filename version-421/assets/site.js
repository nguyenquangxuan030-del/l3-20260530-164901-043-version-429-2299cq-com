(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    initHero();
    initFilters();
  });

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
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

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));

    inputs.forEach(function (input) {
      var root = input.closest("main") || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-filter-card]"));
      var empty = root.querySelector("[data-empty-state]");
      var clear = root.querySelector("[data-filter-clear]");
      var chips = Array.prototype.slice.call(root.querySelectorAll("[data-filter-category]"));
      var selectedCategory = "all";
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";

      if (query) {
        input.value = query;
      }

      function apply() {
        var value = input.value.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
          var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-tags") || "")).toLowerCase();
          var category = card.getAttribute("data-category") || "";
          var matchedText = !value || text.indexOf(value) !== -1;
          var matchedCategory = selectedCategory === "all" || category === selectedCategory;
          var matched = matchedText && matchedCategory;
          card.style.display = matched ? "" : "none";

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      input.addEventListener("input", apply);

      if (clear) {
        clear.addEventListener("click", function () {
          input.value = "";
          selectedCategory = "all";
          chips.forEach(function (chip) {
            chip.classList.toggle("is-active", chip.getAttribute("data-filter-category") === "all");
          });
          apply();
        });
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          selectedCategory = chip.getAttribute("data-filter-category") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          apply();
        });
      });

      apply();
    });
  }

  window.initMoviePlayer = function (videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hls = null;

    if (!video || !overlay || !source) {
      return;
    }

    function prepare() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 60,
          backBufferLength: 30
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      video.setAttribute("data-ready", "1");
    }

    function play() {
      prepare();
      overlay.classList.add("is-hidden");
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };
}());
