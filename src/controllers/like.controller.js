import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import {Tweet} from "../models/tweets.model.js"
import {Video} from "../models/video.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user._id
    //TODO: toggle like on video
    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400 ,"video not found")
    }

    const existingLike = await Like.findOne({
        likedBy:userId,
        video:videoId
    })
    if(!existingLike){
        await Like.create({
            video:videoId,
            likedBy:userId
        })
    }
    if(existingLike){
        await Like.findOneAndDelete({
            likedBy:userId,
            video:videoId
        })
        return res.json(new ApiResponse("200",{},"liked removed"))
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Video Liked")
    )
    
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user._id
    //TODO: toggle like on comment

    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404,"comment do not exist")
    }

    const existingLike = await Like.findOne({
        likedBy:userId,
        comment:commentId
    })

    if(existingLike){
        await Like.findOneAndDelete({
            likedBy:userId,
            comment:commentId
        })
        return res
        .status(200)
        .json(
            new ApiResponse(200,{}, "Like removed")
        )
    }else{
        await Like.create({
            likedBy:userId,
            comment:commentId,
        })
    }
return res
.status(200)
.json(
    new ApiResponse(200,{},"comment Liked")
)
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const user =req.user._id

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(400,"tweet not found")
    }

    const existingLike= await Like.findOne({
        likedBy : user,
        tweet:tweetId
    })

    if(!existingLike){
        await Like.create({
            likedBy:user,
            tweet:tweetId
        })
        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Tweet Liked")
        )
    }else{
        await Like.findOneAndDelete({
            likedBy:user,
            tweet:tweetId
        })
        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Like removed ")
        )
    }

    
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const user = req.user._id

    if(!user){
        throw new ApiError(400,"user do not exist")
    }

    const videos = await Like.aggregate([
        {
            $match:{
                likedBy:mongoose.Types.ObjectId(user),
                video: {$exists:true}
            },
        },
        {
           $lookup: {
                from :"videos",
                localField:"video",
                foreignField:"_id",
                as:"videoDetails",
           } ,
        },
        {$unwind:"$videoDetails"},
        {
            $project:{
                _id:0,
                video:"$videoDetails"
            }
        }
    ])

    if(!videos.length){
        throw new ApiError(400,"No liked video exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,videos.map(v=>v.video),"video fetched successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}