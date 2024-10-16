// abandoned because of the instability of the niconico APIs after the cyber attack at the 2024 summer 

type FormProps = {
    setKeywords: React.Dispatch<React.SetStateAction<string[]>>,
    findMovie: (e: React.FormEvent<HTMLFormElement>) => void,
    testData: string,
    keywords: string[];
};

const array = [""];

const NicoForm = (props :FormProps) => {
return ( //TODO change the Lamda expression to one which accepts the event and form the keywords input into a valid parameter 
    <div>
    <h3>Nico Video Search</h3>
    <form onSubmit={props.findMovie}>
        <input type="text" name="keywordsText" onChange={() => props.setKeywords (array) }/> 
        <button type="submit" disabled>nico!</button>
        {props.testData}
    </form>
    </div>
)
};

export default NicoForm