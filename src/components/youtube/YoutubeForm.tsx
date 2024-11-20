import { useState } from "react"
import Config from "../../Config"
import VideoDivision from "./VideoDivision"

// TODO remove countless comment lines after tests (depelecation of API quata prevented me from doing that)

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

// apparently it has following keys: default, high, maxres, medium and standard
interface Thumbnails {
    default: Thumbnail
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
    thumbnails: Thumbnails
    title: string
}

/** pagenation option (new means to get fresh search result)*/
type PageDirection = "previous" | "next" | "new";

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
    nextPageToken?: string,
    prevPageToken?:string,
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
    const [nextPageToken, setNextPageToken] = useState<string>();
    const [previousPageToken, setPreviousPageToken] = useState<string>();
    const [pageDirection,setPageDirection] = useState<PageDirection>("new");

    const soughtItemType: ItemType = "video"; // TODO make choosable
    const getDetailEndPoint = `https://www.googleapis.com/youtube/v3/videos?key=${Config.youtube.apiKey}&part=snippet&id=`;
    const getSearchEndPoint = `https://www.googleapis.com/youtube/v3/search?key=${Config.youtube.apiKey}&q=${props.input}&type=${soughtItemType}`;
    const getAnotherPageSearchEndPoint = `https://www.googleapis.com/youtube/v3/search?key=${Config.youtube.apiKey}&q=${props.input}&type=${soughtItemType}&pageToken=`;

    /** when it is true, http request will get quenched */
    const gateKeeper = false;

    const getVideosPrev = (e: React.FormEvent<HTMLFormElement>) => {
        // e.preventDefault();
        // if (gateKeeper) {
        //     alert("under construction");
        //     return; 
        // } 
        // fetch(getAnotherPageSearchEndPoint + previousPageToken)
        // .then(res =>  res.json())
        // .then(json => {
        //     console.log(json);
        //     const foundVideos: FoundVideo[] =  (json as unknown as SearchResponse).items;
        //     const infos = (json as unknown as SearchResponse).pageInfo;
        //     setSearchResult(
        //         {
        //             "videos": foundVideos,
        //             "total": infos.totalResults
        //         }
        //     )
        //     if ((json as unknown as SearchResponse).nextPageToken){
        //         setNextPageToken(
        //             (json as unknown as SearchResponse).nextPageToken
        //         )
        //     }
        //     if ((json as unknown as SearchResponse).prevPageToken){
        //         setPreviousPageToken(
        //             (json as unknown as SearchResponse).prevPageToken
        //         )
        //     }
        //     return foundVideos;
        // })
        // .then(videos => getAllDetailes(videos))
        // .then(snippets => {
        //     setVideoResult(
        //         {
        //             snippets: snippets
        //         }
        //     );
        // })
        // .catch(error => console.error(error));
        setPageDirection("previous");
        getVideos(e);
    }

    const getVideosNext = (e: React.FormEvent<HTMLFormElement>) => {
        // e.preventDefault();
        // if (gateKeeper) {
        //     alert("under construction");
        //     return; 
        // } 
        // fetch(getAnotherPageSearchEndPoint + nextPageToken)
        // .then(res =>  res.json())
        // .then(json => {
        //     console.log(json);
        //     const foundVideos: FoundVideo[] =  (json as unknown as SearchResponse).items;
        //     const infos = (json as unknown as SearchResponse).pageInfo;
        //     setSearchResult(
        //         {
        //             "videos": foundVideos,
        //             "total": infos.totalResults
        //         }
        //     )
        //     if ((json as unknown as SearchResponse).nextPageToken){
        //         setNextPageToken(
        //             (json as unknown as SearchResponse).nextPageToken
        //         )
        //     }
        //     if ((json as unknown as SearchResponse).prevPageToken){
        //         setPreviousPageToken(
        //             (json as unknown as SearchResponse).prevPageToken
        //         )
        //     }
        //     return foundVideos;
        // })
        // .then(videos => getAllDetailes(videos))
        // .then(snippets => {
        //     setVideoResult(
        //         {
        //             snippets: snippets
        //         }
        //     );
        // })
        // .catch(error => console.error(error));
        setPageDirection("next");
        getVideos(e);
    }

    const getNewVideos = (e: React.FormEvent<HTMLFormElement>) => {
        setPageDirection("new");
        getVideos(e);
    }

    const getVideos = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (gateKeeper) {
            alert("under construction");
            return; 
        } 

        // if (pageDirection === "new") {
        //     getNewVideos(e);
        //     return;
        // }

        // if (pageDirection === "previous") {
        //     getVideosPrev(e);
        //     return;
        // }

        // if (pageDirection === "next") {
        //     getVideosNext(e);
        //     return;
        // }

        // throw Error();

        const searchURL = pageDirection === "new"? getSearchEndPoint: pageDirection === "previous"? getAnotherPageSearchEndPoint + previousPageToken: getAnotherPageSearchEndPoint + nextPageToken

        fetch(searchURL) //TODO accept page token if needed
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

                // TODO resolve lengthy if statements
                // TODO don't these states inadvertently remain old tokens after new search?
                if ((json as unknown as SearchResponse).nextPageToken){
                    setNextPageToken(
                        (json as unknown as SearchResponse).nextPageToken
                    )
                }
                if ((json as unknown as SearchResponse).prevPageToken){
                    setPreviousPageToken(
                        (json as unknown as SearchResponse).prevPageToken
                    )
                }
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

    return (
    <>
        <form onSubmit={getNewVideos} >
            <input onChange={
                e => {
                    props.setYoutubeKeyword(e.target.value);
                }
            } className="form-control"/><br/>
            <button className="btn btn-success" type="submit"> search  youtube</button>
            <div>
            {searchResult?"total videos: "+ searchResult.total:""}
            </div>
            <VideoDivision snippet={videoResult? videoResult.snippets[0] : undefined} />
            <VideoDivision snippet={videoResult? videoResult.snippets[1] : undefined} />
            <VideoDivision snippet={videoResult? videoResult.snippets[2] : undefined} />
            <VideoDivision snippet={videoResult? videoResult.snippets[3] : undefined} />
            <VideoDivision snippet={videoResult? videoResult.snippets[4] : undefined} />     
        </form>
        <form onSubmit={getVideosPrev} >
            {previousPageToken? <button className="btn form-control btn-sm" type="submit"> &#60; PREVIOUS</button>:<span></span>}
        </form>
        <form onSubmit={getVideosNext} >
            {nextPageToken? <button className="btn form-control btn-sm" type="submit"> NEXT &#62; </button>:<span></span>}
        </form>
    </>
    );
};

export default YoutubeForm;
export type { YoutubeProps };
export type { Snippet };