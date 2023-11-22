import { useEffect, useState } from "react";
import './App.css';
import DatePicker from "react-datepicker";
import './react-datepicker.css';

/*
TODO
  Fix display offset when using calendar

  ?set les ids pour chaque game
  créer les objects game et league et etc.
  Bouger les styles dans les css, changer les noms des class (surtout game)
  Recherche par nom
  #Date Browser
  Requery les fetch pour des lives update (juste si la game est live)
  #Si scheduled voir le datetime pour afficher le upcoming
  trouver les logos avec un ressource finder
  refaire les images pour quelles soit environ de la même taille
  #sort les games
  #Afficher les starts times
  Recherche par méta data. (?deep search chekbox, player, coach, etc)
  #faire Game Class avec metaData et timestamp
  #Afficher heure en format 24h avec #le bon locale.
  Les games final mettre gris plus foncé
  #Mettres du temporary html le temps que les données load
  Aller chercher toutes les données locale par un data provider (rien de local)
  Live updates (Timer sur les queries?) (juste si les games sont live)
  Faire un update sequence
  Faire que le calendar puisse être plus grand que l'app
  Afficher des messages différents pour pas de game, pas de mathc auj, erreur de fetch, pas de resultats recherche, etc
*/

const SCHEDULE = "https://statsapi.web.nhl.com/api/v1/schedule";
const SCHEDULEATDATE = (date: string) => {return SCHEDULE+`?date=${date}`}; // Format: 2018-01-09
const LIVE = (pk: string) => {return `https://statsapi.web.nhl.com/api/v1/game/${pk}/feed/live`};

function App() {
  const emptyArray = () => { const empty: any[] = []; return empty;};
  const [games, setGames] = useState(emptyArray);

  useEffect(() => {
    fetchData(new Date());
  }, []);

  const fetchData = (date: Date) => {
    const schedule = getData(SCHEDULEATDATE(date.toISOString().substring(0,10)));
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

  const buildList = ():any[] => {
    if(games.length < 1){
      const message = new class {content: any};
      message.content = (<div className="center" style={{height: "2rem", color: "black", display: "flex", flexFlow: "column nowrap", backgroundColor: "yellowgreen"}}><div>No games to show</div></div>);
      const temp:any[] = [message];
      return temp;
    }

    return games;
  }

  return (
    <div className="App"> 
      <div className="optionSegment">
        
      </div>
      <div className="optionSegment" style={{display: "flex", flexFlow: "row nowrap"}}>
        <button onClick={previousDate} style={{width: "auto", height: "auto", margin: "auto"}}>{'<'}</button>
        <DatePicker selected={startDate} onChange={changeDate}/>
        <button onClick={nextDate} style={{width: "auto", height: "auto", margin: "auto"}}>{'>'}</button>
      </div>
      <div>
        <ul className='list' id='gamesList' style={{height: "100%", overflowY: "scroll", backgroundColor: "greenyellow"}}>
          {buildList().map(item => {
            return (<li className={item.timestamp ?? false ? "game" : ""}>{item.content}</li>)
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

