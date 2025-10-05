# novnc-audio-plugin

A robust, dependency-free audio player for noVNC.

This package provides a simple way to add audio playback to your noVNC setup, using HLS streams from a media server like [MediaMTX](https://github.com/bluenviron/mediamtx).

## Usage (Recommended)

> **Warning: Cross-Origin (CORS) Policy**
> Modern web browsers will block audio from a different domain than the noVNC page is served from. To play a stream from a different server (i.e., a public radio station or a local server on a different port), you **must** use a reverse proxy (like Nginx) to make the stream appear to come from the same origin as the noVNC page. The proxy must also be configured to handle CORS headers correctly.

You can use this package directly from a CDN like jsDelivr, without needing to install it. This is the easiest and recommended method.

### For MediaMTX (HLS Streams)

Simply add the following script tag to your HTML file, before the closing `</head>` tag:

```html
<script src="https://cdn.jsdelivr.net/npm/novnc-audio-plugin/novnc-mediamtx-audio.js" defer></script>
```

### Custom Stream Path

You can specify a custom HLS stream path using the `data-stream-path` attribute in the script tag.

```html
<script src="https://cdn.jsdelivr.net/npm/novnc-audio-plugin/novnc-mediamtx-audio.js" data-stream-path="/my-other-stream/live.m3u8" defer></script>
```

By default, the plugin will try to connect to the HLS stream at `/stream/index.m3u8`.

### For Icecast (MP3/OGG Streams)

To play standard Icecast streams, use the `novnc-icecast-audio.js` script. You must provide a full URL to your stream in the `data-stream-path` attribute.

```html
<script src="https://cdn.jsdelivr.net/npm/novnc-audio-plugin/novnc-icecast-audio.js" data-stream-path="URL_OR_PATH_TO_YOUR_STREAM" defer></script>
```

> **Note:** If the audio button does not appear in the noVNC control bar, please try a hard refresh of your browser (Ctrl+Shift+R or Cmd+Shift+R).

## Advanced Usage

### Manual Installation

If you prefer not to use the CDN, you can download the script and host it yourself.

1.  Download the `novnc-mediamtx-audio.js` file.
    <br>
    <a href="https://raw.githubusercontent.com/nagamuslim/novnc-audio-plugin/main/novnc-mediamtx-audio.js" download="novnc-mediamtx-audio.js">
      <button>Download novnc-mediamtx-audio.js</button>
    </a>
2.  Place the downloaded file in your noVNC installation directory.
3.  Add the following script tag to your HTML file:

    ```html
    <script src="novnc-mediamtx-audio.js" defer></script>
    ```

### Installation for Developers (npm)

If you are bundling this plugin into a larger project, you can install it via npm:

```bash
npm install novnc-audio-plugin
```

Then you can include it in your project as needed:

```html
<script src="node_modules/novnc-audio-plugin/novnc-mediamtx-audio.js" defer></script>
```

## Repository

You can find the source code for this package on GitHub:

[https://github.com/nagamuslim/novnc-audio-plugin](https://github.com/nagamuslim/novnc-audio-plugin)

## npm Package

This package is also available on the npm registry:

[https://www.npmjs.com/package/novnc-audio-plugin](https://www.npmjs.com/package/novnc-audio-plugin)
