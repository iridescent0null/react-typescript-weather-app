import { useState } from "react"
import Title from "./components/Title"
import Form from "./components/Form"
import NicoForm from "./components/niconico/NicoForm" 
import Results from "./components/Results"
import Config from "./Config" // This guy's source code should not be commited! 

type ResultsState = {
  country: string;
  cityName: string;
  temperature: string;
  conditionText: string;
  icon: string;
};

const App = () => {
  // Weather Part
  const [city, setCity] = useState<string>("");
  const weatherApiEndPoint = `https://api.weatherapi.com/v1/current.json?key=${Config.weather.apiKey}&aqi=no&q=${city}`;
  const [testData, setTestData] = useState<string>("");
  const [results, setResults] = useState<ResultsState>({
    country: "",
    cityName: "",
    temperature: "",
    conditionText: "",
    icon: ""
  });

  const getWeather = (e: React.FormEvent<HTMLFormElement>) => { 
    e.preventDefault();
    console.log(weatherApiEndPoint);
    fetch(weatherApiEndPoint)
    .then(res => res.json())
    .then(json => {
      setResults({
        country: json.location.country,
        cityName: json.location.name,
        temperature: json.current.temp_c,
        conditionText: json.current.condition.text,
        icon: json.current.condition.icon
      });
    })
    .catch(error => console.warn(error));
  }

  // Niconico Part (currently disabled)
  const [keywords, setKeywords] = useState<string[]>([]);
  const nicoAPIEndopoint = `https://api.search.nicovideo.jp/api/v2/video/contents/search?target=title&q=${keywords[0]}`; //TODO use the other keywords

  const findMovie = (e: React.FormEvent<HTMLFormElement>) => { // corrently doesn't work (then the button is disabled)
    e.preventDefault();
    console.log(nicoAPIEndopoint);
    fetch(nicoAPIEndopoint)
    .then(res => res.json())
    .then(json => setTestData(json))
    .catch(error => console.warn(error));
  }

  return (
    <div className ="centered">
      <div>
      <Title />
      <Form setCity={setCity} getWeather={getWeather} testData={testData}/>
      <Results results={results}/>
      </div>
      <p>
      <div>Sadly the nico APIs are not working...</div>
      <NicoForm testData=""  keywords={keywords} setKeywords={setKeywords} findMovie={findMovie}/>
      </p>
    </div>
  )
}

 export default App