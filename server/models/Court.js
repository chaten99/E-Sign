import { Schema, model } from "mongoose";

const courtSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true
    }
});

const Court = model("Court", courtSchema);
export default Court;