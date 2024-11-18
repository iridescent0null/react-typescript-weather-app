import { useState } from "react"
// import { PlayerState } from "youtube" // for some reason such import is not needed and can't be done (error)
import Config from "../../Config"

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

type DetailedVideo = {
    etag: string,
    id: string,
    kind: string,
    snippet: Snippet
}

/**
 * Thumbnail image url
 */
type Thumbnail = {
    height: number,
    url: string,
    width: number
}

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
type SearchResponse = {
    kind: string,
    etag: string,
    netxPageToken?: string,
    regionCode: string, // TODO more precise type?
    pageInfo: PageInfo,
    items: FoundVideo[]
}

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
    const [searchResult, setSearchResult] = useState<SearchResult>(); // TODO can ve removed?
    const [videoResult, setVideoResult] = useState<VideoResult>();
    const soughtItemType: ItemType = "video"; // TODO make choosable

    const getDetailEndPoint = `https://www.googleapis.com/youtube/v3/videos?key=${Config.youtube.apiKey}&part=snippet&id=`;
    const getSearchEndPoint = `https://www.googleapis.com/youtube/v3/search?key=${Config.youtube.apiKey}&q=${props.input}&type=${soughtItemType}`;

    /**
     * when it is true, http request will get quenched 
     */
    const gateKeeper = false;

    const getMovies = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        if (gateKeeper) {
            alert("under construction");
            return; 
        } 

        let snippets: Snippet[] = [];

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
            .then(videos => {
                //const snippets: Snippet[] = [];
                return fetch(getDetailEndPoint + videos[0].id.videoId) //TODO loop //TODO make synch
                    .then(res => res.json())
                    .then(json => {
                        console.log(json);
                        const detailedVideos: DetailedVideo[] = (json as unknown as VideoResponse).items;

                        if (detailedVideos.length > 1) {
                                console.error("multiple videos found for a id!");
                                console.log(json);
                        }
                        console.log(detailedVideos[0].snippet.title);
                        // snippets.push(detailedVideos[0].snippet);
                        return detailedVideos[0].snippet;
                    })

            })
            .then(snippet => {
                snippets.push(snippet);
            })
            .then( () => {
                const newSnippets = [...snippets];
                console.log(snippets);
                console.log(newSnippets);
                setVideoResult(
                    {
                        snippets: newSnippets
                    }
                );
            })

            .catch(error => console.error(error));
    }

    // TODO very lousy HTML only to check the behavior of Youtube APIs
    return (
    <>
        <form onSubmit={getMovies} >
            <input onChange={
                e => {
                    props .setYoutubeKeyword(e.target.value);
                }
            }/><br/>
            <button type="submit"> search  youtube</button>
            <ul>
                <li>{(videoResult && videoResult.snippets&& videoResult.snippets[0])?"title: "+ videoResult.snippets[0].title:""}</li>
                <li>{searchResult?"video id: "+ searchResult.videos[1].id.videoId:""}</li>
                <li>{searchResult?"video id: "+ searchResult.videos[2].id.videoId:""}</li>
                <li>{searchResult?"video id: "+ searchResult.videos[3].id.videoId:""}</li>
                <li>{searchResult?"video id: "+ searchResult.videos[4].id.videoId:""}</li>
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