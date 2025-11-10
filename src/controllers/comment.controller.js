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
    const {videoId} = req.params
    const {content} = req.body
    if(!videoId || content.trim()){
        throw new ApiError(400, "Video Id and Comment is not available")
    }
    
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"video not available")

    }

    const comment = await Comment.create({
        comment,
        video:videoId,
        owner:req.user._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"comment added successfully")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {newComment} = req.body

    if(!newComment || !newComment.trim()){
        throw new ApiError(400, "comment text is required ")
    }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400,"comment not found")
    }

    if (comment.owner.toString() !== req.user._id.toString()) 
        {throw new ApiError(403, "You cannot edit this comment");}


    comment.content = newComment.trim()
    await comment.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            comment,
            "comment updated successfully"
        )
    )
    
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    //get video
    const {commentId} = req.params

    if(!commentId){
        throw new ApiError(400,"comment id missing")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(400,"comment not found")
    }

    if(comment.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"dont have authority to delete")
    }

    await comment.deleteOne();

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            {},
            "comment deleted successfully"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }