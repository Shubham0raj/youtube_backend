import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body  

    if(!name || !description){
        throw new ApiError(400, "All credential required")
    }
    //TODO: create playlist
    const user = req.user?._id 

    if(!user){
        throw new ApiError(404, "user not found")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner:user,
        videos:[]
    })

    if(!playlist){
        throw new ApiError(401,"something wrong ocuured during creating playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId){
        throw new ApiError(400,"user missing")
    }

    const playlist = await Playlist.find({owner:userId})

    if(!playlist||playlist.length===0){
        return ApiError(404,"Playlist do not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"playlist fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!playlistId){
        throw new ApiError(400, "playlist id required")
    }

    const playlist = await Playlist.findById(playlistId).populate("videos")

    if(!playlist){
        return ApiError(404,"Playlist do not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!mongoose.isValidObjectId(playlistId)||!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Id format")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {$addToSet:{videos:videoId}},
        {new:true}
    ).populate("videos")

    if(!playlist){
        throw new ApiError(400, "playlist do no exist or is empty")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"playlist updated")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!mongoose.isValidObjectId(playlistId)||!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invlid or missing playlist or videoId")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
        }

    if(playlist.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"not authorised to perform the task")
    }

    playlist.videos = playlist.videos.filter(
        (vid)=>vid.toString()!==videoId
    );

    await playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(200, videos ,"video deleted successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Id format")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if(!playlist){
        throw new ApiError(400,"playlist Not found")
    }
    
    if(playlist.owner.toString!==req.user._id.toString()){
        throw new ApiError(403,"you are not authorised to delete the playlist")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(
        new ApiResponse(200, {},"playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlist ID format")
    }

    if(!name &&!description){
        throw new ApiError(400,"nothing to update")
    }
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        new ApiError(404, "playlist not found")
    }

    if(playlist.owner.toString()!==req.user._id.toString()){
        throw new ApiError(400,"not authorised to make changes")
    }

    if(name)playlist.name = name;
    if(description)playlist.description= description;

    await playlist.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"playlist updated successfully")
    )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}