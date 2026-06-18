(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.classList.toggle('is-open', !expanded);
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    }));
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
        restart();
      });
    });

    show(index);
    restart();
  });

  document.querySelectorAll('[data-filter-form]').forEach(function (form) {
    const scopeSelector = form.getAttribute('data-scope') || '#movieGrid';
    const scope = document.querySelector(scopeSelector);
    const emptyState = document.querySelector('[data-empty-state]');

    if (!scope) {
      return;
    }

    const cards = Array.from(scope.querySelectorAll('.movie-card'));
    const params = new URLSearchParams(window.location.search);
    const initialKeyword = params.get('q');

    if (initialKeyword && form.elements.keyword) {
      form.elements.keyword.value = initialKeyword;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function yearMatches(cardYear, selectedYear) {
      const year = Number(cardYear);

      if (!selectedYear || selectedYear === '全部年份') {
        return true;
      }
      if (selectedYear === '更早') {
        return year && year < 2000;
      }
      if (selectedYear.includes('-')) {
        const parts = selectedYear.split('-').map(Number);
        return year >= parts[0] && year <= parts[1];
      }
      return String(cardYear) === selectedYear;
    }

    function applyFilter() {
      const keyword = normalize(form.elements.keyword ? form.elements.keyword.value : '');
      const category = form.elements.category ? form.elements.category.value : '全部分类';
      const year = form.elements.year ? form.elements.year.value : '全部年份';
      let visible = 0;

      cards.forEach(function (card) {
        const content = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.category,
          card.dataset.tags,
          card.textContent
        ].join(' '));
        const categoryOk = category === '全部分类' || card.dataset.category === category;
        const yearOk = yearMatches(card.dataset.year, year);
        const keywordOk = !keyword || content.includes(keyword);
        const isVisible = categoryOk && yearOk && keywordOk;

        card.style.display = isVisible ? '' : 'none';
        if (isVisible) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    form.addEventListener('input', applyFilter);
    form.addEventListener('change', applyFilter);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
    applyFilter();
  });
})();
