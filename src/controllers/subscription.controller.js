import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user._id
    // TODO: toggle subscription
    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400,"channel-id missing or in wrong format")
    }
    if(!userId){
        throw new ApiError(400,"user not found")
    }

    if(!channelId.toString()===!userId.toString()){
        throw new ApiError(400,"you cannot subscribe to yourself");
    }

    const existingSub = await Subscription.findOne({
        subscriber:userId,
        channel:channelId,
    })

    if(existingSub){
        await Subscription.findByIdAndDelete(existingsub._id);

        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"usnsibscribed successfully")
        )
    }
    const newSub = await Subscription.create({
        subscriber:userId,
        channel:channelId,
    });


    return res
    .status(200)
    .json(
        new ApiResponse(200,"Unsubscribed Successfully")
    )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400, "invalid user")
    }

    const subscribers = await Subscription.find({
        channel:channelId
    }).populate(
        "subscriber","name avatar"
    )

    if(!subscribers || !subscribers.length){
        throw new ApiError(400,"no subscribed channels")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,subscribers,"subscriber send succcessfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!mongoose.isValidObjectId(subscriberId)){
        throw new ApiError(400, "invalid user")
    }

    const userExists = await User.exists({ _id: subscriberId });
    if (!userExists) throw new ApiError(404, "User not found");

    const channels = await Subscription.find({
        subscriber:subscriberId
    }).populate(
        "channel" , "_id name avatar"
    )

    if(!channels.length){
        return new ApiResponse(200,[],"No channel subscribed yet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,channels.map(sub=>sub.channel),"channels send succcessfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
