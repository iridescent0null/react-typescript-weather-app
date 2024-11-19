import { useState } from "react"
// import { PlayerState } from "youtube" // for some reason such import is not needed and can't be done (error)
import Config from "../../Config"

/** object in responses from ~/search API */
type FoundVideo = { //TODO not exact yet
    id: {
        kind: string,
        videoId: string 
    },
    etag: string,
    title: string,
    contentDetails: {
        duration: string,
        aspectRation: string
    }
}

/** object in responses from ~/video API */
type DetailedVideo = {
    etag: string,
    id: string,
    kind: string,
    snippet: Snippet
}

/** Thumbnail image url and sizes*/
type Thumbnail = {
    height: number,
    url: string,
    width: number
}

/** portion to describe infos about a video in Youtube API responses */
type Snippet = {
    categoryId?: string,
    channelId?: string,
    channelTitle?: string,
    defaultAudioLanguage?: string,
    description: string,
    localized?:{
        description: string,
        title: string
    }
    publishedAt: Date,
    thumbnails: Thumbnail[]
    title: string
}

/** valid options in YouTube search */
type ItemType = "video" | "channel" | "playlist";
 
type PageInfo = {
    totalResults: number,//number of the videos
    resultsPerPage: number
}
/** from ~/search API */
type SearchResponse = {
    kind: string,
    etag: string,
    netxPageToken?: string,
    regionCode: string, // TODO more precise type?
    pageInfo: PageInfo,
    items: FoundVideo[]
}
/** from ~/video API */
type VideoResponse = {
    etag: string,
    items: DetailedVideo[],
    kind: string,
    pageInfo: PageInfo
}

type SearchResult = {
    videos: FoundVideo[],
    total: number
}
type VideoResult = {
    snippets: Snippet[]
}

type YoutubeProps = {
    setYoutubeKeyword: React.Dispatch<React.SetStateAction<string>>,
    input: string
}

