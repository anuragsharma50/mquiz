import express from "express";
import http from "http";
import {Server} from "socket.io";
import {RoomModel} from "./src/room.schema.js";

const app = express();
export const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on('connection', async (socket) => {
    console.log("connection established");
    socket.score = 0;

    let data;   // data to store array of questions
    let i = 0;  // i to traverse over data

    socket.on("join", async (username) => {     // user will join room before playing game
        socket.username = username;             // storing username for future reference

        // getRoom() function to get room details from DB
        // if no empty room is there create new else use from existing
        const getRoom = async () => {   
            let r = await RoomModel.findOne({status: 'WAITING',count: {$in: [0,1]}});
            if(!r) {
                // fetching questions from api and storing them in db under room collection. 
                const res = await fetch("https://opentdb.com/api.php?amount=5&difficulty=easy&type=multiple");
                let temp = await res.json();
                data = temp.results;
                r = new RoomModel({opponentName:username,questions:data});
            }
            else{
                r.count++;
                data = r.questions;
            }

            // update status if both player is available and we are starting game
            if(r.count == 2){  
                r.status = "PLAYING";
            }
            await r.save();

            return r;
        }

        let room = await getRoom();

        socket.room = room._id.toString();
        socket.join(socket.room);

        if(room.count == 2){
            let mcq = {...data[i]};
            mcq.incorrect_answers.push(mcq.correct_answer);
            mcq.incorrect_answers.sort();
            delete mcq.correct_answer;  // delete ans before sending to FE
            
            // emit question to room (both players at same time)
            io.to(socket.room).emit("question", mcq);

            // emit player1's name as opponent to player2 and visa versa
            socket.broadcast.to(socket.room).emit("opponent_name", username);
            socket.emit("opponent_name", room.opponentName);
        }
        else{
            socket.emit("wait","Waiting for opponent!!");
        }
    })
    
    // ans will be emited by FE for each question
    socket.on("ans", async ({ans}) => {
        // compare ans from data's ans 
        if(data[i].correct_answer === ans){
            socket.score += 10;
        }

        // increase i to go to next question
        i++;

        // emit my score to me as my_score and opponent as opponent_score
        socket.emit("my_score",socket.score);
        socket.broadcast.to(socket.room).emit("opponent_score",socket.score); 

        // if i<5 means questions are pending
        if(i < 5){
            let mcq = {...data[i]};
            mcq.incorrect_answers.push(mcq.correct_answer);
            mcq.incorrect_answers.sort();
            delete mcq.correct_answer;
            socket.emit("question", mcq);
        }
        else{
            let room = await RoomModel.findById(socket.room);
            let opponentScore = room.opponentScore;
            // if opponentScore is not saved in DB means opponent is still playing
            // so current player is first to finish, so store current player's score
            if(!opponentScore && opponentScore !== 0){ 
                room.opponentScore = socket.score;
                await room.save();
            }
            else{
                if(opponentScore < socket.score) {
                    socket.emit("WIN");                             // you won
                    socket.broadcast.to(socket.room).emit("LOST");  // opponent lost
                }
                else if(opponentScore == socket.score) {
                    io.to(socket.room).emit("DRAW");
                }
                else{
                    socket.emit("LOST");                             // you lost
                    socket.broadcast.to(socket.room).emit("WIN");    // opponent won
                }
                console.log("game end");
                await RoomModel.findByIdAndDelete(socket.room);     // delete room after game is done
            }
        }
    })

    socket.on('disconnect', async () => {
        console.log("connection disconnected");
        if(socket.room) {
            // check if it's fine to remove player from current room as game is not started
            // if yes decrease count of player
            // if game is started same score of player who left
            await RoomModel.findOneAndUpdate({_id:socket.room,status:"WAITING"}, {$inc: {count:-1}},{ReturnsNewDoc: true});
            await RoomModel.findOneAndUpdate({_id:socket.room,status:"PLAYING"}, { opponentScore: socket.score},{ReturnsNewDoc: true});
        }
    })
})

