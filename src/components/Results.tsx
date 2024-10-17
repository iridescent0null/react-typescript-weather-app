export type ResultProps = {
    results: {
        country: string;
        cityName: string;
        temperature: string;
        conditionText: string;
        icon: string;
    }
}

const Results = (props: ResultProps) => {
    return (
        <>
                {props.results.country && 
                <div>
                    <div>{props.results.country}</div>
                    <div>{props.results.cityName}</div>
                    <div>{props.results.temperature} °C</div>
                    <div>
                        <img src= {props.results.icon} />
                    </div>
                    <div>{props.results.conditionText}</div>
                </div>
                }
        </>
    );
};

export default Results