(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initFilters() {
    selectAll('[data-filter-panel]').forEach(function (panel) {
      var scope = panel.getAttribute('data-filter-panel');
      var cards = selectAll('[data-filter-scope="' + scope + '"] [data-movie-card]');
      var keyword = panel.querySelector('[data-filter-keyword]');
      var year = panel.querySelector('[data-filter-year]');
      var type = panel.querySelector('[data-filter-type]');
      var reset = panel.querySelector('[data-filter-reset]');
      var empty = document.querySelector('[data-empty-state="' + scope + '"]');

      function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
      }

      function apply() {
        var kw = normalize(keyword && keyword.value);
        var selectedYear = normalize(year && year.value);
        var selectedType = normalize(type && type.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre')
          ].join(' '));
          var yearOk = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
          var typeOk = !selectedType || normalize(card.getAttribute('data-type')) === selectedType;
          var kwOk = !kw || haystack.indexOf(kw) !== -1;
          var show = yearOk && typeOk && kwOk;
          card.style.display = show ? '' : 'none';
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? 'none' : '';
        }
      }

      [keyword, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      if (reset) {
        reset.addEventListener('click', function () {
          if (keyword) {
            keyword.value = '';
          }
          if (year) {
            year.value = '';
          }
          if (type) {
            type.value = '';
          }
          apply();
        });
      }
      apply();
    });
  }

  function initSearchPage() {
    var box = document.querySelector('[data-search-box]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    if (!box || !input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      input.value = initial;
    }

    function normalize(value) {
      return (value || '').toString().toLowerCase().trim();
    }

    function render(items) {
      results.innerHTML = items.map(function (movie) {
        return [
          '<article class="search-result-card">',
          '<div class="movie-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.type + '</span></div>',
          '<h3><a href="./' + movie.file + '">' + movie.title + '</a></h3>',
          '<p>' + movie.oneLine + '</p>',
          '<a class="primary-button" href="./' + movie.file + '">进入详情</a>',
          '</article>'
        ].join('');
      }).join('');
    }

    function search() {
      var kw = normalize(input.value);
      var source = window.MOVIE_SEARCH_DATA;
      var matches = kw ? source.filter(function (movie) {
        return normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.oneLine
        ].join(' ')).indexOf(kw) !== -1;
      }) : source.slice(0, 36);
      render(matches.slice(0, 120));
    }

    box.addEventListener('submit', function (event) {
      event.preventDefault();
      search();
    });
    input.addEventListener('input', search);
    search();
  }

  window.initMoviePlayer = function (sourceUrl) {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var button = document.querySelector('[data-play-button]');
    if (!video || !sourceUrl) {
      return;
    }
    var loaded = false;
    function start() {
      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
        loaded = true;
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener('click', start);
    }
    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!loaded) {
        start();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
