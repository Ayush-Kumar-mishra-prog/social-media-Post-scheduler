import mongoose from 'mongoose'
const accountSchema = new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    platform:{type:String,enum:['facebook','twitter','linkedin','instagram','facebook_page','linkedin_page','instagram_business'],required:true},
    handle:{type:String,required:true},
    zernioAccountId:{type:String},
    accessToken:{type:String},
    refreshToken:{type:String},
    tokenExpiry:{type:Date},
    status:{type:String,enum:['connected','disconnected'],default:'connected'},
    avatarUrl:{type:String},
},{timestamps:true})

export const Account = mongoose.model('Account',accountSchema)
export default Account