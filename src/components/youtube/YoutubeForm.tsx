import { useState } from "react"
import Config from "../../Config"
import VideoDivision from "./VideoDivision"
import ChannelDivision from "./ChannelDivision"
import PlaylistDivision from "./PlaylistDivision"

// TODO implement without thumbnail mode!

// FIXME this form erroneously shares the page token among the three search types!
// FIXME for some reason we can conduct "Search -> next -> prev -> prev(what?)-> prev -> next" and then face an error (undefined token)

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

/** object in responses from ~/video, ~/channel and ~/playlist API */
type DetailedItem = {
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
    },
    publishedAt: Date,
    thumbnails: Thumbnails,
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
    prevPageToken?: string,
    regionCode: string, // TODO more precise type?
    pageInfo: PageInfo,
    items: FoundItems
}

/** from ~/video API */
type VideoResponse = {
    kind: string,
    etag: string,
    items: DetailedItem[],
    pageInfo: PageInfo
}

type SearchResult = {
    items: FoundItems,
    total: number
}

// currently these three types for result are completely the same as each other (in the future idk)
type VideoResult = {
    snippets: Snippet[]
} & PageTokenPair;
type ChannelResult = {
    snippets: Snippet[]
} & PageTokenPair;
type PlaylistResult = {
    snippets: Snippet[]
} & PageTokenPair;

type PageTokenPair = {
    nextPageToken: string | undefined,
    prevPageToken: string | undefined
}

interface DetailedResult {
     snippets: Snippet[]
     nextPageToken: string | undefined,
     prevPageToken: string | undefined 
 }

type YoutubeProps = {
    setYoutubeKeyword: React.Dispatch<React.SetStateAction<string>>,
    input: string
}

const dummyThumbnails = [0,1,2,3,4].map(number =>  "src/assets/thumbnails/mock/"+number+".png");
const generateDummyThumbnails = (URL: string) => { //not array like (Thumbnails is a key defined by Youtube)
    return {
        default: {
            height: 200,
            url: URL,
            width: 200
        }
    } as Thumbnails;
}

const regex = /(?<=https:\/\/www.googleapis.com\/youtube\/v3\/).*\?/
const regex1 = new RegExp("/(?<=\&id\=/).*\?n/"); // to extract the id (not tested yet)
const tokenRegex = /(?<=&pageToken=).*/

