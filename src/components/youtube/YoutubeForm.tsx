import { useState } from "react"
import Config from "../../Config"
import VideoDivision from "./VideoDivision"
import ChannelDivision from "./ChannelDivision"
import PlaylistDivision from "./PlaylistDivision"

// FIXME only video items are enjoying cache (why???)

/** video object in responses from ~/search API */
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

/** playlist object in responses from ~/search API */
type FoundPlayList = {
    kind: string,
    etag: string,
    id: {
        kind: string,
        playlistId: string
    }
}

/** channel object in responses from ~/search API */
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

/**
 * Thumbnail sets given by Youtube \
 * apparently it generally has following thumbnails: default, high, maxres, medium and standard
 */
interface Thumbnails {
    default: Thumbnail
    // the other properties are omitted 
}

/** 
 * portion to describe info about a video, channel or playlist in Youtube API responses \
 * Generally it is retrieved by designating an id, not searching Youtube with words
 */
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

/** pagenation option (new means to get fresh search result) */
type PageDirection = "previous" | "next" | "new";

/** item categories can be found by Youtube search */
type ItemType = "video" | "channel" | "playlist";

/** info contained in responses from Youtube API, which shows the number of found items */
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

/** from ~/videos, ~/channels or ~/playlists API. someday it might be diverged */
type DetailResponse = {
    kind: string,
    etag: string,
    items: DetailedItem[],
    pageInfo: PageInfo // ignored. Youtube returns this value in actuality, but in this form the requests are sent with an id then the item number is definitely 1.
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

/** 
 * Page tokens from Youtube, which represent a page in a search result \
 * Note: page numbers are obscured or not handled by Youtube, then we cannot use those.
 */
type PageTokenPair = {
    nextPageToken: string | undefined,
    prevPageToken: string | undefined
}

type YoutubeProps = {
    setYoutubeKeyword: React.Dispatch<React.SetStateAction<string>>, //TODO handle multiple keywords
    input: string
}

/**
 * Wrap a cache of a snippet to mimic Youtube response. \
 * etags and kinds are erased because cache stores don't preserve those.
 * @param cachedSnippet Snippet which was retrieved from a cache store
 * @param URL URL which expects to get a item from Youtube
 * @returns 
 */
const generateDetailResponseWithCache = (cachedSnippet: Snippet, URL: string) => {
    const item: DetailedItem = {
        kind: "erased",
        etag: "erased",
        id: URL.match(idRegex)![0], // FIXME treacherous non null declaration
        snippet: cachedSnippet
    }

    return {
        kind: "erased",
        etag: "erased",
        items: [item]
    } as DetailResponse;
}

/** path of dummy thumbnails */
const dummyThumbnails: readonly string[] = [0,1,2,3,4].map(number =>  "src/assets/thumbnails/mock/" + number + ".png");

/** wrap a path to generate a Thumbnails object which represents 200 * 200 size image */
const generateDummyThumbnails = (path: string) => { // not array like (Thumbnails is a key defined by Youtube)
    return {
        default: {
            height: 200,
            url: path,
            width: 200
        }
    } as Thumbnails;
}

/** to get a portion like "video/" from request URL */
const typeSlashRegex = /(?<=https:\/\/www.googleapis.com\/youtube\/v3\/).*\?/
const idRegex = /(?<=&id=).*/ // expecting the id to be in the end of the URL // FIXME handle the other position
const tokenRegex = /(?<=&pageToken=).*/ // expecting the token to be in the end of the URL // FIXME handle the other position

const deleteEndChara = (str: string) => {
    return str.substring(0, str.length - 2);
}

const generateDummyDetail = (URL: string, index: number) => {
    const wrappedId = URL.match(idRegex);
    if (!wrappedId) {
        throw new Error("Failure in extracting the item id from the URL"); // should accept and give a dummy id instead?
    }
    const id = wrappedId[0];

    const typeWithSlash = URL.match(typeSlashRegex); //e.g., "[video/]"
    if (!typeWithSlash) {
        throw new Error("Failure in extracting item type from the URL");
    }
    const type = deleteEndChara(typeWithSlash[0]) as ItemType;

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
        };

        const video: DetailedItem = {
            etag: "dummyEtag",
            id: id,
            kind: "dummyKind",
            snippet: snippet
        };

        return {
            etag: "dummyEtag",
            kind: "dummyKind",
            items: [video],
            pageInfo: {
                totalResults: 12345,
                resultsPerPage: 5
            }
        } as DetailResponse;
    }

    if (type === "channel") {
        const snippet: Snippet = {
            categoryId: "dummyCategoryId",
            channelId: "dummyChannelId",
            channelTitle: "dummyChannelId", //TODO is there?
            customUrl: "dummyURL",
            defaultAudioLanguage: "JP",
            description: "dummy lengthy channel description blah blah blah blah blah blah blah",
            localized:{
                description: "dummy lengthy channel description blah blah blah blah blah blah blah",
                title: "dummyTitle"
            },
            publishedAt: new Date(),
            thumbnails: generateDummyThumbnails(dummyThumbnails[index]),
            title: "dummyTitle"
        };

        const channel: DetailedItem = {
            etag: "dummyEtag",
            id: id,
            kind: "dummyKind",
            snippet: snippet 
        }; 

        return {
            etag: "dummyEtag",
            kind: "dummyKind",
            items: [channel],
            pageInfo: {
                totalResults: 12345,
                resultsPerPage: 5
            }
        } as DetailResponse;
    }

    if (type === "playlist") {
        const snippet: Snippet = {
            categoryId: "dummyCategoryId",
            channelId: "dummyChannelId",
            channelTitle: "dummyChannelId", //TODO is there?
            customUrl: "dummyURL",
            defaultAudioLanguage: "JP",
            description: "dummy lengthy playlist description blah blah blah blah blah blah blah",
            localized:{
                description: "dummy lengthy playlist description blah blah blah blah blah blah blah",
                title: "dummyTitle"
            },
            publishedAt: new Date(),
            thumbnails: generateDummyThumbnails(dummyThumbnails[index]),
            title: "dummyTitle"
        };

        const playlist: DetailedItem = {
            etag: "dummyEtag",
            id: id,
            kind: "dummyKind",
            snippet: snippet 
        }; 

        return {
            etag: "dummyEtag",
            kind: "dummyKind",
            items: [playlist],
            pageInfo: {
                totalResults: 12345,
                resultsPerPage: 5
            }
        } as DetailResponse;
    } 
    return Error("type failed to be retrieved from the URL:" + URL);     
}

