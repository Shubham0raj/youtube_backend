import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import fs from "fs";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const pageNumber = parseInt(page,10)
    const limitNumber= parseInt(limit,10)

    const skip = (pageNumber-1)*limitNumber

    const filter  = {}
    if(userId)filter.owner = userId
    if(query)filter.title = {$regex :query , $options : "i"}

    const videos = await Video.find({owner:userId})
    .find(filter)
    .sort({[sortBy || "createdAt"]:sortType==="asc" ? 1 : -1})
    .skip(skip)
    .limit(limitNumber)

    if(!videos?.length){
        throw new ApiError(400, "NO video found")
    }


    return res
    .status(200)
    .json(
        new ApiResponse(200 , videos , "successfully videos fetched")
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    const videoPath = req.files?.video?.[0]?.path;
    const thumbnailPath = req.files?.thumbnail?.[0]?.path;

    const userId = req.user._id

    if(!videoPath||!thumbnailPath){
        throw new ApiError(400,"video content missing")
    }

    if(!title?.trim()||!description?.trim()){
        throw new ApiError(400,"title and description are reequired")
    }

    const video = await uploadOnCloudinary(videoPath)

    const thumbnail = await uploadOnCloudinary(thumbnailPath)

    if(!video){
        throw new ApiError(400,"something wrong happened while uploding the video")
    }

    if(!thumbnail){
        throw new ApiError(400,"something wrong happened while uploding the thumbnail")
    }

    fs.unlinkSync(videoPath);
    fs.unlinkSync(thumbnailPath)

    const published_video = await Video.create({
        videoFile:video?.url,
        thumbnail:thumbnail?.url,
        title,
        description,
        isPublished:true,
        views:0,
        duration:video?.duration,
        owner:userId,

    })


    return res
    .status (201)
    .json(
        new ApiResponse(
            201,published_video,"video published successfully"
        )
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId || !mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"videoid missin or invalid")
    }
    const video = await Video.findById(videoId)

    if (!video) {
    throw new ApiError(404, "Video not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,video, "video fetched successfully"
        )
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;
    const thumbnailPath = req.file?.path;
    const { title, description } = req.body;

    // Validate video ID
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Find video
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Authorization check
    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Not authorized to update this video");
    }

    // Prepare update data
    const updateData = {};

    if (title?.trim()) updateData.title = title.trim();
    if (description?.trim()) updateData.description = description.trim();

    // Handle thumbnail update if provided
    if (thumbnailPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailPath);
        if (!thumbnail) {
            throw new ApiError(400, "Failed to upload thumbnail");
        }

        updateData.thumbnail = thumbnail.url;

        // Delete old thumbnail from Cloudinary if you want cleanup
        // await deleteFromCloudinary(video.thumbnail);
        fs.unlinkSync(thumbnailPath);
    }

    // Update video
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateData },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedVideo, "Video updated successfully")
        );
});


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const userId = req.user._id

    if(!videoId || !mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"videoId Missing or invalid")
    }

    const video=  await Video.findById(videoId)

    if(video?.owner.toString()!==userId?.toString()){
        throw new ApiError(400, "not authorised to delete the video")
    }
    await video.deleteOne()

    return res
    .status(200)
    .json(
        new ApiResponse(200, {} , "video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Not authorized to change publish status");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video publish status toggled successfully")
        );
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}