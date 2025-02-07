import { Router } from "express";
import {registerUser,loginUser,logoutUser,refreshAccessToken} from '../controllers/user.controller.js'
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
export default router