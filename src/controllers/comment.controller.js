import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import Video from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId){
        throw new ApiError(400,"video Id not found")
    }

    const pageNumber = parseInt(page,10);
    const limitNumber = parseint(limit,10);

    const skip  = (pageNumber-1)*limitNumber;

    const video =await Video.findById(videoId);

    if(!video){
        throw new ApiError(400,"video not found")
    }

    const comment = Comment.find({video:videoId})
    .populate("owner","avatar username")
    .sort({createdAt :-1})
    .skip(skip)
    .limit(limitNumber)

    const totalComment = await comment.countDocument({video:videoId})


return res
.status(200)
.json(
    new ApiResponse(200,
        {
            comment ,
            pagination:{
                totalComment,
                currentpage:pageNumber,
                totalPages:Math.cell(totalComment/limitNumber)
            }
        },
        "comment fetched Successfully"
    )
)
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    
    
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }