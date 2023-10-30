import { useEffect, useState } from "react";
import './App.css';
import DatePicker from "react-datepicker";
import './react-datepicker.css';
import { start } from "repl";

/*
TODO
  ?set les ids pour chaque game
  créer les objects game et league et etc.
  Bouger les styles dans les css
  Recherche par nom
  Date Browser
  Requery les fetch pour des lives update
  #Si scheduled voir le datetime pour afficher le upcoming
  trouver les logos avec un ressource finder
  refaire les images pour quelles soit environ de la même taille
  #sort les games
  Afficher les starts times
  Recherche par méta data. (?deep search chekbox, player, coach, etc)
  faire Game Class avec metaData et timestamp
  Afficher heure en format 24h avec #le bon locale.
  Les games final mettre gris plus foncé
  Mettres du temporary html le temps que les données load
  Aller chercher toutes les données locale par un data provider (rien de local)
  Live updates (Timer sur les queries?)
  Faire un update sequence
*/

const SCHEDULE = "https://statsapi.web.nhl.com/api/v1/schedule";
const SCHEDULEATDATE = (date: string) => {return SCHEDULE+`?date=${date}`}; // Format: 2018-01-09
const LIVE = (pk: string) => {return `https://statsapi.web.nhl.com/api/v1/game/${pk}/feed/live`};

function App() {
  const emptyArray = () => { const empty: any[] = []; return empty;};
  const [games, setGames] = useState(emptyArray);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = (date?: Date) => {
    const location = date ? SCHEDULEATDATE(date.toISOString().substring(0,10)) : SCHEDULE;
    const schedule = getData(location);
    schedule.then(data => {
      data.dates[0].games.forEach((gameInfo: any) => {
        const newGame = getData(LIVE(gameInfo.gamePk));
        newGame.then(data => {
          games.push(game(data));
          games.sort((n1, n2) => {
            return n1.timestamp - n2.timestamp;
          });
          setGames([...games]);
        });
      });
    });
  }

  const [startDate, setStartDate] = useState(new Date());

  const previousDate = () => {
    changeDate(new Date(startDate.getTime() - 86400000));
  }
  const nextDate = () => {
    changeDate(new Date(startDate.getTime() + 86400000));
  }
  const changeDate = (date: Date) => {
    setStartDate(date);
    while(games.pop() ?? false);
    fetchData(date);
  }

  return (
    <div className="App"> 
      <div className="optionSegment">
        
      </div>
      <div className="optionSegment">
        <button onClick={previousDate}>{'<'}</button>
        <DatePicker selected={startDate} onChange={changeDate} />
        <button onClick={nextDate}>{'>'}</button>
      </div>
      <div>
        <ul className='list' id='gamesList' style={{height: "100%", overflowY: "scroll", backgroundColor: "greenyellow"}}>
          {games.map(item => {
            return (<li className="game">{item.content}</li>)
          })}
        </ul>
      </div>
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

  const game = new class {content: any; meta: string | undefined; timestamp: number | undefined; teams: string[] | undefined; }

  game.timestamp = getTimestamp(liveData.gameData.datetime.dateTime);

  const homeTriCode = liveData.gameData.teams.home.triCode;
  const awayTriCode = liveData.gameData.teams.away.triCode;
  const homeImgSrc = getLogo(homeTriCode);
  const awayImgSrc = getLogo(awayTriCode);
  game.teams = [liveData.gameData.teams.home.name, liveData.gameData.teams.away.name];
  //const homeTeamName = liveData.gameData.teams.home.name;
  //const awayTeamName = liveData.gameData.teams.away.name;

  const homeScore = liveData.liveData.linescore.teams.home.goals;
  const awayScore = liveData.liveData.linescore.teams.away.goals;

  const timer = game.timestamp > Date.now() ? getDateFromTimestamp(game.timestamp) : liveData.liveData.linescore.currentPeriodTimeRemaining;
  const period = game.timestamp > Date.now() ? liveData.gameData.status.detailedState : liveData.liveData.linescore.currentPeriodOrdinal ?? liveData.gameData.status.detailedState;

  game.content = (
      <div style={{backgroundColor: "darkgreen"}}>
        <div style={{display: "flex", flexFlow: "row nowrap"}}>
          <div className='center' style={{flexGrow: "1", margin: "auto"}}>
            <img src={awayImgSrc} alt={awayTriCode} style={{width: "4rem", height: "auto"}}/>
          </div>
          <div style={{display: "flex", flexFlow: "column wrap"}}>
            <div className="center" style={{height: "1rem"}}>
              {period}
            </div>
            <p style={{fontSize: "2rem", margin: "0px"}}>{awayScore} - {homeScore}</p>
            <div className="center" style={{height: "1rem"}}>
              {timer}
            </div>
          </div>
          <div className='center' style={{flexGrow: "1", margin: "auto"}}>
              <img src={homeImgSrc} alt={homeTriCode} style={{width: "4rem", height: "auto"}}/>
            </div>
        </div>
      </div>
  );

  return game;
}

function getLogo(tricode: string) {
  return `/imgs/NHLTeams/${tricode}.png`;
}

function getTimeFromString(longTime: string) {
  return new Date(getTimestamp(longTime)).toLocaleTimeString();
}

function getDateFromTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString();
}

function getTimestamp(longTime: string) {
  return Date.parse(longTime);
}

