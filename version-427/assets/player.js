import { H as Hls } from './hls-dru42stk.js';

function preparePlayer(wrapper) {
    var video = wrapper.querySelector('video');
    var button = wrapper.querySelector('[data-play-button]');
    var source = wrapper.getAttribute('data-video-url');
    var hls = null;
    var started = false;

    if (!video || !button || !source) {
        return;
    }

    function attachSource() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return Promise.resolve();
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 60
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return new Promise(function (resolve) {
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
            });
        }

        video.src = source;
        return Promise.resolve();
    }

    function play() {
        button.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');

        var ready = started ? Promise.resolve() : attachSource();
        started = true;

        ready.then(function () {
            return video.play();
        }).catch(function () {
            button.classList.remove('is-hidden');
            button.querySelector('span').textContent = '再次点击播放';
        });
    }

    button.addEventListener('click', play);

    video.addEventListener('error', function () {
        if (started) {
            button.classList.remove('is-hidden');
            button.querySelector('span').textContent = '重新加载播放';
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player]').forEach(preparePlayer);
});
