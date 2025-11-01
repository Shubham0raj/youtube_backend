import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async(req,res)=>{
    //take input name emailetc
    //validation-not empty
    //check if user already exist:username,email
    //check for image,check for avatar
    //upload to coludinary,avatar
    //create user object-create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res

    const {fullName,email,Username,password}= req.body

    console.log(email)

    if(
        [fullName,email,Username,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = User.findOne({
        $or:[{ Username },{ email }]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username allready exist")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath= req.file?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError (400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError (400,"Avatar file is required")
    }

    User.create({
        fullName,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username : Username.toLowerCase()
    })

    const createdUser =await User.findById(User._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500 ,"something went wrong while registering the user")
    } 

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )
})  

export {registerUser}