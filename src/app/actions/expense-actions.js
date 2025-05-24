"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db"
import Expense from "@/models/expense"

export async function addExpenseAction(data) {
  
  try {
    await connectDB()
    
    const expense = new Expense({
      type: data.type,
      totalAmount: data.totalAmount,
      paidBy: data.paidBy,
      splits: data.splits,
      paidThrough: data.paidThrough,
      extraInfo:data.extraInfo || null
    })

    await expense.save()
    revalidatePath("/")
    revalidatePath("/expenses")
    revalidatePath("/dues")

    return { success: true }
  } catch (error) {
    console.error("Error adding expense:", error)
    return {success:false,message:error.message|| 'Failed to Add Expense'}
  }
}

export async function getAllExpensesAction(filters) {
  try {
    await connectDB()

    const { startDate, endDate, paidBy, paidThrough, type} = filters

    const query = {}    

    if (startDate && endDate) {
        query.date = {
        $gte: new Date(`${startDate}T00:00:00+05:30`),
        $lte: new Date(`${endDate}T00:00:00+05:30`)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(`${startDate}T00:00:00+05:30`) };
    } else if (endDate) {
      query.date = { $lte: new Date(`${endDate}T00:00:00+05:30`) };
    }

    if (paidBy) {
      query.paidBy = paidBy
    }

    if (paidThrough) {
      query.paidThrough = paidThrough
    }

    if (type) {
      query.type = type
    }


    const expenses = await Expense.find(query).sort({ date: -1 })


    return JSON.parse(JSON.stringify(expenses))
  } catch (error) {
    console.error("Error getting expenses:", error)
    return []
  }
}


export async function deleteExpenseAction(id) {
  try {
    await connectDB()

    await Expense.findByIdAndDelete(id)

    revalidatePath("/expenses")
    revalidatePath("/dues")

    return { success: true }
  } catch (error) {
    console.error("Error deleting expense:", error)
  }
}

export async function getDuesAction() {
  try {
    await connectDB()

    const expenses = await Expense.find()

    const dues = {}

    expenses.forEach((expense) => {
      const paidBy = expense.paidBy

      expense.splits.forEach((split) => {
        const member = split.member        

        if (paidBy === member) return

        dues[paidBy] = dues[paidBy] || {}
        dues[member] = dues[member] || {}
        
        dues[paidBy][member]=(dues[paidBy][member] || 0) + split.amount
        dues[member][paidBy]=(dues[member][paidBy] || 0) - split.amount
      })
    })

    return JSON.parse(JSON.stringify(dues))
  } catch (error) {
    console.error("Error calculating dues:", error)
    return {}
  }
}

export async function getAnExpenseAction(id) {  
  try {
    await connectDB()
    const expense = await Expense.findOne({_id:id})

    return JSON.parse(JSON.stringify(expense))
  } catch (error) {
    console.error("Error getting expenses:", error)
    return {}
  }
}


export async function getExpensesAction(startDate, endDate, paidBy, type,paidThrough, page=1) {  
  
  try {
    await connectDB()
    const limit = 13
    const query = {}
    
    if (startDate && endDate) {      
      query.date = {
        $gte: new Date(`${startDate}T00:00:00+05:30`),
        $lte: new Date(`${endDate}T00:00:00+05:30`)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(`${startDate}T00:00:00+05:30`) };
    } else if (endDate) {
      query.date = { $lte: new Date(`${endDate}T00:00:00+05:30`) };
    }

    if (paidBy) {
      query.paidBy = paidBy
    }

    if (paidThrough) {
      query.paidThrough = paidThrough
    }

    if (type) {
      query.type = type
    }

    const skip = (page - 1) * limit

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Expense.countDocuments(query),
    ])

    return {
      expenses: JSON.parse(JSON.stringify(expenses)),
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error("Error getting expenses:", error)
    return { expenses: [],totalPages: 1 }
  }
}