const YoutubeForm = (props: YoutubeProps) => {
    console.log(props);

    /** 
     * Call a Youtube API multiple times to translate the video ids to detailed information \
     * FIXME: this function currently calls the API exactly five times 
    */
    async function getAllDetailes (foundVideos: FoundVideo[]) {
        const requestURLs = foundVideos.map(video => getDetailEndPoint + video.id.videoId);
        const snippets: Snippet[] = [];
        return await Promise.all( //FIXME handle non-fixed length!
            [
                fetch(requestURLs[0]).then(res=>res.json()),
                fetch(requestURLs[1]).then(res=>res.json()),
                fetch(requestURLs[2]).then(res=>res.json()),
                fetch(requestURLs[3]).then(res=>res.json()),
                fetch(requestURLs[4]).then(res=>res.json()),
            ]
        )
        .then(responses => {
            const castReses = (responses as unknown as VideoResponse[]);
            const videoReses:VideoResponse[]=[];
            for(let i =0; i < responses.length; i++) {
                videoReses.push(castReses[i]);
            }
            return videoReses;
        })
        .then(detailedVideos => {
            for (let i = 0; i < detailedVideos.length; i++) {

                // TODO length check (normally items' length should be just 1)

                console.log(detailedVideos[i].items[0].snippet.title);
                snippets.push(detailedVideos[i].items[0].snippet);
            }
        })
        .then(() => snippets);
    };

    const [searchResult, setSearchResult] = useState<SearchResult>(); // TODO can be removed?
    const [videoResult, setVideoResult] = useState<VideoResult>();
    const soughtItemType: ItemType = "video"; // TODO make choosable
    const getDetailEndPoint = `https://www.googleapis.com/youtube/v3/videos?key=${Config.youtube.apiKey}&part=snippet&id=`;
    const getSearchEndPoint = `https://www.googleapis.com/youtube/v3/search?key=${Config.youtube.apiKey}&q=${props.input}&type=${soughtItemType}`;

    /** when it is true, http request will get quenched */
    const gateKeeper = false;

    const getVideos = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (gateKeeper) {
            alert("under construction");
            return; 
        } 

        fetch(getSearchEndPoint)
            .then(res =>  res.json())
            .then(json => {
                console.log(json);
                const foundVideos: FoundVideo[] =  (json as unknown as SearchResponse).items;
                const infos = (json as unknown as SearchResponse).pageInfo;
                setSearchResult(
                    {
                        "videos": foundVideos,
                        "total": infos.totalResults
                    }
                )
                return foundVideos;
            })
            .then(videos => getAllDetailes(videos))
            .then(snippets => {
                setVideoResult(
                    {
                        snippets: snippets
                    }
                );
            })
            .catch(error => console.error(error));
    }

    // TODO very lousy HTML only to check the behavior of Youtube APIs
    // TDDO handle random array length
    return (
    <>
        <form onSubmit={getVideos} >
            <input onChange={
                e => {
                    props .setYoutubeKeyword(e.target.value);
                }
            }/><br/>
            <button type="submit"> search  youtube</button>
            <ul>
                <li>{(videoResult && videoResult.snippets&& videoResult.snippets[0])?"title: "+ videoResult.snippets[0].title:""}</li>
                <li>{(videoResult && videoResult.snippets&& videoResult.snippets[0])?"channel: "+ videoResult.snippets[0].channelTitle:""}</li>
                <li>{(videoResult && videoResult.snippets&& videoResult.snippets[1])?"title: "+ videoResult.snippets[1].title:""}</li>
                <li>{(videoResult && videoResult.snippets&& videoResult.snippets[1])?"channel: "+ videoResult.snippets[0].channelTitle:""}</li>
                <li>{(videoResult && videoResult.snippets&& videoResult.snippets[2])?"title: "+ videoResult.snippets[2].title:""}</li>
                <li>{(videoResult && videoResult.snippets&& videoResult.snippets[2])?"channel: "+ videoResult.snippets[0].channelTitle:""}</li>
                <li>{(videoResult && videoResult.snippets&& videoResult.snippets[3])?"title: "+ videoResult.snippets[3].title:""}</li>
                <li>{(videoResult && videoResult.snippets&& videoResult.snippets[3])?"channel: "+ videoResult.snippets[0].channelTitle:""}</li>
                <li>{(videoResult && videoResult.snippets&& videoResult.snippets[4])?"title: "+ videoResult.snippets[4].title:""}</li>
                <li>{(videoResult && videoResult.snippets&& videoResult.snippets[0])?"channel: "+ videoResult.snippets[4].channelTitle:""}</li>
            </ul>
            <div>
            {searchResult?"total videos: "+ searchResult.total:""}
            </div>
        </form>
    </>
    );
};

export default YoutubeForm;
export type { YoutubeProps };

//actual response example 
/**
 * {
  "kind": "youtube#searchListResponse",
  "etag": "QlXPURA73uLH8ZTRPBcDQdNiWpk",
  "nextPageToken": "CAUQAA",
  "regionCode": "JP",
  "pageInfo": {
    "totalResults": 374951,
    "resultsPerPage": 5
  },
  "items": [
    {
      "kind": "youtube#searchResult",
      "etag": "erHEhy6uIyNkwZUiHE1K8PphTVc",
      "id": {
        "kind": "youtube#video",
        "videoId": "k597ABpQhF0"
      }
    },
    {
      "kind": "youtube#searchResult",
      "etag": "TRkou64Vvwvr48GGKjBrMpPjFqE",
      "id": {
        "kind": "youtube#video",
        "videoId": "EynbJ2mAgYg"
      }
    },
    {
      "kind": "youtube#searchResult",
      "etag": "_-0mV6MKIj2TUsG9e5bSYWbjZdo",
      "id": {
        "kind": "youtube#video",
        "videoId": "SXWS33wWOeA"
      }
    },
    {
      "kind": "youtube#searchResult",
      "etag": "791EcuhZrFS-aejijE-hLIs4T24",
      "id": {
        "kind": "youtube#video",
        "videoId": "NrH-3P4p3Gk"
      }
    },
    {
      "kind": "youtube#searchResult",
      "etag": "_czXRymEE9a_oTLZ_b1DO60WVkM",
      "id": {
        "kind": "youtube#video",
        "videoId": "eg5L1PTgFcA"
      }
    }
  ]
}

 * 
 */