const generateDummyDetail = (URL: string, index: number) => {
    const typeWithSlash = URL.match(regex); //e.g., "[video/]"
    console.log({URL:URL, index:index,typeWithSlash:typeWithSlash,content:typeWithSlash?typeWithSlash[0]:"null"})
    if (!typeWithSlash) {
        throw new Error();
    }
    const type = typeWithSlash[0].substring(0,(typeWithSlash[0].length-2)) as ItemType;
    console.log({type:type})

    if (type === "video") {
        const snippet: Snippet = {
            categoryId: "dummyCategoryId",
            channelId: "dummyChannelId",
            channelTitle: "dummyChannelId",
            customUrl: "dummyURL",
            defaultAudioLanguage: "JP",
            description: "dummy lengthy video description blah blah blah blah blah blah blah",
            localized:{
                description: "dummy lengthy video description blah blah blah blah blah blah blah",
                title: "dummyTitle"
            },
            publishedAt: new Date(),
            thumbnails: generateDummyThumbnails(dummyThumbnails[index]),
            title: "dummyTitle"
        }

        const video: DetailedItem = {
            etag: "dummyEtag",
            id: "dummyId", //TODO can be extracted from the URL
            kind: "dummyKind",
            snippet: snippet
        }

        return {
            etag: "dummyEtag",
            kind: "dummyKind",
            items: [video],
            pageInfo: {
                totalResults: 12345,
                resultsPerPage: 5
            }
        } as VideoResponse;
    }

    if (type === "channel") {
        const snippet: Snippet = {
            categoryId: "dummyCategoryId",
            channelId: "dummyChannelId",
            channelTitle: "dummyChannelId", //TODO is there?
            customUrl: "dummyURL",
            defaultAudioLanguage: "JP",
            description: "dummy lengthy video description blah blah blah blah blah blah blah",
            localized:{
                description: "dummy lengthy video description blah blah blah blah blah blah blah",
                title: "dummyTitle"
            },
            publishedAt: new Date(),
            thumbnails: generateDummyThumbnails(dummyThumbnails[index]),
            title: "dummyTitle"
        }

        const channel: DetailedItem = {
            etag: "dummyEtag",
            id: "dummyId", //TODO can be extracted from the URL
            kind: "dummyKind",
            snippet: snippet 
        } 

        return {
            etag: "dummyEtag",
            kind: "dummyKind",
            items: [channel],
            pageInfo: {
                totalResults: 12345,
                resultsPerPage: 5
            }
        } as VideoResponse;
    }

    if (type === "playlist") {
        const snippet: Snippet = {
            categoryId: "dummyCategoryId",
            channelId: "dummyChannelId",
            channelTitle: "dummyChannelId", //TODO is there?
            customUrl: "dummyURL",
            defaultAudioLanguage: "JP",
            description: "dummy lengthy video description blah blah blah blah blah blah blah",
            localized:{
                description: "dummy lengthy video description blah blah blah blah blah blah blah",
                title: "dummyTitle"
            },
            publishedAt: new Date(),
            thumbnails: generateDummyThumbnails(dummyThumbnails[index]),
            title: "dummyTitle"
        }

        const playlist: DetailedItem = {
            etag: "dummyEtag",
            id: "dummyId", //TODO can be extracted from the URL
            kind: "dummyKind",
            snippet: snippet 
        } 

        return {
            etag: "dummyEtag",
            kind: "dummyKind",
            items: [playlist],
            pageInfo: {
                totalResults: 12345,
                resultsPerPage: 5
            }
        } as VideoResponse;
    } 
    return Error("type failed to be retrieved from the URL:" + URL) ;//FIXME implement the other types!     
}

const dummyTokens = ["DUMMY1","DUMMY2","DUMMY3","DUMMY4","DUMMY5","DUMMY6","DUMMY7","DUMMY8","DUMMY9","DUMMY10"];

// FIXME very unstable yet
/** get the two dummy tokens just before and after one */
const getDummyTokenPair = (oldToken: string | undefined) => {

    if (oldToken === undefined) { // TODO to rely on explicit undefined is safe?
        return {
            nextPageToken: dummyTokens[0]
        } as PageTokenPair;
    }

    const currentIndex = dummyTokens.findIndex(token => token === oldToken);

    if (currentIndex === undefined) {
        throw new Error("invalid dummy token (if you don't have a token yet, just use undefined)");
    }

    if (currentIndex === 0) {
        return {
            nextPageToken: dummyTokens[1]
        } as PageTokenPair;
    }

    if (currentIndex === 9) {
        return {
            prevPageToken: dummyTokens[8]
        } as PageTokenPair;
    }

    return {
        nextPageToken: dummyTokens[currentIndex-1],
        prevPageToken: dummyTokens[currentIndex+1]
    } as PageTokenPair;
}

// FIXME to get tokens is unstable
/** generate a dummy search result having 5 items and token(s) */
const getDummySearchResponse = (type: ItemType, suffix: number, URL: string) => {

    let items: FoundItems;
    if (type === "video") {
        items = generateDummyIds("video",suffix).map(id => generateDummyFoundItem("video",id) as FoundVideo);
    }
    if (type === "playlist") {
        items = generateDummyIds("playlist",suffix).map(id => generateDummyFoundItem("playlist",id) as FoundPlayList);
    }
    if (type === "channel") {
        items = generateDummyIds("channel",suffix).map(id => generateDummyFoundItem("channel",id) as FoundChannel);
    }

    const wrappedToken = URL.match(tokenRegex);
    const oldToken = wrappedToken?
            wrappedToken[0]:
            undefined;

    const tokenPair = getDummyTokenPair(oldToken);
            
    return {
        kind: "mockedKind",
        etag: "mockedEtag",
        regionCode: "JP",
        pageInfo: {
            totalResults: 123456,
            resultsPerPage: 5
        },
        items: items!, // it cannot failed to be initialized, because all types are covered above
        nextPageToken: tokenPair.nextPageToken,
        prevPageToken: tokenPair.prevPageToken
    } as SearchResponse;
}

