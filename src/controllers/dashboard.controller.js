import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from"../models/user.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userId = req.params.userId || req.user?._id

    if(!userId){
        throw new ApiError(400,"user id not found")
    }

    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(404,"user not found")
    }

    const Stats = await Video.aggregate([
        {
            $match : {owner : new mongoose.Types.ObjectId(userId)}
        },
        {
            $lookup:{
                from:"Likes",
                localField:"_id",
                foreignField:"video",
                as:"likes"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                let: {channelId: "$owner"},
                pipeline:[
                    {
                        $match:{$expr:{$eq:["$channel","$$channelId"]}}
                    }
                ],
                as:"subscribers",
            }
        },
        {
            $addFields:{
                likeCount:{$size:"$likes"},
                subscriberCount:{$size:"$subscribers"}
            }
        },
        {
            $group:{
                _id:"$owner",
                totalViews:{$sum:"$views"},
                totalLikes:{$sum: "$likeCount"},
                totalSucscribers:{$first: "$subscriberCount"},
                totalVideos: {$sum :1}
            }
        }
    ])

    const finalstats= {
        totalViews: videoStats[0]?.totalViews || 0,
        totalLikes: videoStats[0]?.totalLikes || 0,
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalSubscribers:subscriberStats[0]?.totalSubscribers||0,
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            finalstats,
            "data fetched success fully"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.params.userId || req.user?._id

    if(!userId){
        throw new ApiError(400,"userId not found")
    }

    const user = await User.findById(userId)

    if(!user){
        throw new ApiError(404,"user not found")
    }

    const videos = await Video.find({owner :userId})

    if(videos.length===0){
        throw new ApiError(400, "No video available")
    }

    return res
    .status(200)
    .json(
       new ApiResponse( 200,
        videos,
        "video fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }