/*
 * noVNC-icecast-audio.js: A robust, dependency-free Icecast audio player for noVNC.
 * Version: 2.1 (Dynamically loads the latest icecast-metadata-player using correct API)
 */
(function() {
    'use strict';

    // --- Configuration ---
    const LATEST_PLAYER_API_URL = 'https://data.jsdelivr.com/v1/packages/npm/icecast-metadata-player';
    const CDN_BASE_URL = 'https://cdn.jsdelivr.net/npm/icecast-metadata-player@';
    const ICON_UNMUTE = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/icons/volume-up.svg';
    const ICON_MUTE   = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/icons/volume-mute.svg';
    const ICON_ERROR  = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/icons/x-circle.svg';
    const ICON_LOADING = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/icons/hourglass-split.svg';

    // --- Dynamic Configuration from script tag ---
    const currentScript = document.currentScript;
    const ICECAST_STREAM_PATH = currentScript.dataset.streamPath || '/stream';

    // --- Global State ---
    let icecastPlayer;
    let audio;
    let isInitialized = false;
    let isPlaying = false;
    let audioButton;

    // --- Core Functions ---

    async function loadLatestIcecastScript(callback) {
        if (typeof IcecastMetadataPlayer !== 'undefined') {
            callback();
            return;
        }

        console.log('noVNC-icecast-audio: Fetching latest player version info...');
        try {
            const response = await fetch(LATEST_PLAYER_API_URL);
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            const data = await response.json();
            
            const latestVersion = data.tags.latest;
            const latestScriptUrl = `${CDN_BASE_URL}${latestVersion}/build/icecast-metadata-player-${latestVersion}.main.min.js`;

            console.log('noVNC-icecast-audio: Found latest player script:', latestScriptUrl);

            const script = document.createElement('script');
            script.src = latestScriptUrl;
            script.onload = () => {
                console.log('noVNC-icecast-audio: icecast-metadata-player loaded successfully.');
                callback();
            };
            script.onerror = () => {
                console.error(`noVNC-icecast-audio: Failed to load ${latestScriptUrl}.`);
                if (audioButton) setButtonIcon(ICON_ERROR, 'Error loading audio library');
            };
            document.head.appendChild(script);

        } catch (error) {
            console.error('noVNC-icecast-audio: Failed to fetch or parse latest player version.', error);
            if (audioButton) setButtonIcon(ICON_ERROR, 'Could not load audio library');
        }
    }

    function setButtonIcon(url, title) {
        if (!audioButton) return;
        audioButton.innerHTML = `<img src="${url}" style="width:24px;height:24px;vertical-align:middle;">`;
        audioButton.title = title;
    }

    function constructStreamUrl() {
        if (ICECAST_STREAM_PATH.startsWith('http://') || ICECAST_STREAM_PATH.startsWith('https://')) {
            return ICECAST_STREAM_PATH;
        }
        const currentUrl = new URL(window.location.href);
        return `${currentUrl.protocol}//${currentUrl.host}${ICECAST_STREAM_PATH}`;
    }

    function initializeIcecastPlayer() {
        const streamUrl = constructStreamUrl();
        console.log(`noVNC-icecast-audio: Initializing player for ${streamUrl}`);

        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'mediamtx_icecast_audio_element';
            audio.crossOrigin = "anonymous";
            document.body.appendChild(audio);
        }

        icecastPlayer = new IcecastMetadataPlayer(streamUrl, {
            audioElement: audio,
            metadataTypes: [], // Disable ICY metadata to prevent CORS errors
            enableLogging: true,
            onError: (error) => {
                console.error('noVNC-icecast-audio: Icecast Player Error:', error);
                setButtonIcon(ICON_ERROR, 'Stream error - click to retry');
                isPlaying = false;
                isInitialized = false;
            },
        });

        isInitialized = true;
    }

    async function toggleAudio() {
        if (!window.IcecastMetadataPlayer) {
            setButtonIcon(ICON_ERROR, 'Icecast Player Not Available');
            return;
        }
        try {
            if (!isInitialized) {
                setButtonIcon(ICON_LOADING, 'Initializing...');
                initializeIcecastPlayer();
            }
            if (!isPlaying) {
                console.log('noVNC-icecast-audio: Starting playback...');
                setButtonIcon(ICON_LOADING, 'Starting...');
                await icecastPlayer.play();
                setButtonIcon(ICON_UNMUTE, 'Mute Audio');
                isPlaying = true;
            } else {
                if (audio) {
                    audio.muted = !audio.muted;
                    setButtonIcon(audio.muted ? ICON_MUTE : ICON_UNMUTE, audio.muted ? 'Unmute Audio' : 'Mute Audio');
                }
            }
        } catch (error) {
            console.error('noVNC-icecast-audio: Failed to start playback:', error);
            setButtonIcon(ICON_ERROR, 'Playback failed - click to retry');
            isPlaying = false;
            isInitialized = false;
        }
    }

    function createControlButton() {
        const controlBar = document.getElementById('noVNC_control_bar');
        const scrollArea = controlBar && controlBar.querySelector('.noVNC_scroll');
        if (!scrollArea || document.getElementById('noVNC_icecast_audio_button')) return;

        audioButton = document.createElement('div');
        audioButton.id = 'noVNC_icecast_audio_button';
        audioButton.className = 'noVNC_button';
        audioButton.style.cursor = 'pointer';
        setButtonIcon(ICON_MUTE, 'Start Icecast Audio Stream');
        audioButton.addEventListener('click', toggleAudio);

        const settingsButton = document.getElementById('noVNC_settings_button');
        scrollArea.insertBefore(audioButton, settingsButton);
        console.log('noVNC-icecast-audio: Icecast audio control button added to UI.');
    }

    function initializeWhenReady() {
        const observer = new MutationObserver((_, obs) => {
            if (document.getElementById('noVNC_settings_button')) {
                loadLatestIcecastScript(() => createControlButton());
                obs.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    window.addEventListener('beforeunload', () => { if (icecastPlayer) icecastPlayer.stop(); });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWhenReady);
    } else {
        initializeWhenReady();
    }
})();
