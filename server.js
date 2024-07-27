import express from "express";
import http from "http";
import {Server} from "socket.io";
import {RoomModel} from "./src/room.schema.js";

const app = express();
export const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on('connection', (socket) => {
    console.log("connection established");
    socket.score = 0;

    let data = {
        12 : {
            id: 12,
            question: "How are you?",
            option1: "good",
            option2: "theek",
            option3: "mast",
            option4: "aag",
            ans: "good"
        },
        5 : {
            id: 5,
            question: "why are you?",
            option1: "meri mazri",
            option2: "pata nhi",
            option3: "maksad",
            option4: "sone",
            ans: "sone"
        },
        14 : {
            id: 14,
            question: "where are you?",
            option1: "here",
            option2: "there",
            option3: "somewhere",
            option4: "nowhere",
            ans: "here"
        }
    }

    let keys = Object.keys(data);
    let i = 0;

    socket.on("join", async ({username}) => {
        socket.username = username;
        // socket.room = roomId;
        // console.log({username,roomId});
        // socket.join(roomId);

        const getRoom = async () => {
            let r = await RoomModel.findOne({status: 'WAITING',count: {$in: [0,1]}});
            console.log("r",r);
            if(!r) {
                r = new RoomModel();
            }
            else{
                r.count++;
            }
            await r.save();

            return r;
        }

        let room = await getRoom();
        console.log(room);

        socket.room = room._id.toString();
        // console.log({username,roomId:room._id});
        socket.join(socket.room);
        // console.log(socket.id);

        // const sockets = await io.in(socket.room).fetchSockets();
        // console.log(sockets[0].client);

        if(room.count == 2){
            let mcq = {...data[keys[i++]]};
            delete mcq.ans;
            mcq.room = room._id; 
            console.log(mcq);
    
            io.to(socket.room).emit("question", mcq);
            // socket.broadcast.to(socket.room).emit("question", mcq);
        }
        else{
            socket.emit("wait","Waiting for opponent!!");
        }
    })
    
    socket.on("ans",({id,ans}) => {
        // console.log({id,ans});
        if(data[id].ans === ans.toLowerCase()){
            socket.score += 10;
        }
        // console.log(socket.score);
        socket.emit("my_score",socket.score);
        socket.broadcast.to(socket.room).emit("opponent_score",socket.score); 

        if(i < keys.length){
            let mcq = {...data[keys[i++]]};
            delete mcq.ans;
            // console.log(mcq);
            socket.emit("question", mcq);
        }
    })

    socket.on('disconnect', async () => {
        console.log("connection disconnected");
        if(socket.room) {
            let t = await RoomModel.findByIdAndUpdate(socket.room, {$inc: {count:-1}},{ReturnsNewDoc: true});
            console.log("t",t);
        }
    })
})

