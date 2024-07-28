
// const socket = io.connect("http://localhost:8000");
const socket = io.connect("https://mquiz.onrender.com");

socket.on('connection', () => {
    console.log("connected to the server");

})

const lobbyElement = document.querySelector(".lobby");
const nameElement = document.querySelector("#name-input");
const playButton = document.querySelector("#play-button");
const waitAreaElement = document.querySelector(".wait-area");
const gameElement = document.querySelector(".game");
const qContainerElement = document.querySelector(".question-container");
const questionElement = document.querySelector(".question");
const optionsElement = document.querySelector(".options");
const option1Element1 = document.querySelector("#option1");
const option1Element2 = document.querySelector("#option2");
const option1Element3 = document.querySelector("#option3");
const option1Element4 = document.querySelector("#option4");
const usernameElement = document.querySelector("#username");
const opponentNameElement = document.querySelector("#opponent-name");
const myScoreElement = document.querySelector("#my-score");
const opponentScoreElement = document.querySelector("#opponent-score");
const timeoutElement = document.querySelector(".timeout");
const statusElement = document.querySelector(".status");
const statusTextElement = document.querySelector(".statusText");

let flag = false;
let timer;

nameElement.value = localStorage.getItem("username") || "";

playButton.addEventListener('click',() => {
    let username = nameElement.value;
    if(username.trim() != ""){
        usernameElement.innerHTML = username;
        if(username !== localStorage.getItem("username")){
            localStorage.setItem("username", username);
        }
        socket.emit("join",username);
        lobbyElement.style.display = "none";
        waitAreaElement.style.display = "flex";
    }
})

socket.on("question", mcq => {

    if(gameElement.style.display = "none") {
        gameElement.style.display = "block";
    }

    if(waitAreaElement.style.display !== "none") {
        waitAreaElement.style.display = "none";
    }

    questionElement.innerHTML = mcq.question;
    option1Element1.innerHTML = mcq.incorrect_answers[0];
    option1Element2.innerHTML = mcq.incorrect_answers[1];
    option1Element3.innerHTML = mcq.incorrect_answers[2];
    option1Element4.innerHTML = mcq.incorrect_answers[3];
    flag = true;

    clearInterval(timer);
    let timeout = 10;
    timer = setInterval(() => {
        timeout--;
        timeoutElement.innerHTML = `00:0${timeout}`;
        if(timeout == 0){
            socket.emit("ans",{ans:""});
            clearInterval(timer);
        }
    },1000);
})

optionsElement.addEventListener("click", (e) => {
    if(e.target.className != "options" && flag) {
        flag = false;
        clearInterval(timer);
        socket.emit("ans",{ans:e.target.innerHTML});
    }
})

socket.on("opponent_name", opponenetName => {
    opponentNameElement.innerHTML = opponenetName;
})

socket.on("my_score", (myScore) => {
    myScoreElement.innerHTML = myScore;
})

socket.on("opponent_score", (opponentScore) => {
    opponentScoreElement.innerHTML = opponentScore;
})

const showStatus = (msg) => {
    statusElement.style.display = "block";
    statusTextElement.innerHTML = msg;
    qContainerElement.style.display = "none";
    timeoutElement.style.display = "none";
}

socket.on("WAIT", () => {
    showStatus("Waiting for opponent to finish");
})

socket.on("WIN", () => {
    showStatus("Congrulations, you Won!!");
})

socket.on("LOST", () => {
    showStatus("Oops, you lost");
})

socket.on("DRAW", () => {
    showStatus("Well played, it's a draw");
})