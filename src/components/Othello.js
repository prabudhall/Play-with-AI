import { useState } from 'react';
import styles from '../css/Othello.module.css';
import { useNavigate } from 'react-router-dom';

const players = ['B', 'W'];
    let counts=[2,2], available=[],currentPlayer=0,board;
    const human = [true, false];
    let levelAI = [6, 6];

const Othello = () => {
    const reactNavigator = useNavigate();
    // let [p1] = useState('W');
    // let [p2] = useState('B');
    // let [currentPlayer, setCurrentPlayer] = useState(p1);
    
    const [board, setBoard] = useState([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', 'A', 'A', 'A', 'A', '', ''],
        ['', '', 'A', 'W', 'B', 'A', '', ''],
        ['', '', 'A', 'B', 'W', 'A', '', ''],
        ['', '', 'A', 'A', 'A', 'A', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
    ]);
    //Ai is white
    
    for (let j = 0; j < 8; j++) {
        for (let i = 0; i < 8; i++) {
          if (board[i][j] == 'A') {
            available.push([i, j]);
          }
        }
      }

    function resetBoard() {
        window.location.reload()
    }
    function leaveRoom() {
        reactNavigator('/');
    }
    function boardAt(i, j) {
        if ((i >= 0) && (i < 8) && (j >= 0) && (j < 8)) {
          return board[i][j];
        }
        return null;
      }
      function reversePawn(i, j, player) {
        // const newBoard = [...board];
        board[i][j] = players[player];
        // setBoard(newBoard);
        counts[player]++;
        counts[player ^ 1]--;
      }
      function addPawn(i, j, player) {
        // const newBoard = [...board];
        board[i][j] = players[player];
        // setBoard(newBoard);
        // console.log("moved:", board
        counts[player]++;
        for (let dj = -1; dj <= 1; dj++) {
          let j2 = j + dj;
          for (let di = -1; di <= 1; di++) {
            if (di || dj) {
              let i2 = i + di;
              if (boardAt(i2, j2) === '') {
                available.push([i2, j2]);
                // const newBoard = [...board];
                board[i2][j2] = 'A';
                // setBoard(newBoard);
              }
            }
          }
        }
      }
    function isAvailablePlayer(i, j, player) {
        let otherPlayer = players[player ^ 1];
        player = players[player];
        for (let dj = -1; dj <= 1; dj++) {
          for (let di = -1; di <= 1; di++) {
            if (di || dj) {
              let k = 1;
              while (boardAt(i + di * k, j + dj * k) == otherPlayer) {
                k++;
              }
              if ((k > 1) && (boardAt(i + di * k, j + dj * k) == player)) {
                return true;
              }
            }
          }
        }
        return false;
      }
    function hasAvailablePlayer(player) {
        for (let spot of available) {
          if (isAvailablePlayer(spot[0], spot[1], player)) {
            return true;
          }
        }
        return false;
      }

    function nextTurn() {
        console.log("entered next");
        let notAvailable = false;
        if (hasAvailablePlayer(currentPlayer)) {
          if (human[currentPlayer]) {
            console.log("human")
            return null;
        }
        console.log("not human")
          available.sort(() => Math.random() - 0.5);
          const oldBoard=[...board]
          console.log(oldBoard);
          let index = alphabetaAI(currentPlayer, levelAI[currentPlayer], -Infinity, Infinity, false);
          setBoard(oldBoard)
          let spot = available.splice(index, 1)[0];
          let i = spot[0];
          let j = spot[1];
          console.log("callint play at from nxt turn");
          playAt(i, j, currentPlayer);
          console.log("came out")
        //   currentPlayer = currentPlayer ^ 1;
        } else {
          notAvailable = true;
        }
        currentPlayer = currentPlayer ^ 1;
        let result = checkWinner();
        console.log("resis",result)
        if (result !== null) {
            console.log("resis if not null",result)
            return;
        } else {
        //   currentPlayer = currentPlayer ^ 1;
          console.log("nxt:",currentPlayer);
          if (!human[currentPlayer] || !hasAvailablePlayer(currentPlayer)) {
            setTimeout(nextTurn, 500);
          }
        }
      }
      
      function alphabetaAI(player, level, alpha, beta, next) {
        if ((available.length == 0) || (!hasAvailablePlayer(0) && !hasAvailablePlayer(1))) {
          if (counts[player] > counts[player ^ 1]) {
            return 1000000 + counts[player];
          } else if (counts[player ^ 1] > counts[player]) {
            return -1000000 - counts[player ^ 1];
          } else {
            return 0;
          }
        } else if (level == 0) {
          return evaluateBoard(player);
        }
      
        let compare, cut, alphabeta;
        let minmax;
        let index = -1;
        if (player == currentPlayer) {
          compare = (a, b) => (a > b);
          cut = (v) => v >= beta;
          alphabeta = (v) => alpha = Math.max(alpha, v);
          minmax = -Infinity;
        } else {
          compare = (a, b) => (a < b);
          cut = (v) => alpha >= v;
          alphabeta = (v) => beta = Math.min(beta, v);
          minmax = Infinity;
        }
      
        let saveAvailable = [...available];
        // let saveBoard = board.map(row => row.slice(0)); // Deep copy
        const saveBoard = [...board]; // Deep copy
        let saveCounts = [...counts];
      
        for (let spotIndex = 0; spotIndex < saveAvailable.length; spotIndex++) {
          let spot = saveAvailable[spotIndex];
          let i = spot[0];
          let j = spot[1];
          if (isAvailablePlayer(i, j, player)) {
            available.splice(spotIndex, 1);
            playAt(i, j, player);
            let score = alphabetaAI(player ^ 1, level - 1, alpha, beta, true);
            if (compare(score, minmax)) {
              minmax = score;
              index = spotIndex;
            }
            available = [...saveAvailable];
            setBoard(saveBoard) //restore
            console.log("restore", board)
            // board = saveBoard.map(row => row.slice(0)); // Deep restore
            counts = [...saveCounts];
            if (cut(score)) {
              break;
            }
            alphabeta(score);
          }
        }
        if (next) {
          if (index >= 0) {
            return minmax;
          } else {
            return alphabetaAI(player ^ 1, level - 1, alpha, beta, true);
          }
        }
        return index;
      }

      function checkWinner() {
          if ((available.length == 0) || (!hasAvailablePlayer(0) && !hasAvailablePlayer(1))) {
              console.log("count of B:",counts[0]);
              console.log("count of W:",counts[1]);
          if (counts[0] > counts[1]) {
            return 'B';
          } else if (counts[1] > counts[0]) {
            return 'W';
          } else {
            return -1;
          }
        }
        return null;
      }
      function countAvailablePlayer(player) {
        let count = 0;
        for (let spot of available) {
          if (isAvailablePlayer(spot[0], spot[1], player)) {
            count++;
          }
        }
        return count;
      }

      function playAt(i, j, player) {
        //   console.log("play_at")
        console.log("player at playat",player)
        addPawn(i, j, player);
        let otherPlayer = players[player ^ 1];
        for (let dj = -1; dj <= 1; dj++) {
          for (let di = -1; di <= 1; di++) {
            if (di || dj) {
              let k = 1;
              while (boardAt(i + di * k, j + dj * k) == otherPlayer) {
                k++;
              }
              if ((k > 1) && (boardAt(i + di * k, j + dj * k) == players[player])) {
                while (k > 1) {
                  k--;
                  reversePawn(i + di * k, j + dj * k, player);
                }
              }
            }
          }
        }
      }

    function handleClick(i, j) {
        // if (checkWinner() === 0) {
        //     i=nextSpace(j);
        //     // console.log(t);
        //     if(i<0) return null;
        //     const newBoard = [...board];
        //     newBoard[i][j] = currentPlayer;
        //     setBoard(newBoard);
        //     // console.log(board)
        //     if (currentPlayer === p1) setCurrentPlayer(p2);
        //     else setCurrentPlayer(p1);
        // }

        if(checkWinner()===null && human[currentPlayer] && board[i][j]==='A'){
        let index = available.findIndex(spot => spot[0] == i && spot[1] == j);
        if (index >= 0) {
            let index = available.findIndex(spot => spot[0] == i && spot[1] == j);
            if (isAvailablePlayer(i, j, currentPlayer)) {
                available.splice(index, 1);
                console.log("calling playat from click");
                playAt(i, j, currentPlayer);
                console.log("came out of play at click");
                const newBoard=[...board];
                setBoard(newBoard);
                currentPlayer = currentPlayer ^ 1;
                // console.log(currentPlayer)
                setTimeout(nextTurn, 500);
            }
        }
    }
    };

    function corners(player) {
        let stable = [];
        player = players[player];
        let m = 7;
        for (let j = 0; j < 7; j++) {
          for (let i = 0; i < m; i++) {
            if (board[i][j] != player) {
              m = i;
              break;
            } else {
              stable[i * 8 + j] = true;
            }
          }
          if (m == 0) {
            break;
          }
        }
      
        m = 7;
        for (let j = 7; j > 0; j--) {
          for (let i = 0; i < m; i++) {
            if (board[i][j] != player) {
              m = i;
              break;
            } else {
              stable[i * 8 + j] = true;
            }
          }
          if (m == 0) {
            break;
          }
        }
      
        m = 0;
        for (let j = 0; j < 7; j--) {
          for (let i = 7; i > m; i--) {
            if (board[i][j] != player) {
              m = i;
              break;
            } else {
              stable[i * 8 + j] = true;
            }
          }
          if (m == 7) {
            break;
          }
        }
      
        m = 0;
        for (let j = 7; j > 0; j--) {
          for (let i = 7; i > m; i--) {
            if (board[i][j] != player) {
              m = i;
              break;
            } else {
              stable[i * 8 + j] = true;
            }
          }
          if (m == 7) {
            break;
          }
        }
        return stable.filter(s => s).length;
      }

      function evaluateBoard(player) {
        return (corners(player) - corners(player ^ 1)) * 10000 + (countAvailablePlayer(player) - countAvailablePlayer(player ^ 1)) * 100 + (counts[player] - counts[player ^ 1]);
      }
    const winner = checkWinner();
    let status;
    if (winner === -1) {
        status = "Draw!";
    } else if (winner === 'W') {
        status = "Winner: Player1";
    } else if (winner === 'B') {
        status = "Winner: Player2";
    }
    const renderStatus = () => {
        if (status) {
            console.log("got result")
            if (winner === 'W') {
                return (<div className={styles.status}>
                    <div className={styles.status_wrap}>
                        {/* Winner{`${Math.max(counts)} - ${Math.min(counts)}`}: <span className={styles.status_p1}></span> */}
                        Winner: <span className={styles.status_p1}></span>
                    </div>
                </div>
                );
            } else if (winner === -1) {
                return (<div className={styles.status}>
                    <div className={styles.status_wrap}>
                        {/* Winner{`${Math.max(counts)} - ${Math.min(counts)}`}: <span className={styles.status_p1}></span> */}
                        Draw
                    </div>
                </div>
                );
            }
            else
                return (<div className={styles.status}>
                    <div className={styles.status_wrap}>
                        Winner: <span className={styles.status_p2}></span>
                    </div>
                </div>
                );
        }
    }
    const renderCircle = (i, j) => {
        if (board[i][j] === 'W') {
            return (
                <div className={styles.square} onClick={() => handleClick(i, j)}>
                    <span className={styles.circle_p1}></span>
                </div>
            );
        }
        else if (board[i][j] === 'B') {
            return (
                <div className={styles.square} onClick={() => handleClick(i, j)}>
                    <span className={styles.circle_p2}></span>
                </div>
            );
        }
        else if ((board[i][j] === 'A') && human[currentPlayer] && (isAvailablePlayer(i, j, currentPlayer))){
            return (
                <div className={styles.square} onClick={() => handleClick(i, j)}>
                    <span className={styles.circle_p3}></span>
                </div>
            );
        }
        else return <div className={styles.square} onClick={() => handleClick(i, j)}></div>
    };

    const renderCurrPlayer = () => {
        if (currentPlayer === 'W') {
            return (
                <span className={styles.p1}></span>
            )
        }
        else return (
            <span className={styles.p2}></span>
        )
    }
    return (
        <div className={styles.container}>
            <div className={styles.navBar}>
                <button className={styles.btn} onClick={leaveRoom}>Home</button>
                <button className={styles.btn} onClick={resetBoard}>Reset</button>
            </div>
            <div className={styles.currP}>Current Player: {renderCurrPlayer()}</div>
            <div className={styles.board}>
                <div className={styles.board_vline}></div>
                <div className={styles.board_vline}></div>
                <div className={styles.board_vline}></div>
                <div className={styles.board_vline}></div>
                <div className={styles.board_vline}></div>
                <div className={styles.board_vline}></div>
                <div className={styles.board_vline}></div>
                <div className={styles.board_vline}></div>
                <div className={styles.board_vline}></div>

                <div className={styles.board_hline}></div>
                <div className={styles.board_hline}></div>
                <div className={styles.board_hline}></div>
                <div className={styles.board_hline}></div>
                <div className={styles.board_hline}></div>
                <div className={styles.board_hline}></div>
                <div className={styles.board_hline}></div>
                <div className={styles.board_hline}></div>
                <div className={styles.board_hline}></div>

                <div className={styles.board_row}>
                    {renderCircle(0, 0)}
                    {renderCircle(0, 1)}
                    {renderCircle(0, 2)}
                    {renderCircle(0, 3)}
                    {renderCircle(0, 4)}
                    {renderCircle(0, 5)}
                    {renderCircle(0, 6)}
                    {renderCircle(0, 7)}
                </div>
                <div className={styles.board_row}>
                    {renderCircle(1, 0)}
                    {renderCircle(1, 1)}
                    {renderCircle(1, 2)}
                    {renderCircle(1, 3)}
                    {renderCircle(1, 4)}
                    {renderCircle(1, 5)}
                    {renderCircle(1, 6)}
                    {renderCircle(1, 7)}
                </div>
                <div className={styles.board_row}>
                    {renderCircle(2, 0)}
                    {renderCircle(2, 1)}
                    {renderCircle(2, 2)}
                    {renderCircle(2, 3)}
                    {renderCircle(2, 4)}
                    {renderCircle(2, 5)}
                    {renderCircle(2, 6)}
                    {renderCircle(2, 7)}
                </div>
                <div className={styles.board_row}>
                    {renderCircle(3, 0)}
                    {renderCircle(3, 1)}
                    {renderCircle(3, 2)}
                    {renderCircle(3, 3)}
                    {renderCircle(3, 4)}
                    {renderCircle(3, 5)}
                    {renderCircle(3, 6)}
                    {renderCircle(3, 7)}
                </div>
                <div className={styles.board_row}>
                    {renderCircle(4, 0)}
                    {renderCircle(4, 1)}
                    {renderCircle(4, 2)}
                    {renderCircle(4, 3)}
                    {renderCircle(4, 4)}
                    {renderCircle(4, 5)}
                    {renderCircle(4, 6)}
                    {renderCircle(4, 7)}
                </div>
                <div className={styles.board_row}>
                    {renderCircle(5, 0)}
                    {renderCircle(5, 1)}
                    {renderCircle(5, 2)}
                    {renderCircle(5, 3)}
                    {renderCircle(5, 4)}
                    {renderCircle(5, 5)}
                    {renderCircle(5, 6)}
                    {renderCircle(5, 7)}
                </div>
                <div className={styles.board_row}>
                    {renderCircle(6, 0)}
                    {renderCircle(6, 1)}
                    {renderCircle(6, 2)}
                    {renderCircle(6, 3)}
                    {renderCircle(6, 4)}
                    {renderCircle(6, 5)}
                    {renderCircle(6, 6)}
                    {renderCircle(6, 7)}
                </div>
                <div className={styles.board_row}>
                    {renderCircle(7, 0)}
                    {renderCircle(7, 1)}
                    {renderCircle(7, 2)}
                    {renderCircle(7, 3)}
                    {renderCircle(7, 4)}
                    {renderCircle(7, 5)}
                    {renderCircle(7, 6)}
                    {renderCircle(7, 7)}
                </div>
                <div>{renderStatus()}</div>
            </div>
        </div>
    );
};

export default Othello;

