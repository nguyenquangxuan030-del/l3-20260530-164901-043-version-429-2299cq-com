(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
    });
  });

  function setupHero() {
    const carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const thumbs = Array.from(carousel.querySelectorAll('[data-hero-thumb]'));
    let current = 0;

    function activate(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === index);
      });
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        const index = Number(thumb.getAttribute('data-hero-thumb'));
        activate(index);
      });
    });

    window.setInterval(function () {
      if (slides.length > 1) {
        activate((current + 1) % slides.length);
      }
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilter(scope) {
    const input = scope.querySelector('[data-card-filter]');
    const sort = scope.querySelector('[data-card-sort]');
    const count = scope.querySelector('[data-filter-count]');
    const section = scope.closest('section') || document;
    const grid = section.querySelector('[data-card-grid]');

    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll('[data-movie-card]'));

    function updateCount(visible) {
      if (count) {
        count.textContent = '显示 ' + visible + ' / ' + cards.length;
      }
    }

    function applyFilter() {
      const query = normalize(input ? input.value : '');
      let visible = 0;

      cards.forEach(function (card) {
        const text = normalize(card.getAttribute('data-search'));
        const matched = !query || text.indexOf(query) !== -1;
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      updateCount(visible);
    }

    function applySort() {
      if (!sort) {
        return;
      }

      const value = sort.value;
      const sorted = cards.slice().sort(function (a, b) {
        if (value === 'rating-desc') {
          return Number(b.dataset.rating) - Number(a.dataset.rating);
        }
        if (value === 'views-desc') {
          return Number(b.dataset.views) - Number(a.dataset.views);
        }
        if (value === 'title-asc') {
          return normalize(a.dataset.search).localeCompare(normalize(b.dataset.search), 'zh-Hans-CN');
        }
        return Number(b.dataset.year) - Number(a.dataset.year);
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      applyFilter();
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (sort) {
      sort.addEventListener('change', applySort);
    }

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q && input) {
      input.value = q;
    }

    applySort();
    applyFilter();
  }

  setupHero();
  document.querySelectorAll('[data-filter-scope]').forEach(setupFilter);
})();
