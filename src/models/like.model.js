import mongoose ,{Schema} from "mongoose";

const likeSchema = new Schema({
    video: {
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    commant: {
        type:Schema.Types.ObjectId,
        ref :"comment"
    },
    tweet: {
        type:Schema.Types.ObjectId,
        ref:"Tweet"
    },
    likedBy: {
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamp : true})

export const Like= mongoose.model("Like",likeSchema)