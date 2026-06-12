import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { ActivityLog } from "../model/activityLog.js";

export const getActivity = async(req:AuthRequest,res:Response):Promise<void> =>{
    try {
     const activity  = await ActivityLog.find({user:req.user._id}).sort({createdAt:-1}).limit(10).populate("relatedPost","content")
     res.json(activity)
    } catch (error:any) {
        res.json({message:error.message || "Server error"}).status(500)
    }
}