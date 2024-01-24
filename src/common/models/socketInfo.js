import mongoose from "mongoose";

const Schema = mongoose.Schema;

const socketInfoSchema = new Schema({
    socket: String,
    rooms: [String]
})

export default mongoose.model('socketInfo', socketInfoSchema);
