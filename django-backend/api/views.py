import re

import requests
import yt_dlp
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.http import require_GET

from .ytdlp_config import get_ydl_opts


def _clean_error(message: str) -> str:
    text = re.sub(r"\x1b\[[0-9;]*m", "", message or "")
    if "Sign in to confirm" in text:
        return (
            "YouTube blocked this request. Set YTDLP_COOKIES_BROWSER=chrome "
            "(or firefox) in your environment and restart the backend."
        )
    if "challenge solving failed" in text.lower():
        return (
            "YouTube challenge solving failed. Install dependencies with "
            "'pip install yt-dlp[default] yt-dlp-ejs' and ensure Node.js is available."
        )
    return text.strip() or "Failed to extract audio stream"


def _thumbnail_url(entry):
    thumbnails = entry.get("thumbnails") or []
    if thumbnails:
        return thumbnails[-1].get("url")
    return entry.get("thumbnail")


def _get_audio_info(video_id):
    url = f"https://www.youtube.com/watch?v={video_id}"
    with yt_dlp.YoutubeDL(get_ydl_opts()) as ydl:
        return ydl.extract_info(url, download=False)


@require_GET
def search_youtube(request):
    query = request.GET.get("q", "")
    max_results = int(request.GET.get("max_results", 15))
    if not query:
        return JsonResponse({"error": "Query 'q' is required"}, status=400)

    with yt_dlp.YoutubeDL(get_ydl_opts(extract_flat="in_playlist")) as ydl:
        try:
            info = ydl.extract_info(f"ytsearch{max_results}:{query}", download=False)
            entries = info.get("entries", [])

            formatted_results = []
            for entry in entries:
                if not entry:
                    continue
                formatted_results.append(
                    {
                        "id": entry.get("id"),
                        "title": entry.get("title"),
                        "duration": entry.get("duration"),
                        "channel": entry.get("uploader") or entry.get("channel"),
                        "thumbnail": _thumbnail_url(entry),
                    }
                )

            return JsonResponse({"results": formatted_results})
        except Exception as e:
            return JsonResponse({"error": _clean_error(str(e))}, status=500)


@require_GET
def get_stream_url(request, video_id):
    try:
        info = _get_audio_info(video_id)
        stream_url = info.get("url")
        if not stream_url:
            return JsonResponse({"error": "No audio stream found for this video"}, status=404)

        return JsonResponse(
            {
                "id": video_id,
                "title": info.get("title"),
                "url": stream_url,
                "thumbnail": info.get("thumbnail"),
                "duration": info.get("duration"),
                "channel": info.get("uploader"),
                "ext": info.get("ext"),
            }
        )
    except Exception as e:
        return JsonResponse({"error": _clean_error(str(e))}, status=500)


@require_GET
def proxy_stream(request, video_id):
    try:
        info = _get_audio_info(video_id)
        stream_url = info.get("url")
        if not stream_url:
            return JsonResponse({"error": "No audio stream found for this video"}, status=404)

        range_header = request.META.get("HTTP_RANGE", "").strip()
        headers = {}
        if range_header:
            headers["Range"] = range_header

        upstream = requests.get(stream_url, stream=True, headers=headers, timeout=30)
        upstream.raise_for_status()

        def iterfile():
            try:
                for chunk in upstream.iter_content(chunk_size=65536):
                    if chunk:
                        yield chunk
            finally:
                upstream.close()

        ext = info.get("ext") or "m4a"
        mime_types = {
            "m4a": "audio/mp4",
            "mp4": "audio/mp4",
            "webm": "audio/webm",
            "opus": "audio/webm",
            "mp3": "audio/mpeg",
        }
        content_type = upstream.headers.get(
            "Content-Type", mime_types.get(ext, "audio/mp4")
        )

        response = StreamingHttpResponse(
            iterfile(), content_type=content_type, status=upstream.status_code
        )
        response["Accept-Ranges"] = "bytes"
        if "Content-Length" in upstream.headers:
            response["Content-Length"] = upstream.headers["Content-Length"]
        if "Content-Range" in upstream.headers:
            response["Content-Range"] = upstream.headers["Content-Range"]
        return response

    except Exception as e:
        return JsonResponse({"error": _clean_error(str(e))}, status=500)


@require_GET
def download_audio(request, video_id):
    try:
        info = _get_audio_info(video_id)
        stream_url = info.get("url")
        title = info.get("title", "audio")
        ext = info.get("ext") or "m4a"
        if not stream_url:
            return JsonResponse({"error": "No audio stream found for this video"}, status=404)

        upstream = requests.get(stream_url, stream=True, timeout=30)
        upstream.raise_for_status()

        def iterfile():
            try:
                for chunk in upstream.iter_content(chunk_size=65536):
                    if chunk:
                        yield chunk
            finally:
                upstream.close()

        safe_title = "".join(c for c in title if c.isalnum() or c in " -_").strip() or "audio"
        response = StreamingHttpResponse(iterfile(), content_type="audio/mp4")
        response["Content-Disposition"] = f'attachment; filename="{safe_title}.{ext}"'
        return response

    except Exception as e:
        return JsonResponse({"error": _clean_error(str(e))}, status=500)
