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
    }
    // winner: {
        
    // }
})

export const RoomModel = mongoose.model('room',roomSchema);