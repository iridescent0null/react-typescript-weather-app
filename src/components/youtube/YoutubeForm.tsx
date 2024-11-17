import { useState } from "react"
// import { PlayerState } from "youtube" // for some reason such import is not needed and can't be done (error)
import Config from "../../Config"

type Video = { //TODO not exact yet
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

type SearchResponse = {
    kind: string,
    etag: string,
    netxPageToken?: string,
    regionCode: string, // TODO more precise type?
    pageInfo: {
        totalResults: number,//number of the videos
        resultsPerPage: number
    },
    items: Video[]
}

type Result = {
    videos: readonly Video[],
    total: number
}

type YoutubeProps = {

}

const YoutubeForm = (props: YoutubeProps) => {

    const [result, setResult] = useState<Result>();

    // dummy id and search keyword for dev 
    const randomIdInTHeGooglesExpamle = "7lCDEYXw3mM"; //FIXME remove
    const randomSearchKeyword = "テイエムオペラオー"; //FIXME remove

    const apiEndPoint = `https://www.googleapis.com/youtube/v3/videos?key=${Config.youtube.apiKey}&query=${randomSearchKeyword}&id=${randomIdInTHeGooglesExpamle}`;
    const getSearchEndPoint = `https://www.googleapis.com/youtube/v3/search?key=${Config.youtube.apiKey}&q=${randomSearchKeyword}`;

    /**
     * when it is true, http request will get quenched 
     */
    const gateKeeper = false;

    const keyword = randomSearchKeyword; // FIXME use the user input 

    const getMovies = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        if (gateKeeper) {
            alert("under construction");
            return; 
        } 
        fetch(getSearchEndPoint)
            .then(res =>  res.json())
            .then(json => {
                console.log(json);
                const foundVideos: readonly Video[] =  (json as unknown as SearchResponse).items;
                const infos = (json as unknown as SearchResponse).pageInfo;
                setResult(
                    {
                        "videos": foundVideos,
                        "total": infos.totalResults
                    }
                )
            })
            .catch(error => console.error(error));

            return;// FIXME remove me to implement the following request

        fetch(apiEndPoint)
                .then(res => res.json)
                .then(json => {
                    const foundVideos: readonly Video[] =  (json as unknown as SearchResponse).items; // TODO looks a little s__tty
                    const infos = (json as unknown as SearchResponse).pageInfo;

                    setResult(
                        {
                            "videos": foundVideos,
                            "total": infos.totalResults
                        }

                    )
                }
                )
                .catch(error => {
                    console.warn(error);
                    alert("failed");
                })
                .finally();
    }

    // TODO very lousy HTML only to check the behavior of Youtube APIs
    return (
    <>
        <form onSubmit={getMovies} >
            <input/><br/>
            <button type="submit"> search  youtube</button>
            <ul>
                <li>{result?"video id: "+ result.videos[0].id.videoId:""}</li>
                <li>{result?"video id: "+ result.videos[1].id.videoId:""}</li>
                <li>{result?"video id: "+ result.videos[2].id.videoId:""}</li>
                <li>{result?"video id: "+ result.videos[3].id.videoId:""}</li>
                <li>{result?"video id: "+ result.videos[4].id.videoId:""}</li>
            </ul>
            <div>
            {result?"total videos: "+ result.total:""}
            </div>
        </form>
    </>
    );
};

export default YoutubeForm;

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