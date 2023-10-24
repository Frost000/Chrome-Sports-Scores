import { useEffect, useState } from "react";
import './App.css';

/*
TODO
  set les ids pour chaque game
  créer les objects game et league et etc.
  Bouger les styles dans les css
  Recherche par nom
  Date Browser
  Requery les fetch pour des lives update
  Si scheduled voir le datetime pour afficher le upcoming
*/

const SCHEDULE = "https://statsapi.web.nhl.com/api/v1/schedule";
const LIVE = (pk: string) => {return `https://statsapi.web.nhl.com/api/v1/game/${pk}/feed/live`}

function App() {
  let empty: any[] = [];
  const [games, setGames] = useState(empty);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const schedule = getData(SCHEDULE);
    schedule.then(data => {
      const tempGames: any[] = [];
      data.dates[0].games.forEach((gameInfo: any) => {
        const newGame = getData(LIVE(gameInfo.gamePk));
        newGame.then(data => {
          setGames([...games, game(data)]);
        });
      });
    });
  }

  return (
    <div className="App">
      <ul className='list' id='gamesList' style={{height: "100%", overflowY: "scroll", backgroundColor: "greenyellow"}}>
        {games.map(item => <li>{item}</li>)}
      </ul>
    </div>
  );
}
export default App;

async function getData(source: String) {
  const url: any = source;
  const data = fetch(url).then(response => response.json());

  return data;
}

function game(liveData: any) {
  if(liveData.copyright == undefined) { return <></>; }

  const homeTriCode = liveData.gameData.teams.home.triCode;
  const awayTriCode = liveData.gameData.teams.away.triCode;
  const homeImgSrc = getLogo(homeTriCode);
  const awayImgSrc = getLogo(awayTriCode);
  const homeTeamName = liveData.gameData.teams.home.name;
  const awayTeamName = liveData.gameData.teams.away.name;

  console.log(homeImgSrc);

  const homeScore = liveData.liveData.linescore.teams.home.goals;
  const awayScore = liveData.liveData.linescore.teams.away.goals;

  const timer = liveData.liveData.linescore.currentPeriodTimeRemaining;
  const period = liveData.liveData.linescore.currentPeriodOrdinal;
  return (
      <div style={{backgroundColor: "darkgreen"}}>
        <div style={{display: "flex", flexFlow: "row nowrap"}}>
          <div className='center' style={{flexGrow: "1", margin: "auto"}}>
            <img src={awayImgSrc} alt={awayTriCode} style={{width: "5rem", height: "auto"}}/>
          </div>
          <div style={{display: "flex", flexFlow: "column wrap"}}>
            <div className="center" style={{height: "1rem"}}>
              {timer}
            </div>
            <p style={{fontSize: "2rem", margin: "0px"}}>{awayScore} - {homeScore}</p>
            <div className="center" style={{height: "1rem"}}>
              {period}
            </div>
          </div>
          <div className='center' style={{flexGrow: "1", margin: "auto"}}>
              <img src={homeImgSrc} alt={homeTriCode} style={{height: "4rem", width: "auto"}}/>
            </div>
        </div>
      </div>
  );
}

function getLogo(tricode: string) {
  return `/imgs/NHLTeams/${tricode}.png`;
}



