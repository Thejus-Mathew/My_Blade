"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db"
import Member from "@/models/member"
import Expense from "@/models/expense"

export async function getMembersAction() {
  try {
    await connectDB()
    const members = await Member.find()
    return {success:true,data:JSON.parse(JSON.stringify(members))}
  } catch (error) {
    console.error("Error getting members:", error)
    return {success:false,message:"Failed to fetch Members data",data:[]}
  }
}

export async function addMemberAction(name) {
  try {
    await connectDB()

    // Check if member with same name exists (case insensitive)
    const existingMember = await Member.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    })

    if (existingMember) {
      return { success: false, message:"A member with this name already exists" }
    }

    const member = new Member({ name })
    await member.save()

    revalidatePath("/members")

    return { success: true, member:JSON.parse(JSON.stringify(member)) }
  } catch (error) {
    console.error("Error adding member:", error)
  }
}

export async function deleteMemberAction(id) {
  try {
    await connectDB()

    await Member.findByIdAndDelete(id)

    revalidatePath("/members")

    return { success: true }
  } catch (error) {
    console.error("Error deleting member:", error)
    return {success: false,message:"Error deleting member"}
  }
}

export async function canDeleteMemberAction(name) {
  try {
    await connectDB()

    const expenses = await Expense.find()

    const dues = {[name]:{[name]:0}}

    expenses.forEach((expense) => {
      const paidBy = expense.paidBy

      expense.splits.forEach((split) => {
        const member = split.member
        if(paidBy!==name && member !==name) return

        if (paidBy === member) return
        dues[paidBy] = dues[paidBy] || {}
        dues[member] = dues[member] || {}
        dues[paidBy][member]=(dues[paidBy][member] || 0) + split.amount
        dues[member][paidBy]=(dues[member][paidBy] || 0) - split.amount
      })
    })

    const amount = Object.values(dues[name]).reduce((a,b)=>a+b,0)

    return { canDelete: amount<1 && amount>-1 }
  } catch (error) {
    console.error("Error checking if member can be deleted:", error)
    return {canDelete:false}
  }
}
