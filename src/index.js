import dotenv from 'dotenv'
import mongoose from "mongoose";
import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import handleSocketEvents from "./socket";

const socketApp = express();
const server = createServer(socketApp)
export const io = new Server(server, {
    cors: ['http://localhost:3000', 'https://skribble-chi.vercel.app']
});

server.listen(process.env.PORT || 8102, () => {
    console.log(`Server running on port ${process.env.PORT}!`)
})

io.on('connection', (socket) => {
    console.log(socket.id, " connected")
    handleSocketEvents(socket, io);
    socket.on('reconnect', (attemptNumber) => {
        console.log(`Socket ${socket.id} reconnected (attempt ${attemptNumber})`);
    });
});


dotenv.config();

const app = new express();


const uri = process.env.MONGO_URL;

async function connectDb() {
    try {
        await mongoose.connect(uri);
        console.log('DB Connection Open');
    } catch (e) {
        console.log(e)
    }
}

connectDb();
