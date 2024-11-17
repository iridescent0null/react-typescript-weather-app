import { useState } from "react"
import Title from "./components/Title"
import Form from "./components/Form"
import NicoForm from "./components/niconico/NicoForm" 
import Results from "./components/Results"
import { ResultProps } from "./components/Results"
import Loading from "./components/Loading"
import YoutubeForm, { YoutubeProps } from "./components/youtube/YoutubeForm"
import Config from "./Config" // This guy's source code should not be commited! 
import SandBoxForm from "./components/sandbox/SandBoxForm"
import { UndefiableDate } from "./components/sandbox/SandBoxForm"

const App = () => {

  // Weather Part
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");
  const weatherApiEndPoint = `https://api.weatherapi.com/v1/current.json?key=${Config.weather.apiKey}&aqi=no&q=${city}`;
  const [testData, setTestData] = useState("");
  const [results, setResults] = useState<ResultProps>({
    results:{
    country: "",
    cityName: "",
    temperature: "",
    conditionText: "",
    icon: ""
    }
  });

  const getWeather = (e: React.FormEvent<HTMLFormElement>) => { 
    e.preventDefault();
    setLoading(true);
    
    fetch(weatherApiEndPoint)
    .then(res => res.json())
    .then(json => {
      setResults({
        results:{
        country: json.location.country,
        cityName: json.location.name,
        temperature: json.current.temp_c,
        conditionText: json.current.condition.text,
        icon: json.current.condition.icon
        }
      });
      setCity("");
    })
    .catch(error => {console.warn(error);
      alert("request for wether information failed");
    })
    .finally(() => setLoading(false));    
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
    .catch(error => console.warn(error))
    .then(() => alert("request for wether information failed"));
  }

  // Youtube Part
  const [youtubeProps, setYoutubeProps] = useState<YoutubeProps>(); //? why we can achieve the search task without the setter?

  // SandBox Part
  const [birthDate, setBirthDate] = useState<UndefiableDate>();

  return (
    <div className ="centered">
      <div className="form-wrapper">
        <Title />
        <Form setCity={setCity} getWeather={getWeather} testData={testData} city={city}/>
        {loading?  <Loading/>: <Results results={results.results}/>}
      </div>
      <div className="form-wrapper">
        <div>Sadly the nico APIs are not working...</div>
        <NicoForm testData=""  keywords={keywords} setKeywords={setKeywords} findMovie={findMovie}/>
      </div>
      <div className="form-wrapper">
        <YoutubeForm input={youtubeProps?youtubeProps.input:""} />
      </div>
      <div className="form-wrapper">
        <SandBoxForm birthDate={birthDate} age={null} setBirthDate={setBirthDate}/>        
      </div>
    </div>
  )
}

 export default App