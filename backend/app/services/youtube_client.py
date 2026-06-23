import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from app.core.config import get_settings
from app.schemas.common import ProviderSearchItem


class YouTubeProviderError(Exception):
    pass


def is_configured() -> bool:
    return bool(get_settings().youtube_api_key)


def search_videos(query: str, limit: int) -> list[ProviderSearchItem]:
    api_key = get_settings().youtube_api_key
    if not api_key:
        raise YouTubeProviderError("YouTube is not configured. Add YOUTUBE_API_KEY on the backend.")
    results: list[ProviderSearchItem] = []
    seen: set[str] = set()
    page_token: str | None = None
    target = max(1, min(limit, 100))
    while len(results) < target:
        params = {"part": "snippet", "type": "video", "q": query, "maxResults": min(50, target - len(results)), "key": api_key}
        if page_token:
            params["pageToken"] = page_token
        search = _request_json("https://www.googleapis.com/youtube/v3/search?" + urlencode(params))
        page = search.get("items", [])
        video_ids = [item.get("id", {}).get("videoId") for item in page if item.get("id", {}).get("videoId")]
        views: dict[str, float] = {}
        if video_ids:
            stats = _request_json("https://www.googleapis.com/youtube/v3/videos?" + urlencode({"part": "statistics", "id": ",".join(video_ids), "key": api_key}))
            views = {item.get("id"): float(item.get("statistics", {}).get("viewCount", 0)) for item in stats.get("items", [])}
        for item in page:
            video_id = item.get("id", {}).get("videoId")
            if not video_id or video_id in seen:
                continue
            seen.add(video_id)
            snippet = item.get("snippet") or {}
            thumbnails = snippet.get("thumbnails") or {}
            thumbnail = thumbnails.get("high") or thumbnails.get("medium") or thumbnails.get("default") or {}
            results.append(ProviderSearchItem(title=snippet.get("title") or "Untitled YouTube video", artist_name=snippet.get("channelTitle"), platform="youtube", source_url=f"https://www.youtube.com/watch?v={video_id}", thumbnail_url=thumbnail.get("url"), popularity_score=views.get(video_id), metadata_json={"youtube_video_id": video_id, "channel_id": snippet.get("channelId"), "published_at": snippet.get("publishedAt")}))
            if len(results) >= target:
                break
        page_token = search.get("nextPageToken")
        if not page_token or not page:
            break
    return results


def _request_json(url: str) -> dict:
    try:
        with urlopen(Request(url), timeout=15) as response:
            return json.loads(response.read().decode())
    except HTTPError as error:
        message = error.read().decode(errors="replace")
        raise YouTubeProviderError(f"YouTube request failed ({error.code}): {message[:220]}") from None
    except URLError as error:
        raise YouTubeProviderError("YouTube is temporarily unreachable.") from error
