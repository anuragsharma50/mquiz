
const socket = io.connect("http://localhost:8000");

socket.on('connection', () => {
    console.log("connected to the server");

})

let username = "Anurag";
let roomId = 101;
let questionId = 0;
let flag = false;
// let timeout = 10;
let timer;

socket.emit("join",{username,roomId});

const qContainerElement = document.querySelector(".question-container");
const questionElement = document.querySelector(".question");
const optionsElement = document.querySelector(".options");
const option1Element1 = document.querySelector("#option1");
const option1Element2 = document.querySelector("#option2");
const option1Element3 = document.querySelector("#option3");
const option1Element4 = document.querySelector("#option4");
const myScoreElement = document.querySelector("#my-score");
const opponentScoreElement = document.querySelector("#opponent-score");
const timeoutElement = document.querySelector(".timeout");

socket.on("question", mcq => {
    console.log(mcq);
    questionElement.innerHTML = mcq.question;
    option1Element1.innerHTML = mcq.option1;
    option1Element2.innerHTML = mcq.option2;
    option1Element3.innerHTML = mcq.option3;
    option1Element4.innerHTML = mcq.option4;
    questionId = mcq.id;
    flag = true;
    qContainerElement.style.visibility = "visible";

    clearInterval(timer);
    let timeout = 10;
    timer = setInterval(() => {
        timeout--;
        timeoutElement.innerHTML = `00:0${timeout}`;
        if(timeout == 0){
            socket.emit("ans",{id:questionId,ans:""});
            clearInterval(timer);
        }
    },1000);
})

optionsElement.addEventListener("click", (e) => {
    // console.log(e.target.className);
    if(e.target.className != "options" && flag) {
        flag = false;
        clearInterval(timer);
        console.log(e.target.innerHTML);
        socket.emit("ans",{id:questionId,ans:e.target.innerHTML});
    }
})

socket.on("my_score", (myScore) => {
    console.log("My score", myScore)
    myScoreElement.innerHTML = myScore;
})

socket.on("opponent_score", (opponentScore) => {
    console.log("opponent score", opponentScore);
    opponentScoreElement.innerHTML = opponentScore;
})