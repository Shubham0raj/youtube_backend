import mongoose ,{Schema} from "mongoose";

const likeSchema = new Schema({
    video: {
        type:Schema.Types.ObjectId,
        ref:"Video",
        default:null
    },
    comment: {
        type:Schema.Types.ObjectId,
        ref :"comment",
        default:null
    },
    tweet: {
        type:Schema.Types.ObjectId,
        ref:"Tweet",
        default :null
    },
    likedBy: {
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps : true})

export const Like= mongoose.model("Like",likeSchema)