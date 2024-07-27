import mongoose from "mongoose";

const roomSchema = mongoose.Schema({
    status: {
        type: String,
        default: 'WAITING',
        enum: ['WAITING','PLAYING','DONE']
    },
    count: {
        type: Number,
        default: 1
    },
    questions: Array,
    opponentName: String,   // name of player who join first 
    opponentScore: Number   // score of player who first complete or quit
                            // opponentName and opponentScore can point at 2 different players
    // winner: {
        
    // }
})

export const RoomModel = mongoose.model('room',roomSchema);