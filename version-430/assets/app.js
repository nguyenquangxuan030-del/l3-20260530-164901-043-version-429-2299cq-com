(function () {
  var body = document.body;

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = qs('[data-menu-button]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
      button.textContent = menu.classList.contains('open') ? '×' : '☰';
    });
  }

  function initSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input) {
          return;
        }
        event.preventDefault();
        var query = input.value.trim();
        var target = form.getAttribute('action') || './search.html';
        window.location.href = target + (query ? '?q=' + encodeURIComponent(query) : '');
      });
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('active', idx === index);
      });
      dots.forEach(function (dot) {
        dot.classList.toggle('active', Number(dot.getAttribute('data-hero-dot')) === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initLocalFilter() {
    qsa('[data-local-filter]').forEach(function (panel) {
      var input = qs('[data-local-filter-input]', panel);
      var reset = qs('[data-local-filter-reset]', panel);
      var items = qsa('[data-title]', panel);
      var chips = qsa('[data-filter-chip]', panel);

      function apply(value) {
        var keyword = normalize(value);
        items.forEach(function (item) {
          var text = normalize([
            item.getAttribute('data-title'),
            item.getAttribute('data-tags'),
            item.getAttribute('data-year'),
            item.getAttribute('data-region'),
            item.getAttribute('data-genre')
          ].join(' '));
          item.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
        });
      }

      if (input) {
        input.addEventListener('input', function () {
          apply(input.value);
        });
      }

      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          apply('');
        });
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          var value = chip.getAttribute('data-filter-chip') || chip.textContent;
          if (input) {
            input.value = value;
          }
          apply(value);
        });
      });
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="play-mark">▶</span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</div>',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.one_line) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initSearchPage() {
    if (body.getAttribute('data-page') !== 'search' || !window.MOVIES) {
      return;
    }
    var input = qs('[data-search-page-input]');
    var form = qs('[data-search-page-form]');
    var results = qs('[data-search-results]');
    var status = qs('[data-search-status]');
    var chips = qsa('[data-search-chip]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    function render(query) {
      var keyword = normalize(query);
      var matched = window.MOVIES.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.one_line
        ].join(' '));
        return !keyword || text.indexOf(keyword) !== -1;
      }).slice(0, 96);
      results.innerHTML = matched.map(movieCard).join('');
      status.textContent = keyword ? '已显示相关影片，点击卡片进入详情。' : '推荐浏览以下影片，也可以输入关键词检索。';
    }

    if (input) {
      input.value = initial;
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render(input ? input.value : '');
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-search-chip') || chip.textContent;
        if (input) {
          input.value = value;
        }
        render(value);
      });
    });

    render(initial);
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('[data-play-button]', player);
      var source = player.getAttribute('data-video-source');
      var started = false;
      var hlsInstance = null;

      function startPlayer() {
        if (!video || !source) {
          return;
        }
        player.classList.add('is-playing');
        video.controls = true;
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
              video.src = source;
              video.play().catch(function () {});
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          startPlayer();
        });
      }

      player.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        startPlayer();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSearchForms();
    initHero();
    initLocalFilter();
    initSearchPage();
    initPlayers();
  });
})();
