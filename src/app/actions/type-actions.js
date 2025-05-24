"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db"
import Type from "@/models/types"

export async function getTypesAction() {
  try {
    await connectDB()
    const types = await Type.find()
    return {success:true,data:JSON.parse(JSON.stringify(types))}
  } catch (error) {
    console.error("Error getting Expense Types:", error)
    return {success:false,message:"Failed to Fetch Expense Types",data:[]}
  }
}

export async function addTypeAction(name) {
  try {
    await connectDB()

    const existingType = await Type.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    })

    if (existingType) {
        return { success: false, message:"Expense Type already exists" }
    }

    const type = new Type({ name })
    await type.save()

    revalidatePath("/expense-types")

    return { success: true, type:JSON.parse(JSON.stringify(type)) }
  } catch (error) {
    console.error("Error adding expense type:", error)
    return {success:false,message:"Error adding expense type"}
  }
}

export async function deleteTypeAction(type) {
  try {
    await connectDB()

    await Type.findByIdAndDelete(type._id)

    revalidatePath("/expense-types")

    return { success: true }
  } catch (error) {
    console.error("Error deleting Expense Type:", error)
    return {success: false,message:"Error deleting Expense Type"}
  }
}
