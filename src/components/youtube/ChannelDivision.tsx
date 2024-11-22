import { Snippet } from "./YoutubeForm"
import { formPrettyDate } from "../sandbox/SandBoxForm";

type ChannelDivisionProps = {
    snippet: Snippet | undefined
}

const ChannelDivision = (props: ChannelDivisionProps) => {
    console.log(props);
    const snippet = props.snippet;
        if (!snippet) {
            return (<span></span>);
        }
    return (
        <div className="container channel-container">
            <div>
            <div className="row">
            <img className="col-4" src={snippet.thumbnails.default? snippet.thumbnails.default.url:""}/>
            <div className="col-8 video-detail">
                <div className="custom url"><strong> {snippet.customUrl} </strong></div>
                <div className="title">title: {snippet.title}</div>
                <div className="description">description: {snippet.description}</div>
                <div className="publishedAt">publish: {formPrettyDate(new Date(snippet.publishedAt))}</div>
            </div>
        </div>
            </div>
        </div>
    );
}

export default ChannelDivision;