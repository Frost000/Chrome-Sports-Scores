import { useEffect, useState } from "react";
import './App.css';

/*
TODO
  set les ids pour chaque game
  créer les objects game et league et etc.
  Bouger les styles dans les css
  Recherche par nom
  Date Browser
*/

const SCHEDULE = "https://statsapi.web.nhl.com/api/v1/schedule";


//function App(game2: any[]) {
function App() {
  const schedule = getData(SCHEDULE);
  schedule.then(data => data.dates[0].games.forEach((game: any) => {
    const gamePk = game.gamePk;
    //document.getElementById("gamesList")?.innerHTML.
    //games.push(gamePk);
    setGames([...games, gamePk]);
    })
  );
  //let games2: any[] = [];

    /*
  console.log(games2);
  console.log(games2.length)
  const listItems = games2.map((gamePk: any) => {
    console.log(gamePk);

    return (
      <li key={gamePk}>{game(gamePk)}</li>
      )
    }
  );
  console.log(listItems);
*/
  let empty: any[] = [];
  const [games, setGames] = useState(empty);

  return (
    <div className="App">
      <ul id='gamesList' style={{height: "100%", overflowY: "scroll", backgroundColor: "greenyellow"}}>
        {games.map(item => <li>{game(item)}</li>)}
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

function game(extra: any) {
  return (
      <div style={{backgroundColor: "darkgreen"}}>
        <div style={{display: "flex", flexFlow: "row nowrap"}}>
          <div className='center' style={{flexGrow: "1", margin: "auto"}}>
            <img src="..\imgs\montreal-canadiens-logo.png" alt="Temp" style={{height: "4rem", width: "auto"}}/>
          </div>
          <div style={{display: "flex", flexFlow: "column wrap"}}>
            <div className="center" style={{height: "1rem"}}>
              {extra} {/*10:00*/}
            </div>
            <p style={{fontSize: "2rem", margin: "0px"}}>1 - 0</p>
            <div className="center" style={{height: "1rem"}}>
              2ième
            </div>
          </div>
          <div className='center' style={{flexGrow: "1", margin: "auto"}}>
              <img src="..\imgs\quebec-nordiques-logo.png" alt="Temp" style={{height: "4rem", width: "auto"}}/>
            </div>
        </div>
      </div>
  );
}

