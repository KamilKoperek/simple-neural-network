let networks = Array(9);
let recognizedXO = Array(9).fill(" ");
let gameboard = Array(9);

function compareCells(a, b, c) {
 return recognizedXO[a] != " " && recognizedXO[a] == recognizedXO[b] && recognizedXO[a] == recognizedXO[c]
}

function checkGame() {
    let matches = Array(9).fill(false);
    [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]].forEach(cells => {
        if(compareCells(...cells)) {
            matches[cells[0]]= true;
            matches[cells[1]]= true;
            matches[cells[2]]= true;
        }
    });
    matches.forEach((match, i) => {
            gameboard[i].style.filter = match ? "invert(1)" : "invert(0)";
    });
}

for(let i = 0; i < 9; i++) {
    gameboard[i] = document.getElementById("c"+(i+1));
    networks[i] = new network(JSON.parse(networkJSON))
    networks[i].setInputMethod("canvas", gameboard[i], false, 15, 15, 10, false, 1);
    networks[i].onInputChange = function(){
        if(!networks[i].inputIsEmpty) {
            recognizedXO[i] = networks[i].getOutput()[0] < networks[i].getOutput()[1] ? "X" : "O";
            gameboard[i].getElementsByTagName("p")[0].innerHTML = recognizedXO[i];
        }
        checkGame();
    };
}