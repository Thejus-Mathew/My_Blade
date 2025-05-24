import mongoose, { Schema, models } from "mongoose"

const MemberSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    unique: true,
    trim: true,
  }
})


const Member = models.Member || mongoose.model("Member", MemberSchema)

export default Member
