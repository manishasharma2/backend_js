// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})


connectDB();





/*import express from 'express'
const app = express();

;(async () => {
    try {
        mongoose.connect(`${process.env.MONGODBB_URI}/ ${DB_NAME} `)
        app.on("Error", () =>{
            console.log("error is :", error);
            throw error;
            
        })

        app.listen(process.env.PORT, () =>{
            console.log(`App is listening on port no : ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.error("ERROR : ", error);
        throw error
    }
})() */