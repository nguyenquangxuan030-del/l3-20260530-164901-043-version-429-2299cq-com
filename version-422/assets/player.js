import { H as Hls } from './vendor/hls.js';

function setupVideoPlayer(player) {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-player-button]');
  const overlay = player.querySelector('[data-player-overlay]');
  const status = player.querySelector('[data-player-status]');
  const sourceUrl = video ? video.getAttribute('data-video-url') : '';
  let hls = null;
  let initialized = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  async function startPlayback() {
    if (!video || !sourceUrl) {
      setStatus('当前页面未找到可用播放源。');
      return;
    }

    hideOverlay();

    if (!initialized) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        setStatus('正在使用浏览器原生 HLS 播放。');
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          setStatus('HLS 播放源加载完成。');
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载遇到错误，可刷新页面后重试。');
            if (hls) {
              hls.destroy();
              hls = null;
            }
            initialized = false;
          }
        });
      } else {
        setStatus('当前浏览器不支持 HLS 播放。');
        return;
      }
      initialized = true;
    }

    try {
      await video.play();
      setStatus('正在播放。');
    } catch (error) {
      setStatus('请再次点击播放器开始播放。');
    }
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }
  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }
  if (video) {
    video.addEventListener('play', hideOverlay);
  }
}

document.querySelectorAll('[data-video-player]').forEach(setupVideoPlayer);
