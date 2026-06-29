import os


def get_ydl_opts(**overrides):
    """Build yt-dlp options with YouTube challenge-solving support."""
    opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "noplaylist": True,
        "format": "bestaudio/best",
        "js_runtimes": {"node": {}, "deno": {}},
        "remote_components": ["ejs:github"],
        "extractor_args": {
            "youtube": {
                "player_client": ["android", "web"],
            }
        },
    }

    cookies_browser = os.environ.get("YTDLP_COOKIES_BROWSER")
    if cookies_browser:
        opts["cookiesfrombrowser"] = (cookies_browser,)

    cookie_file = os.environ.get("YTDLP_COOKIE_FILE")
    if cookie_file:
        opts["cookiefile"] = cookie_file

    opts.update(overrides)
    return opts
