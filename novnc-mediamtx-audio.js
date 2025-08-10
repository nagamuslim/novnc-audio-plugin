/*
 * noVNC-mediamtx-audio.js: A robust, dependency-free audio player for noVNC.
 * Version: 3.0 (Configurable Stream Path)
 *
 * This version allows you to specify the HLS stream path directly in the
 * HTML script tag using the 'data-stream-path' attribute.
 *
 * --- USAGE ---
 * Default (uses '/stream/index.m3u8'):
 * <script src="novnc-mediamtx-audio.js" defer></script>
 *
 * Custom Path:
 * <script src="novnc-mediamtx-audio.js" data-stream-path="/my-other-stream/live.m3u8" defer></script>
 *
 */
(function() {
    'use strict';

    // --- Default Configuration ---
    const HLS_SCRIPT_PATH = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
    // Icons (Bootstrap Icons via jsDelivr)
    const ICON_UNMUTE = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/icons/volume-up.svg';
    const ICON_MUTE   = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/icons/volume-mute.svg';
    const ICON_RETRY  = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/icons/arrow-repeat.svg';
    const ICON_ERROR  = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/icons/x-circle.svg';
    // --- End of Configuration ---

    // --- Dynamic Configuration ---
    // Get the current script element to read its attributes
    const currentScript = document.currentScript;
    // Get the stream path from the 'data-stream-path' attribute, or use the default
    const HLS_STREAM_PATH = currentScript.dataset.streamPath || '/stream/index.m3u8';
    console.log(`noVNC-audio: Using stream path: ${HLS_STREAM_PATH}`);
    // --- End of Dynamic Configuration ---

    let hls;
    let audio;
    let isInitialized = false;
    let audioButton;

    function loadHlsScript(callback) {
        if (typeof Hls !== 'undefined') {
            callback();
            return;
        }
        console.log('noVNC-audio: Loading hls.js...');
        const script = document.createElement('script');
        script.src = HLS_SCRIPT_PATH;
        script.onload = () => {
            console.log('noVNC-audio: hls.js loaded successfully.');
            callback();
        };
        script.onerror = () => {
            console.error(`noVNC-audio: Failed to load ${HLS_SCRIPT_PATH}.`);
            if (audioButton) {
                setButtonIcon(ICON_ERROR, 'Error loading audio library');
            }
        };
        document.head.appendChild(script);
    }

    function setButtonIcon(url, title) {
        if (!audioButton) return;
        audioButton.innerHTML = `<img src="${url}" style="width:24px;height:24px;vertical-align:middle;">`;
        audioButton.title = title;
    }

    function toggleAudio() {
        if (!isInitialized) {
            if (!window.Hls || !Hls.isSupported()) {
                console.error('noVNC-audio: HLS is not supported in this browser.');
                setButtonIcon(ICON_ERROR, 'HLS Not Supported');
                return;
            }
            console.log('noVNC-audio: Initializing player...');
            audio = document.createElement('audio');
            audio.id = 'mediamtx_audio_element';
            audio.crossOrigin = "anonymous";
            document.body.appendChild(audio);

            hls = new Hls({
                // Robust HLS configuration for low-latency streams
                fragLoadPolicy: {
                    default: {
                        maxTimeToFirstByteMs: 10000,
                        maxLoadTimeMs: 60000,
                        timeoutMs: 60000,
                        maxRetry: 99,
                        retryDelayMs: 1000,
                        maxRetryDelayMs: 8000,
                    }
                }
            });
            hls.attachMedia(audio);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('noVNC-audio: Manifest parsed. Attempting to play.');
                audio.play().then(() => {
                    audio.muted = false;
                    setButtonIcon(ICON_UNMUTE, 'Mute Audio');
                }).catch(() => {
                    console.warn('noVNC-audio: Autoplay blocked. Playing muted.');
                    audio.muted = true;
                    audio.play();
                    setButtonIcon(ICON_MUTE, 'Unmute Audio (Autoplay Blocked)');
                });
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    console.error('noVNC-audio: Fatal HLS Error:', data.details);
                    hls.destroy();
                    isInitialized = false;
                    setButtonIcon(ICON_RETRY, 'Stream failed – click to retry');
                }
            });

            hls.loadSource(HLS_STREAM_PATH);
            isInitialized = true;

        } else {
            // Already initialized – just toggle mute
            if (audio) {
                audio.muted = !audio.muted;
                if (audio.muted) {
                    setButtonIcon(ICON_MUTE, 'Unmute Audio');
                } else {
                    setButtonIcon(ICON_UNMUTE, 'Mute Audio');
                }
            }
        }
    }

    function createControlButton() {
        const controlBar = document.getElementById('noVNC_control_bar');
        const scrollArea = controlBar && controlBar.querySelector('.noVNC_scroll');
        if (!scrollArea || document.getElementById('noVNC_audio_button')) return;

        audioButton = document.createElement('div');
        audioButton.id = 'noVNC_audio_button';
        audioButton.className = 'noVNC_button';
        audioButton.style.fontSize = '20px';
        audioButton.style.lineHeight = '24px';
        audioButton.style.textAlign = 'center';
        audioButton.style.cursor = 'pointer';
        // initial state = muted/off
        setButtonIcon(ICON_MUTE, 'Start Audio Stream');

        audioButton.addEventListener('click', toggleAudio);

        const settingsButton = document.getElementById('noVNC_settings_button');
        if (settingsButton) {
            scrollArea.insertBefore(audioButton, settingsButton);
        } else {
            scrollArea.appendChild(audioButton);
        }
        console.log('noVNC-audio: Audio control button added to UI.');
    }

    function initializeWhenReady() {
        const observer = new MutationObserver((_, obs) => {
            if (document.getElementById('noVNC_settings_button')) {
                loadHlsScript(createControlButton);
                obs.disconnect();
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWhenReady);
    } else {
        initializeWhenReady();
    }
})();
