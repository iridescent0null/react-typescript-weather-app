import { useState } from "react"
import Config from "../../Config"
import VideoDivision from "./VideoDivision"
import ChannelDivision from "./ChannelDivision"

// FIXME this form erroneously shares the page token among the three search types!
// FIXME reproduced bug: search for videos -> search for channels -> push the next button -> the page won't change

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
// TODO consolidate these three FoundXXX types
type FoundPlayList = {
    kind: string,
    etag: string,
    id: {
        kind: string,
        playlistId: string
    }
}
type FoundChannel = {
    kind: string,
    etag: string,
    id: {
        kind: string,
        channelId: string
    }
}

type FoundItems = FoundVideo[] | FoundPlayList[] | FoundChannel[];

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
    customUrl?: string,
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

type BrandedSnippet = Snippet & {_brand: ItemType}

/** pagenation option (new means to get fresh search result)*/
type PageDirection = "previous" | "next" | "new";

/** valid options in YouTube search */
type ItemType = "video" | "channel" | "playlist"; // Currenlty channel and playlist can be sought but displayed
 
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
    items: FoundItems
}

/** from ~/video API */
type VideoResponse = {
    etag: string,
    items: DetailedVideo[],
    kind: string,
    pageInfo: PageInfo
}

type SearchResult = {
    items: FoundItems,
    total: number
}

// corrently these three types for result are completely the same as each other (in the future idk)
type VideoResult = {
    snippets: Snippet[]
}
type ChannelResult = {
    snippets: Snippet[]
}
type PlaylistResult = {
    snippets: Snippet[]
}

type YoutubeProps = {
    setYoutubeKeyword: React.Dispatch<React.SetStateAction<string>>,
    input: string
}

