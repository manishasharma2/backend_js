import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'


const registerUser = asyncHandler(async (req,res) =>{

    // get user register details from frontend
    // validation -- not empty details
    // check if user already exists : can use username or emails
    // check for images , check for avatar
    // upload them to cloudinary,check avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const {fullname,email,username,password} = req.body
    // console.log("email id: ",email,password,fullname,username);

    // if(fullname === ''){
    //     throw new ApiError(400,"fullname is required")    
    // }
    if(
        [fullname,email,username,password].some((field)=>field ?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409,"User with same email and username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required...  ")
    }

    const avatar =  await uploadOnCloudinary(avatarLocalPath)
    const coverImage =  await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required... kuch gadbad h")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password,
    })

    const createdUser =  await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering a user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )

})

const generateAccessAndRefreshToken = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateAccessToken()
        const accessToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})

        return {accessToken,refreshToken}
        
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access tokens")
    }
}

const loginUser = asyncHandler(async(req,res) =>{
    // access data from request body
    // credentials username or email
    // find the user
    // password check
    // access and referesh token
    // send cookie

    const {email, username, password} = req.body

    if(!username && !email){
        throw new ApiError( 400,"username or password is required")
    }

    const user = await User.findOne({
        $or : [{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exists")
    }

    const isPasswordValid =  await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials ---  Password is not valid");
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,{
                user: loggedInUser, accessToken,refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res) =>{
    // clear cookies and refresh tokens
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accesssToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out successfully :)"))
}) // now logout is not working will work on this functionality

const refreshAccessToken = asyncHandler(async (req, res) =>{
    const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request .. Issue in token")
    }

    try {
        const decodedToken =  jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh token.. user nhi mila DB m")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
    
        const options = {
            httpOnly : true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} =  await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken)
        .cookie("newRefreshToken",newRefreshToken)
        .json(
            new ApiResponse(200,{accessToken,refreshToken: newRefreshToken},"Access token refreshed successfully")
        )
    
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler( async (req,res) =>{
    const { oldPassword, newPassword,confirmPassword} = req.body;
    if(newPassword !== confirmPassword){
        throw new ApiError(401,"new password and confirm password are not same")
    }
    const user =  await User.findById(req.user?._id)
    await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req,res) =>{
    return res
    .status(200)
    .json(200,req.user,"Current user fetched successfully")
})

const updateAccountDetials = asyncHandler( async(req,res) =>{
    const {fullname, email} = req.body

    if(!fullname || !email){
        throw new ApiError(400, "All fields are required")
    }

    User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                // email: email
                email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully :)"))
})

const updateUserAvatar = asyncHandler(async (req,res) =>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400,"Error while uploading avatar on cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar = avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "avatar updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async (req,res) =>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"CoverImage file is missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading coverImage on cloudinary")
    }
    const user =  await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage = coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "coverImage updated successfully")
    )
})

const getUserChannelProfile = asyncHandler(async (req,res) =>{

    const {username} = req.params
    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }
    const channel =  await User.aggregate([
        {
            $match:{
                username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from:"Subscriptions",
                localField: "_id",
                foreignFiels: "channel",
                as: "subscrubers"
            }
        },
        {
            $lookup: {
                from:"Subscriptions",
                localField: "_id",
                foreignFiels: "subscriber",
                as: "subscribedToz"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed:{
                    $cond: {
                        if: {$in:[req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount : 1,
                isSubscribed: 1,
                avatar:1,
                coverImage: 1,
            }
        }
    ])
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetials,
    updateUserAvatar,
    updateUserCoverImage
}
