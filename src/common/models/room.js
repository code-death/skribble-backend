import mongoose from "mongoose";

const Schema = mongoose.Schema;

const roomSchema = new Schema({
    roomId: {
        isRequired: true,
        type: String
    },
    users: [
        {
            name: String,
            rank: {
                type: Number,
                default: 1
            },
            score: {
                type: Number,
                default: 0
            },
            isDrawer: {
                type: Boolean,
                default: false
            },
            isHost: {
                type: Boolean,
                default: false
            },
            avatar: String,
            socket: String,
            roundSore: {
                type: Number,
                default: 0
            }
        }
    ],
    currentRound: {
        type: Number,
        default: 1,
    },
    totalRounds: {
        type: Number,
        default: 3,
    },
    roundInterval: {
        type: Number,
        default: 80,
    },
    hints: {
        type: Number,
        default: 2,
    },
    wordCategories: [String],
    gameStarted: {
        type: Boolean,
        default: false
    },
    wordOfTheRound: {
        type: String,
        default: ""
    },
    roundGoingOn: {
        type: Boolean,
        default: false
    },
    numberOfPeopleGuessed: [String],
    roundStartTime: Number
})

export default mongoose.model('room', roomSchema);
