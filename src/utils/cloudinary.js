import {v2 as cloudinary} from "cloudinary";
import exp from "constants";
import fs from "fs"

const uploadOnCloudinary =  async (localFilePath) =>{
    try {
        if(!localFilePath) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader(localFilePath,{
            resource_type: "auto"
        })
        //file has been  uploaded successfully
        console.log("File is uploaded on cloudinary ", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // Remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary};
// cloudinary.config({ 
//     cloud_name: process.env.CLOUDINARY.CLOUD_NAME, 
//     api_key: process.env.CLOUDINARY_API_KEY, 
//     api_secret:  process.env.CLOUDINARY_API_SECRET
// });