import { Snippet } from "./YoutubeForm";
import { formPrettyDate } from "../sandbox/SandBoxForm";

type VideoDivisionProps = {
    snippet: Snippet | undefined; // TODO doesn't just "snippet?:" work out?
}
 
const VideoDivision = (props: VideoDivisionProps) => {
    const snippet = props.snippet;

    if (!snippet) {
        return (<span></span>); // TODO is changing the type of HTML element OK?
    }

    return (
    <div className="container video-container" >
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

export default VideoDivision;