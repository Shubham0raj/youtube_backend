import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema= new Schema(
    {
        username:{
            type:String,
            require:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email :{
            type:String,
            require:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullName :{
            type:String,
            require:true,
            trim:true,
            index:true
        },
        avatar : {
            type:String ,//cloudinary url
            required:true,
        },
        coverImage: {
            types : String, 
        },
        watchHistory: [
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password : {
            type:String,
            required: [true,"password is required"]
        },
        refreshToken: {
            type:String
        }
    },
    {
        timestamps :true
    }

)

userSchema.pre("save",async function(next) {
    if(!this.isMOdified("password"))return next();
    this.password =await bcrypt.hash(this.password,10) 
    next()
})

userSchema.method.isPasswordCorrect = async function(password){
   return await bcrypt.compare(this.password,password)
}

userSchema.methods.generateAccessToken= function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
        
    )
}
userSchema.methods.genreateRefreshToken =function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}

userSchema.method.generateRefreshToken= function(){}
export const User = mongoose.model("User",userSchema)