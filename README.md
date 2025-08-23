# novnc-audio-plugin

A robust, dependency-free audio player for noVNC.

This package provides a simple way to add audio playback to your noVNC setup, using HLS streams from a media server like [MediaMTX](https://github.com/bluenviron/mediamtx).

## Installation

You can install this package using npm:

```bash
npm install novnc-audio-plugin
```

## Usage

To use the audio plugin, simply include the script in your HTML file. The script will automatically add an audio control button to the noVNC control bar.

### Default Usage

By default, the plugin will try to connect to the HLS stream at `/stream/index.m3u8`.

```html
<script src="node_modules/novnc-audio-plugin/novnc-mediamtx-audio.js" defer></script>
```

### Manual Installation

1.  Download the `novnc-mediamtx-audio.js` file.
    <br>
    <a href="https://raw.githubusercontent.com/nagamuslim/novnc-audio-plugin/main/novnc-mediamtx-audio.js" download="novnc-mediamtx-audio.js">
      <button>Download novnc-mediamtx-audio.js</button>
    </a>
2.  Place the downloaded file in your noVNC installation directory (e.g., `/usr/share/novnc`).
3.  Add the following script tag to your HTML file, before the closing `</head>` tag:

    ```html
    <script src="novnc-mediamtx-audio.js" defer></script>
    ```

### Custom Stream Path

You can specify a custom HLS stream path using the `data-stream-path` attribute in the script tag.

```html
<script src="node_modules/novnc-audio-plugin/novnc-mediamtx-audio.js" data-stream-path="/my-other-stream/live.m3u8" defer></script>
```

### CDN Usage

You can also use this package directly from a CDN like jsDelivr, without needing to install it via npm.

```html
<script src="https://cdn.jsdelivr.net/npm/novnc-audio-plugin/novnc-mediamtx-audio.js" defer></script>
```

## Repository

You can find the source code for this package on GitHub:

[https://github.com/nagamuslim/novnc-audio-plugin](https://github.com/nagamuslim/novnc-audio-plugin)

## npm Package

This package is also available on the npm registry:

[https://www.npmjs.com/package/novnc-audio-plugin](https://www.npmjs.com/package/novnc-audio-plugin)