const YoutubeForm = (props: YoutubeProps) => {
    console.log(props);

    async function getAllDetails (foundItems: FoundItems) {
        console.log(foundItems);
        if("playlistId" in foundItems[0].id) {
            return await getAllPlaylistDetailes (foundItems as FoundPlayList[]);
        }

        if("channelId" in foundItems[0].id) {
            return await getAllChannelDetails(foundItems as FoundChannel[]);
        }
    
        if("videoId" in foundItems[0].id) {
            return await getAllVideoDetailes (foundItems as FoundVideo[]);
        }
        throw new Error();
    }

    async function requestAll (URLs: string[]) {
        return await Promise.all( //FIXME handle non-fixed length! particularly 4 or less length may result in an error
            [
                fetch(URLs[0]).then(res=>res.json()),
                fetch(URLs[1]).then(res=>res.json()),
                fetch(URLs[2]).then(res=>res.json()),
                fetch(URLs[3]).then(res=>res.json()),
                fetch(URLs[4]).then(res=>res.json()),
            ]
        )
    }

    async function getAllChannelDetails(foundChannels: FoundChannel[]) {
        const requestURLs = foundChannels.map(channel => getChannelEndPoint + channel.id.channelId);
        const snippets: BrandedSnippet[] = [];
        return await requestAll(requestURLs)
            .then(responses => {
                const castResse = (responses as unknown as VideoResponse[]);
                const channelReses: VideoResponse[] = [];
                for(let i = 0; i < castResse.length; i++){
                    channelReses.push(castResse[i]);
                }
                return channelReses;
        })
        .then(detailedChannels => {
            for(let i = 0; i < detailedChannels.length; i++) {
                snippets.push({...detailedChannels[i].items[0].snippet, _brand:"channel"});
            }
            return snippets;
        })
    }

    async function getAllPlaylistDetailes(foundPlaylists: FoundPlayList[]) {
        const requestURLs = foundPlaylists.map(playlist => getPlaylistEndPoint + playlist.id.playlistId);
        const snippets: BrandedSnippet[] = [];
        return await requestAll(requestURLs)
        .then(responses => {
                const castReses = (responses as unknown as VideoResponse[]);
                const videoReses: VideoResponse[] = [];
                for(let i =0; i < responses.length; i++) {
                    videoReses.push(castReses[i]);
                }
                return videoReses;
        })
        .then(detailedVideos => {
            for (let i = 0; i < detailedVideos.length; i++) {

                // TODO length check (normally items' length should be just 1)

                snippets.push({...detailedVideos[i].items[0].snippet, _brand: "playlist"});
            }
        })
        .then(() => snippets);
    };

    /** 
     * Call a Youtube API multiple times to translate the video ids to detailed information \
     * FIXME: this function currently calls the API exactly five times 
    */
    async function getAllVideoDetailes (foundVideos: FoundVideo[]) {
        const requestURLs = foundVideos.map(video => getDetailEndPoint + video.id.videoId);
        const snippets: BrandedSnippet[] = [];
        return await requestAll(requestURLs)
        .then(responses => {
                const castReses = (responses as unknown as VideoResponse[]);
                const videoReses:VideoResponse[] = [];
                for(let i =0; i < responses.length; i++) {
                    videoReses.push(castReses[i]);
                }
                return videoReses;
        })
        .then(detailedVideos => {
            for (let i = 0; i < detailedVideos.length; i++) {

                // TODO length check (normally items' length should be just 1)

                snippets.push({...detailedVideos[i].items[0].snippet,_brand: "video"});
            }
        })
        .then(() => snippets);
    };

    const [searchResult, setSearchResult] = useState<SearchResult>(); // TODO can be removed?
    const [videoResult, setVideoResult] = useState<VideoResult>();
    const [channelResult, setChannelResult] = useState<ChannelResult>();
    const [playlistResult, setPlaylistResult] = useState<PlaylistResult>();
    const [nextPageToken, setNextPageToken] = useState<string>();
    const [previousPageToken, setPreviousPageToken] = useState<string>();
    const [pageDirection,setPageDirection] = useState<PageDirection>("new");
    const [searchItem, setSearchItem] = useState<ItemType>("video");

    const getPlaylistEndPoint = `https://www.googleapis.com/youtube/v3/playlists?key=${Config.youtube.apiKey}&part=snippet&id=`
    const getDetailEndPoint = `https://www.googleapis.com/youtube/v3/videos?key=${Config.youtube.apiKey}&part=snippet&id=`;
    const getChannelEndPoint =  `https://www.googleapis.com/youtube/v3/channels?key=${Config.youtube.apiKey}&part=snippet&id=`;
    const getSearchEndPoint = `https://www.googleapis.com/youtube/v3/search?key=${Config.youtube.apiKey}&q=${props.input}&type=${searchItem}`;
    const getAnotherPageSearchEndPoint = `https://www.googleapis.com/youtube/v3/search?key=${Config.youtube.apiKey}&q=${props.input}&type=${searchItem}&pageToken=`;

    /** when it is true, http request will get quenched */
    const gateKeeper = false;

    const designateSearchItemType = (itemTypeStr: string | undefined) => {
        if (!itemTypeStr) {
            throw new Error(); // noamally cannot come here
        }
        const itemType = itemTypeStr as unknown as ItemType;
        setSearchItem(itemType);
    }
    const getVideosPrev = (e: React.FormEvent<HTMLFormElement>) => {
        setPageDirection("previous");
        getItems(e);
    }

    const getVideosNext = (e: React.FormEvent<HTMLFormElement>) => {
        setPageDirection("next");
        getItems(e);
    }

    const getNewVideos = (e: React.FormEvent<HTMLFormElement>) => {
        setPageDirection("new");
        getItems(e);
    }

    const getItems = (e: React.FormEvent<HTMLFormElement>) => { //TODO rename
        console.log(searchItem);
        e.preventDefault();
        if (gateKeeper) {
            alert("under construction");
            return; 
        } 

        const searchURL = pageDirection === "new"? getSearchEndPoint: pageDirection === "previous"? getAnotherPageSearchEndPoint + previousPageToken: getAnotherPageSearchEndPoint + nextPageToken

        fetch(searchURL)
            .then(res =>  res.json())
            .then(json => {
                console.log(json);
                const foundVideos: FoundItems =  (json as unknown as SearchResponse).items;
                const infos = (json as unknown as SearchResponse).pageInfo;

                setSearchResult(
                    {
                        "items": foundVideos,
                        "total": infos.totalResults
                    }
                )

                // TODO resolve lengthy if statements
                // TODO don't these states inadvertently remain old tokens after new search?
                // TODO judge the pageToken type (video, channel or playlist)
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
            .then(videos => getAllDetails(videos))
            .then(snippets => {

                if (snippets[0]._brand === "video") {
                    setVideoResult(
                        {
                            snippets: snippets
                        }
                    );
                    setChannelResult(undefined);
                }

                if (snippets[0]._brand === "channel") {
                    setChannelResult(
                        {
                            snippets: snippets
                        }
                    );
                    setVideoResult(undefined);
                }
            })
            .catch(error => console.error(error));
    }

    // FIXME display playlist search result
    return (
    <>
        <form onSubmit={getNewVideos} >
            <input onChange={
                e => {
                    props.setYoutubeKeyword(e.target.value);
                }
            } className="form-control"/><br/>
            <div>
                <input type="radio" name="item" value="video" id="videoRadio" onChange={e=>designateSearchItemType(e.target.value)} defaultChecked={true} /> <label htmlFor="itemRadio">video&nbsp;</label>
                <input type="radio" name="item" value="channel" id="channelRadio" onChange={e=>designateSearchItemType(e.target.value)} /> <label htmlFor="itemRadio">channel&nbsp;</label>
                <input type="radio" name="item" value="playlist" id="playlistRadio" onChange={e=>designateSearchItemType(e.target.value)} /> <label htmlFor="itemRadio">playlist&nbsp;</label>
            </div>
            <button className="btn btn-success" type="submit"> search  youtube</button>
            <div>
            {searchResult?"total videos: "+ searchResult.total:""}
            </div>
            <VideoDivision snippet={videoResult? videoResult.snippets[0] : undefined} />
            <VideoDivision snippet={videoResult? videoResult.snippets[1] : undefined} />
            <VideoDivision snippet={videoResult? videoResult.snippets[2] : undefined} />
            <VideoDivision snippet={videoResult? videoResult.snippets[3] : undefined} />
            <VideoDivision snippet={videoResult? videoResult.snippets[4] : undefined} />    

            <ChannelDivision snippet={channelResult? channelResult.snippets[0] : undefined} /> 
            <ChannelDivision snippet={channelResult? channelResult.snippets[1] : undefined} /> 
            <ChannelDivision snippet={channelResult? channelResult.snippets[2] : undefined} /> 
            <ChannelDivision snippet={channelResult? channelResult.snippets[3] : undefined} /> 
            <ChannelDivision snippet={channelResult? channelResult.snippets[4] : undefined} /> 
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