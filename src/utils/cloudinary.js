import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_API_NAME, 
  api_key:process.env.CLOUDINARY_API_KEY, 
  api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath)return null;

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file has been uploaded succesfully
        //console.log("file is uploaded on cloudinary",response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        console.error("❌ Cloudinary upload failed:", error);
        fs.unlinkSync(localFilePath) //remove the locally saved temp file as the upload operation got failed
        return null;
    }
}
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log("🗑️ Deleted old image from Cloudinary:", publicId);
  } catch (error) {
    console.error("❌ Failed to delete old image from Cloudinary:", error);
  }
};


export {uploadOnCloudinary,deleteFromCloudinary}