import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const userId =  req.user._id

    if(!userId){
        throw new ApiError(400 , "userid do not exist or incorrect format")
    }

    const {content} = req.body

    if(!content?.trim()){
        throw new  ApiError(400,"content required");
    }

    const tweet =await Tweet.create({
        owner:userId,
        content,
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201,tweet,"tweet generated successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.user._id

    if(!userId){
        throw new ApiError(400,"userId required")
    }

    const tweets = await Tweet.find({owner:userId}).select("-owner")

    if(!tweets?.length){
        throw new ApiError(404,"No tweets found for this user")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweets,"tweet fetched successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {newContent}=  req.body
    const {tweetId} = req.params

    if(!newContent?.trim()){
        throw new ApiError(400, "New tweet required")
    }
    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400 , "no valid tweetId")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }
    if(tweet.owner.toString()!==req.user._id.toString()){
        throw new ApiError(400,"Not authorised to make changes")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {content:newContent},
        {new:true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedTweet , "tweet updated succesfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    const userId = req.user._id

    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400, "invalid tweet id")
    }

    const tweet  = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(400, "Tweet do not exist")
    }
    if(userId.toString()!==tweet.owner.toString()){
        throw new ApiError(400 , "you are not authorised to delete the tweet")
    }

    await tweet.deleteone();

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"tweet deleted successfully")
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}