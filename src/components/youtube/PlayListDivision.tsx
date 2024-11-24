import { Snippet } from "./YoutubeForm";
import { formPrettyDate } from "../sandbox/SandBoxForm";


// can VIdeoDevision be used instead??

type PlaylistDivisionProps = {
  snippet: Snippet | undefined;
}

const PlaylistDivision = (props: PlaylistDivisionProps) => {
  const snippet = props.snippet;

  if (!snippet) {
    return (<span></span>);
  }

  return (
    <div className="container playlist-container">
        <div className="row">
            <img className="col-3" src={snippet.thumbnails.default? snippet.thumbnails.default.url:""}/>
            <div className="col-9 video-detail">
                <div className="title">title: {snippet.title}</div>
                <div className="channel">channel: {snippet.channelTitle}</div>
                <div className="description">description: {snippet.description}</div>
                <div className="publishedAt">publish: {formPrettyDate(new Date(snippet.publishedAt))}</div>
            </div>
        </div>
    </div>
  )
}

export default PlaylistDivision;

/**
 * {
  "kind": "youtube#playlistListResponse",
  "etag": "StDkAJGgSPxmXdsrWqKmUcj4u9M",
  "pageInfo": {
    "totalResults": 1,
    "resultsPerPage": 5
  },
  "items": [
    {
      "kind": "youtube#playlist",
      "etag": "hoPeF53n3H-BAv3oPdBhvHw0mMw",
      "id": "PLivPhjvJMFujLmi2eOzsMHzVp-HHF_iH9",
      "snippet": {
        "publishedAt": "2021-12-31T14:28:28Z",
        "channelId": "UCeLKqjlXl3l-2yabOEboIaQ",
        "title": "アドマイヤベガ",
        "description": "",
        "thumbnails": {
          "default": {
            "url": "https://i.ytimg.com/vi/cjNW-swzziY/default.jpg",
            "width": 120,
            "height": 90
          },
          "medium": {
            "url": "https://i.ytimg.com/vi/cjNW-swzziY/mqdefault.jpg",
            "width": 320,
            "height": 180
          },
          "high": {
            "url": "https://i.ytimg.com/vi/cjNW-swzziY/hqdefault.jpg",
            "width": 480,
            "height": 360
          },
          "standard": {
            "url": "https://i.ytimg.com/vi/cjNW-swzziY/sddefault.jpg",
            "width": 640,
            "height": 480
          },
          "maxres": {
            "url": "https://i.ytimg.com/vi/cjNW-swzziY/maxresdefault.jpg",
            "width": 1280,
            "height": 720
          }
        },
        "channelTitle": "平井大輔",
        "localized": {
          "title": "アドマイヤベガ",
          "description": ""
        }
      }
    }
  ]
}

 */