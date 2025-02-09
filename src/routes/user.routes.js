import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken, 
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetials,
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getUserWatchHistory
} from '../controllers/user.controller.js'
import {verifyJWT} from '../middleware/auth.middleware.js'
import {upload} from "../middleware/multer.middleware.js"

const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount : 1,
        }
    ]),//middleware
    registerUser)

router.route('/login').post(loginUser)

//secured routes
router.route('/logout').post(verifyJWT , logoutUser)
router.route('/refreshToken').post(refreshAccessToken)
router.route('/changePassword').post(verifyJWT,changeCurrentPassword)
router.route('/current-user').get(verifyJWT,getCurrentUser)
router.route('/edit-account').patch(verifyJWT,updateAccountDetials)
router.route('/edit-avatar').patch(verifyJWT,upload.single("avatar"),updateUserAvatar)  
router.route('/edit-coverImage').patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route('/c/:username').get(verifyJWT,getUserChannelProfile)
router.route('/history').get(verifyJWT,getUserWatchHistory)
export default router