const generateDummyIds = (type: ItemType, suffix: number) => {
    const numbers = [11111,22222,33333,44444,55555];
    return numbers.map(number => number+ type + suffix);
}

const generateDummyFoundItem = (type: ItemType, id: string) => {
    if (type === "video")  {
        return {
            id: {
                kind: "mockedKind",
                videoId: id,
            },
            etag: "mockedEtag",
            title: "Dummy Video Title",
            contentDetails: {
                duration: "dummyDuration",
                aspectRation: "dummyAspect"
            }
        } as FoundVideo;
    }

    if (type === "playlist") {
        return {
            kind: "mockedKind",
            etag: "mockedEtag",
            id: {
                kind: "mockedKind",
                playlistId: id, 
            }  
        } as FoundPlayList;
    }

    if (type === "channel") {
        return  {
            kind: "mockedKind",
            etag: "mockedEtag",
            id: {
                kind: "mockedKind",
                channelId: id, 
            }  
        } as FoundChannel;
    }

    throw new Error(); // should be unreachable 
}

const YoutubeForm = (props: YoutubeProps) => {
    async function getAllDetails (foundItems: FoundItems, mocked: boolean) {
        if("playlistId" in foundItems[0].id) {
            return await getAllPlaylistDetailes(foundItems as FoundPlayList[], mocked);
        }

        if("channelId" in foundItems[0].id) {
            return await getAllChannelDetails(foundItems as FoundChannel[], mocked);
        }
    
        if("videoId" in foundItems[0].id) {
            return await getAllVideoDetailes(foundItems as FoundVideo[], mocked);
        }
        throw new Error();
    }

    async function requestAll (URLs: string[], mocked: boolean) {
        if (mocked) {
            const videos: VideoResponse[]=[];
            for (let i = 0; i < URLs.length; i++) {
                const video = generateDummyDetail(URLs[i],i); 
                    videos.push(video as VideoResponse);
            }
            return Promise.resolve(videos);
        }
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

    async function getAllChannelDetails(foundChannels: FoundChannel[], mocked: boolean) {
        const requestURLs = foundChannels.map(channel => getChannelEndPoint + channel.id.channelId);
        const snippets: BrandedSnippet[] = [];
        return await requestAll(requestURLs, mocked)
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

    async function getAllPlaylistDetailes(foundPlaylists: FoundPlayList[], mocked: boolean) {
        const requestURLs = foundPlaylists.map(playlist => getPlaylistEndPoint + playlist.id.playlistId);
        const snippets: BrandedSnippet[] = [];
        return await requestAll(requestURLs, mocked) //TODO change when mocked
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
    async function getAllVideoDetailes (foundVideos: FoundVideo[], mocked: boolean) {
        const requestURLs = foundVideos.map(video => getDetailEndPoint + video.id.videoId);
        const snippets: BrandedSnippet[] = [];
        return await requestAll(requestURLs, mocked) //TODO change when mocked
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
                console.log({detailedVideos:detailedVideos})

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
    const [lastSearchItem, setLastSearchItem] = useState<ItemType | undefined>(undefined);

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
        const tokens = getItems(e);
        setNextPageToken(tokens.nextPageToken); 
        setPreviousPageToken(tokens.prevPageToken);
    }

    const getVideosNext = (e: React.FormEvent<HTMLFormElement>) => {
        setPageDirection("next");
        const tokens = getItems(e);
        setNextPageToken(tokens.nextPageToken); 
        setPreviousPageToken(tokens.prevPageToken);
    }

    const getNewVideos = (e: React.FormEvent<HTMLFormElement>) => {
        setPageDirection("new");
        const tokens = getItems(e);
        setNextPageToken(tokens.nextPageToken); 
        setPreviousPageToken(tokens.prevPageToken);
    }

    const getItems = (e: React.FormEvent<HTMLFormElement>) => {
        console.log(searchItem);
        console.log({pageDirection:pageDirection, nextPageToken:nextPageToken,previousPageToken:previousPageToken});
        e.preventDefault();

        const tokens: PageTokenPair = {
            nextPageToken: undefined,
            prevPageToken: undefined
        };

        if (lastSearchItem && (lastSearchItem !== searchItem)) {
            // these tokens are no longer valid
            setNextPageToken(undefined);
            setPreviousPageToken(undefined);
            setPageDirection("new");
        }

        // for some reason the direction is often erroneously stated as new! therefore complecated judgement is needed...
        // FIXME detect and rectify the erroneous "new" setting 
        // FIXME the tokens are unstable when a user push the next and previous buttones incesstantly!n

        const searchURL = (/*(pageDirection === "new") &&*/ !nextPageToken && !previousPageToken)?
                getSearchEndPoint:
                pageDirection === "previous"?
                        getAnotherPageSearchEndPoint + previousPageToken:
                        getAnotherPageSearchEndPoint + nextPageToken;

        // mocking...
        const searchResultPromise: Promise<any> = gateKeeper? 
                Promise.resolve(getDummySearchResponse(searchItem, 1, searchURL)):
                fetch(searchURL).then(res=>res.json());

        searchResultPromise
            .then(json => {
                console.log(json);
                const searchResponse: SearchResponse = json as unknown as SearchResponse;
                const foundVideos: FoundItems =  searchResponse.items;
                const infos = (json as unknown as SearchResponse).pageInfo;

                setSearchResult(
                    {
                        "items": foundVideos,
                        "total": infos.totalResults
                    }
                )

                setNextPageToken(undefined);
                setPreviousPageToken(undefined);

                if (searchResponse.nextPageToken) {
                    setNextPageToken(searchResponse.nextPageToken);
                    tokens.nextPageToken = searchResponse.nextPageToken;
                }

                if (searchResponse.prevPageToken) {
                    setPreviousPageToken(searchResponse.prevPageToken);
                    tokens.prevPageToken = searchResponse.prevPageToken;
                }     

                return foundVideos;
            })
            .then(videos => getAllDetails(videos, gateKeeper))
            .then(snippets => {
                if (snippets[0]._brand === "video") { // this and following lines expect that all snippets share a brand
                    setVideoResult(
                        {
                            snippets: snippets,
                            nextPageToken: nextPageToken,
                            prevPageToken: previousPageToken
                        }
                    );
                    setChannelResult(undefined);
                    setPlaylistResult(undefined);
                }

                if (snippets[0]._brand === "playlist") {
                    setPlaylistResult(
                        {
                            snippets :snippets,
                            nextPageToken: nextPageToken,
                            prevPageToken: previousPageToken
                        }
                    );
                    setVideoResult(undefined);
                    setChannelResult(undefined);
                }

                if (snippets[0]._brand === "channel") {
                    setChannelResult(
                        {
                            snippets: snippets,
                            nextPageToken: nextPageToken,
                            prevPageToken: previousPageToken
                        }
                    );
                    setVideoResult(undefined);
                    setPlaylistResult(undefined);
                }
                setLastSearchItem(snippets[0]._brand);
                console.log({lastSearchItem: lastSearchItem, searchItem:searchItem})
            })
            .catch(error => console.error(error));
        return tokens;
    }

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

            <PlaylistDivision snippet={playlistResult? playlistResult.snippets[0] : undefined} />
            <PlaylistDivision snippet={playlistResult? playlistResult.snippets[1] : undefined} />
            <PlaylistDivision snippet={playlistResult? playlistResult.snippets[2] : undefined} />
            <PlaylistDivision snippet={playlistResult? playlistResult.snippets[3] : undefined} />
            <PlaylistDivision snippet={playlistResult? playlistResult.snippets[4] : undefined} />
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