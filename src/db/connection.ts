import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const Connection = async () => {
    const url = process.env.URL;

    try{
    await mongoose.connect(url as string)
    console.log("MongoDB connected")

    }catch(error){
        console.log("MongoDB disconnected", error);
    }
    
}

export default Connection;