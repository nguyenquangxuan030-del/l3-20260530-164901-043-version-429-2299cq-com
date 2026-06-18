(function () {
  const sources = [
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/77ae15566dde5cfb920bae4712a38399/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/41cb67b47a3668efaea014219666e659/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/31227358d3c181b7168e28ad248cfb4e/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/d0af4221b8947fda8c23f4955947cb58/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e70b98acb53eb889d108057988609efb/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/86ea18f9954dbaf22eff5e16c41b4a25/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/2df81e778442675885257ce3e84c7173/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/af3d3f3b4940cee04efcd8ff2c9eef0a/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/60b4ddb3d166e1239abfc7adf611a6a3/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/a27121d514ff0079e1e81a6678f14e0c/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/f0d38b8679a1231eff816a8e04cc1a0c/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c66b5309b3b64d15ed856810d6cc0b72/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c99d86ece73a935b77e57d322461ddb5/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fe0c41d994d01211debb24e84e3384a9/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/929fdb8e536c1fc43a83b32d1a838547/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fbc04ae173a0e633458658e80ee78c2a/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/0ba4f146b0e6ea192526706f495d460f/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1e53f0e1aef7ec2fb5f30ef5d309d69c/manifest/video.m3u8',
    'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1116997bf50b78f22bbfaced8975a021/manifest/video.m3u8'
  ];

  document.querySelectorAll('.js-video-player').forEach(function (player) {
    const video = player.querySelector('video');
    const cover = player.querySelector('.player-cover');
    const playButton = player.querySelector('.player-play');
    const sourceIndex = Number(video ? video.dataset.streamIndex : 0) || 0;
    const source = sources[((sourceIndex % sources.length) + sources.length) % sources.length];
    let ready = false;
    let hls = null;

    if (!video || !cover || !source) {
      return;
    }

    function attachSource() {
      if (ready) {
        return Promise.resolve();
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      return new Promise(function (resolve) {
        if (video.readyState > 0) {
          resolve();
          return;
        }
        video.addEventListener('loadedmetadata', resolve, { once: true });
        window.setTimeout(resolve, 700);
      });
    }

    function startPlayback() {
      cover.classList.add('is-hidden');
      attachSource().then(function () {
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            cover.classList.remove('is-hidden');
          });
        }
      });
    }

    cover.addEventListener('click', startPlayback);

    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayback();
      });
    }

    video.addEventListener('play', function () {
      cover.classList.add('is-hidden');
    });

    video.addEventListener('click', function () {
      if (!ready) {
        startPlayback();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
