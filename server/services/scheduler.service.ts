import cron from 'node-cron'
import { Post } from "../model/Post.js";
import Account from '../model/account.js';
import zernio from '../config/zernio.js';
import { ActivityLog } from '../model/activityLog.js'; 


export const initScheduler = () =>{
        cron.schedule("* * * * *",async()=>{
        try {
            const now = new Date()
            const postToPublish = await Post.find({status:"scheduled",scheduledFor:{$lt:now}})
            for(const post of postToPublish){
            try {
                const accounts = await Account.find({
                    user:post.user,
                    platform:{$in:post.platforms},
                    status:"connected",
                    zernioAccountId:{$exists:true}
            
                
                })
                if(accounts.length === 0){
                    console.log("No connected Zernio accounts;")
                    continue;
                }
                const zernioPlatforms = accounts.map((acc)=>({
                    platform:acc.platform as any,
                    accountId : acc.zernioAccountId!
                }))
                const payload = {
                    content:post.content,publishNow:true,
                    ...(post.mediaUrl ? {mediaItems:[{type:post.mediaType || "image",url:post.mediaUrl}]}: {}),
                    platforms:zernioPlatforms
                }
                console.log(`Publishing post ${post._id} to Zernio with media: ${post.mediaUrl || "none"}`)
                const response = await zernio.posts.createPost({
                    body:payload
                })
                const publishedPost = (response.data as any)?.post || response.data

                if(!publishedPost){
                    throw new Error("failed to get post from Zernio response")
                }
                post.status = 'published';
                await post.save()

                await ActivityLog.create({
                    user:post.user,
                    actionType:"POST_PUBLISHED",
                    discription:`Published post to ${accounts.map((a) =>a.platform).join(",")}`,
                    relatedPost:post._id
                })

            } catch (err:any) {
                console.error(`failed to publish post ${post._id}:`,err?.message?.data || err?.message)
                post.status = "failed";
                await post.save();
            }
            }
            if(postToPublish.length >0){
                console.log(`Evaluted ${postToPublish.length} posts at ${now.toISOString()}`)
            }
        } catch (error) {
            console.error("Error in scheduler", error)
        }
        })
        console.log("Scheduler service initialized")
}
