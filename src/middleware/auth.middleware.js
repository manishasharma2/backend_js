import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import jwt from "jsonwebtoken"
import {User} from '../models/user.model.js'

// This middleware will verify that user h ya nhi?
export const verifyJWT = asyncHandler(async (req, _, next) =>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!token){
            throw new ApiError(401, "Unauthorized request.. token nhi mila hme");
        }   
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user) {
            // discuss frontend
            throw new ApiError(401,"Invalid access Token.. token se user nhi mila")
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token ....:(")
    }

})
