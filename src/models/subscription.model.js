import mongoose ,{Schema} from "mongoose";

const subscriptionSchma = new Schema({
    subscriber:{
        type : Schema.Types.ObjectId,//one who is subscrbing
        ref : "User"
    },
    channel :{
        type : Schema.Types.ObjectId,//one to whome 'subscriber' is subscribing
        ref : "User"
    }
},{timestamps :true})

export const Subscription= mongoose.model("Subscription",subscriptionSchma)