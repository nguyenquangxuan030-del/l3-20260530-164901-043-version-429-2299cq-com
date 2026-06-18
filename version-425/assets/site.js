(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  var lists = Array.prototype.slice.call(document.querySelectorAll('[data-card-list]'));

  lists.forEach(function (list) {
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var limit = Number(list.getAttribute('data-limit')) || cards.length;
    var shown = limit;
    var section = list.closest('section') || document;
    var search = section.querySelector('[data-movie-search]') || document.querySelector('[data-movie-search]');
    var category = section.querySelector('[data-filter-category]');
    var region = section.querySelector('[data-filter-region]');
    var more = section.querySelector('[data-load-more]');

    function matches(card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' ').toLowerCase();
      var query = search ? search.value.trim().toLowerCase() : '';
      var categoryValue = category ? category.value : '';
      var regionValue = region ? region.value : '';

      if (query && text.indexOf(query) === -1) {
        return false;
      }

      if (categoryValue && card.getAttribute('data-category') !== categoryValue) {
        return false;
      }

      if (regionValue && card.getAttribute('data-region') !== regionValue) {
        return false;
      }

      return true;
    }

    function render() {
      var visibleIndex = 0;
      var filtered = cards.filter(matches);

      cards.forEach(function (card) {
        var isMatch = matches(card);
        var shouldShow = isMatch && visibleIndex < shown;

        if (isMatch) {
          visibleIndex += 1;
        }

        card.classList.toggle('is-hidden', !shouldShow);
      });

      if (more) {
        more.style.display = shown < filtered.length ? 'inline-flex' : 'none';
      }
    }

    [search, category, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', function () {
          shown = limit;
          render();
        });

        control.addEventListener('change', function () {
          shown = limit;
          render();
        });
      }
    });

    if (more) {
      more.addEventListener('click', function () {
        shown += limit;
        render();
      });
    }

    render();
  });

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var trigger = player.querySelector('[data-play]');
    var stream = video ? video.getAttribute('data-stream') : '';
    var prepared = false;

    function prepareVideo() {
      if (!video || !stream || prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        return;
      }

      video.src = stream;
    }

    function playVideo() {
      prepareVideo();
      player.classList.add('is-playing');

      if (video) {
        var result = video.play();

        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }
    }

    if (trigger) {
      trigger.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
    }
  }
})();
