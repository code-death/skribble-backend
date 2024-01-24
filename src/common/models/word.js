import mongoose from "mongoose";

const Schema = mongoose.Schema;

const wordSchema = new Schema({
    text: String,
    category: String
})

export default mongoose.model('word', wordSchema);