const dummyTokens = ["DUMMY1","DUMMY2","DUMMY3","DUMMY4","DUMMY5","DUMMY6","DUMMY7","DUMMY8","DUMMY9","DUMMY10"];

/** get the two dummy tokens just before and after one */
const getDummyTokenPair = (oldToken: string | undefined) => {

    if (oldToken === undefined) {
        // unknown token is technically index 0, then the next one is 1, not 0
        return {
            nextPageToken: dummyTokens[1]
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
        nextPageToken: dummyTokens[currentIndex + 1],
        prevPageToken: dummyTokens[currentIndex - 1]
    } as PageTokenPair;
}

/** generate a dummy search result having 5 items and token(s) */
const getDummySearchResponse = (type: ItemType, suffix: number, URL: string) => {

    let items: FoundItems;
    if (type === "video") {
        items = generateDummyIds("video", suffix).map(id => generateDummyFoundItem("video", id) as FoundVideo);
    }
    if (type === "playlist") {
        items = generateDummyIds("playlist", suffix).map(id => generateDummyFoundItem("playlist", id) as FoundPlayList);
    }
    if (type === "channel") {
        items = generateDummyIds("channel", suffix).map(id => generateDummyFoundItem("channel", id) as FoundChannel);
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
        items: items!, // technically it cannot fail to be initialized, because all types are covered above
        nextPageToken: tokenPair.nextPageToken,
        prevPageToken: tokenPair.prevPageToken
    } as SearchResponse;
}

/** (video, 3) => [11111video3, 22222video3...] (5 length) */
const generateDummyIds = (type: ItemType, suffix: number) => {
    const numbers = [11111, 22222, 33333, 44444, 55555];
    return numbers.map(number => number + type + suffix);
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

        const cacheResult = new Map<string, Snippet | undefined>();
        // expecting the URLs share a type...
        const type = deleteEndChara(URLs[0].match(typeSlashRegex)![0]) as ItemType // FIXME treacherous non null declaration

        URLs.forEach(URL => {
            const id = URL.match(idRegex)![0]; // FIXME treacherous non null declaration
            const cache = tryToRetrieveCache(type,id);
            cacheResult.set(URL,cache);
        });

        if (mocked) {
            // currently doesn't enjoy the cache
            const videos: DetailResponse[] = [];
            for (let i = 0; i < URLs.length; i++) {
                const video = generateDummyDetail(URLs[i],i); 
                    videos.push(video as DetailResponse);
            }
            console.log(videos);
            return Promise.resolve(videos);
        }

        return await Promise.all( //FIXME handle non-fixed length! particularly 4 or less length may result in an error
            [
                // TODO low readability
                cacheResult.get(URLs[0])? Promise.resolve(generateDetailResponseWithCache(cacheResult.get(URLs[0])!,URLs[0])) : fetch(URLs[0]).then(res=>res.json()),
                cacheResult.get(URLs[1])? Promise.resolve(generateDetailResponseWithCache(cacheResult.get(URLs[1])!,URLs[1])) : fetch(URLs[1]).then(res=>res.json()),
                cacheResult.get(URLs[2])? Promise.resolve(generateDetailResponseWithCache(cacheResult.get(URLs[2])!,URLs[2])) : fetch(URLs[2]).then(res=>res.json()),
                cacheResult.get(URLs[3])? Promise.resolve(generateDetailResponseWithCache(cacheResult.get(URLs[3])!,URLs[3])) : fetch(URLs[3]).then(res=>res.json()),
                cacheResult.get(URLs[4])? Promise.resolve(generateDetailResponseWithCache(cacheResult.get(URLs[4])!,URLs[4])) : fetch(URLs[4]).then(res=>res.json()),
            ]
        )
    }

    // TODO consolidate the three getAllXXXDetails functions if possible
    async function getAllChannelDetails(foundChannels: FoundChannel[], mocked: boolean) {
        const requestURLs = foundChannels.map(channel => getChannelEndPoint + channel.id.channelId);
        const snippets: BrandedSnippet[] = [];
        return await requestAll(requestURLs, mocked)
            .then(responses => {
                const castResse = (responses as unknown as DetailResponse[]);
                const channelReses: DetailResponse[] = [];
                for(let i = 0; i < castResse.length; i++){
                    channelReses.push(castResse[i]);
                }
                return channelReses;
            })
            .then(detailedChannels => {
                for(let i = 0; i < detailedChannels.length; i++) {
                    snippets.push({...detailedChannels[i].items[0].snippet, _brand: "channel"});
                }
                return snippets;
            })
    }

    async function getAllPlaylistDetailes(foundPlaylists: FoundPlayList[], mocked: boolean) {
        const requestURLs = foundPlaylists.map(playlist => getPlaylistEndPoint + playlist.id.playlistId);
        const snippets: BrandedSnippet[] = [];
        return await requestAll(requestURLs, mocked) //TODO change when mocked
            .then(responses => {
                    const castReses = (responses as unknown as DetailResponse[]);
                    const playlistReses: DetailResponse[] = [];
                    for(let i = 0; i < responses.length; i++) {
                        playlistReses.push(castReses[i]);
                    }
                    return playlistReses;
            })
            .then(detailedPlaylists => {
                for (let i = 0; i < detailedPlaylists.length; i++) {

                    // TODO length check (normally items' length should be just 1)

                    snippets.push({...detailedPlaylists[i].items[0].snippet, _brand: "playlist"});
                }
            })
            .then(() => snippets);
    };

    /** 
     * Call a Youtube API multiple times to translate the video ids to detailed information \
     * FIXME: this function currently calls the API exactly five times 
    */
    async function getAllVideoDetailes (foundVideos: FoundVideo[], mocked: boolean) {
        const requestURLs = foundVideos.map(video => getVideoEndPoint + video.id.videoId);
        const snippets: BrandedSnippet[] = [];
        return await requestAll(requestURLs, mocked) //TODO change when mocked
            .then(responses => {
                console.log({responses:responses});
                    const castReses = (responses as unknown as DetailResponse[]);
                    const videoReses: DetailResponse[] = [];
                    for (let i = 0; i < responses.length; i++) {
                        videoReses.push(castReses[i]);
                    }
                    return videoReses;
            })
            .then(detailedVideos => {
                const buffer: DetailedItem[] = [];
                for (let i = 0; i < detailedVideos.length; i++) {

                    // TODO length check (normally items' length should be just 1)

                    snippets.push({...detailedVideos[i].items[0].snippet,_brand: "video"});
                    buffer.push(detailedVideos[i].items[0]);
                }
                cacheSnippets("video",buffer);
            })
            .then(() => snippets);
    };

    const [searchResult, setSearchResult] = useState<SearchResult>(); // TODO can be removed?
    const [videoResult, setVideoResult] = useState<VideoResult>();
    const [channelResult, setChannelResult] = useState<ChannelResult>();
    const [playlistResult, setPlaylistResult] = useState<PlaylistResult>();
    const [nextPageToken, setNextPageToken] = useState<string>();
    const [previousPageToken, setPreviousPageToken] = useState<string>();
    const [searchItem, setSearchItem] = useState<ItemType>("video");
    const [lastSearchItem, setLastSearchItem] = useState<ItemType | undefined>(undefined);
    const [videoSnippetCaches, setVideoSnippetCaches] = useState<Map<string,Snippet>>(new Map<string,Snippet>());
    const [channelSnippetCaches, setChannelSnippetCaches] = useState<Map<string,Snippet>>(new Map<string,Snippet>());
    const [playlistSnippetCaches, setPlaylistSnippetCaches] = useState<Map<string,Snippet>>(new Map<string,Snippet>());

    const getPlaylistEndPoint = `https://www.googleapis.com/youtube/v3/playlists?key=${Config.youtube.apiKey}&part=snippet&id=`
    const getVideoEndPoint = `https://www.googleapis.com/youtube/v3/videos?key=${Config.youtube.apiKey}&part=snippet&id=`;
    const getChannelEndPoint =  `https://www.googleapis.com/youtube/v3/channels?key=${Config.youtube.apiKey}&part=snippet&id=`;
    const getSearchEndPoint = `https://www.googleapis.com/youtube/v3/search?key=${Config.youtube.apiKey}&q=${props.input}&type=${searchItem}`;
    const getAnotherPageSearchEndPoint = `https://www.googleapis.com/youtube/v3/search?key=${Config.youtube.apiKey}&q=${props.input}&type=${searchItem}&pageToken=`;

    const tryToRetrieveCache = (type: ItemType, id: string) => {        
        return getStore(type).get(id);
    }

    /**
     * Save Snippet(s) in the DetailedItem(s) into a cache store. The snippets can be retrieved with Youtube's id \
     * Note: the cashes won't get available without re-rendering
     * @param type video, channel or playlist
     * @param items information given by a Youtube API, like ~/videos
     */
    const cacheSnippets = (type: ItemType, items: DetailedItem[]) => { //FIXME function and the second variable name
        const store = new Map(getStore(type)); // react seems to need to another Map instance to know the update
        items.forEach(detail => store.set(detail.id,detail.snippet));

        console.log("caching...")
        console.log(store);
        
        if (type === "video") {
            setVideoSnippetCaches(store);
            return;
        }
        if (type === "channel") {
            setChannelSnippetCaches(store);
            return;
        }
        if (type === "playlist") {
            setPlaylistSnippetCaches(store);
            return;
        }
        throw new Error("failure itemType judging in caching");
    }

    const getStore = (type: string) => {
        return (type === "video")?
                videoSnippetCaches:
                (type === "channel")?
                        channelSnippetCaches:
                        playlistSnippetCaches;
    }

    /** when it is true, http request will get quenched */
    const gateKeeper = false;

    const designateSearchItemType = (itemTypeStr: string | undefined) => {
        if (!itemTypeStr) {
            throw new Error(); // noamally cannot come here
        }
        const itemType = itemTypeStr as unknown as ItemType;
        setSearchItem(itemType);
    }

    //TODO rectify the names of three functions just after next commit
    const getVideosPrev = (e: React.FormEvent<HTMLFormElement>) => {
        const tokens = getItems(e,"previous");
        setNextPageToken(tokens.nextPageToken); 
        setPreviousPageToken(tokens.prevPageToken);
    }

    const getVideosNext = (e: React.FormEvent<HTMLFormElement>) => {
        const tokens = getItems(e,"next");
        setNextPageToken(tokens.nextPageToken); 
        setPreviousPageToken(tokens.prevPageToken);
    }

    const getNewVideos = (e: React.FormEvent<HTMLFormElement>) => {
        const tokens = getItems(e,"new");
        setNextPageToken(tokens.nextPageToken); 
        setPreviousPageToken(tokens.prevPageToken);
    }

    const getItems = (e: React.FormEvent<HTMLFormElement>, direction: PageDirection) => { 
        e.preventDefault();

        const tokens: PageTokenPair = {
            nextPageToken: undefined,
            prevPageToken: undefined
        };

        if (lastSearchItem && (lastSearchItem !== searchItem)) {
            // these tokens are no longer valid
            setNextPageToken(undefined); // FIXME treacherous
            setPreviousPageToken(undefined); // FIXME treacherous
            direction = "new";
        }

        const searchURL = (direction === "new")?
                getSearchEndPoint:
                (direction === "previous")?
                        getAnotherPageSearchEndPoint + previousPageToken:
                        getAnotherPageSearchEndPoint + nextPageToken;

        const searchResultPromise: Promise<any> = gateKeeper? 
                Promise.resolve(getDummySearchResponse(searchItem, 1, searchURL)): // mock
                fetch(searchURL).then(res=>res.json()); // real

        searchResultPromise
            .then(json => {
                const searchResponse: SearchResponse = json as unknown as SearchResponse;
                const foundItems: FoundItems =  searchResponse.items;
                const infos = (json as unknown as SearchResponse).pageInfo;

                setSearchResult(
                    {
                        "items": foundItems,
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

                return foundItems;
            })
            .then(items => getAllDetails(items, gateKeeper))
            .then(snippets => {
                if (snippets[0]._brand === "video") { // this lines and following ones expect that all snippets share a brand
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
                console.log({snippets:snippets})
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