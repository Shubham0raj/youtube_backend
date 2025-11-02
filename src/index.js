import dotenv from "dotenv"
import connectDB from "./db/index.js"
import {app} from "./app.js"



dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.on("errrorr",(error)=>{
        console.log("errorr",error);
        throw error;
})
    app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`Server is running at port :${process.env.PORT}`)
    })
})
.catch((err)=>{ 
    console.log("MONGO db connection failed!!!",err);
})







/*import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from "express"

const app=express()

(async ()=>{
    try {
        mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error",()=>{
            console.log("errr :",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("Error :" ,error)
        throw error
    }
})()
*/