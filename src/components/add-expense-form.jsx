"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import Button from "./button"
import Card from "./card"
import { addExpenseAction } from "@/app/actions/expense-actions"

export default function AddExpenseForm({ members , types}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState({})
  const [splitAmounts, setSplitAmounts] = useState({})
  const [manualSplits, setManualSplits] = useState({})
  const [extraInfo,setExtraInfo]=useState(false)
  const [paidThrough,setPaidThrough]=useState('Bank Transfer')
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm()

  const totalAmount = watch("totalAmount")
  
  useEffect(()=>{
    const names = Object.entries(selectedMembers).filter(([_,item])=>item).map(([name,_])=>name)
    if (names.length===0) {setSplitAmounts({});return}

    const newManual = {}
    names.forEach(name=>{
      if(manualSplits[name]!==undefined) newManual[name]=manualSplits[name]
    })

    if(Object.keys(newManual).length===names.length) {setSplitAmounts(newManual);return}

    const amount = (totalAmount - Object.values(newManual).reduce((a,b)=>a+b,0))/(names.length-Object.keys(newManual).length)

    const newSplit = {}

    names.forEach(name=>{
      newSplit[name] = newManual[name]!==undefined?newManual[name]:amount>0?Number(amount.toFixed(2)):0
    })

    setSplitAmounts(newSplit)

  },[totalAmount,selectedMembers,manualSplits])
  


  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)

      // Validate that total amount equals total split amount
      const totalSplitAmount = Object.values(splitAmounts).reduce((a,b)=>a+b,0)
      if (Math.abs(totalSplitAmount - data.totalAmount) > 0.02) {
        toast.error("Total amount must equal the sum of all split amounts")
        return
      }
      

      // Submit expense
      const res = await addExpenseAction({
        ...data,
        splits:Object.entries(splitAmounts).map(([member,amount])=>({member,amount})),
        paidThrough,
      })

      if(!res.success){
        throw new Error(res.message)
      }

      toast.success("Expense added successfully")

      // Reset form
      setValue("type", "")
      setValue("totalAmount", 0)
      setValue("paidBy","")
      setValue("extraInfo","")

      setManualSplits({})
      setSelectedMembers({})
    } catch (error) {
      console.error("Error adding expense:", error)
      toast.error("Failed to add expense")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Expense Type*
            </label>
            <select
              id="type"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:text-gray-200"
              {...register("type", { required: "Expense type is required",onChange:(e)=>{setValue("extraInfo", "");setExtraInfo(['Others','EMI','Misc'].includes(e.target.value))} })}
            >
              <option value="" className="dark:text-gray-800">Select the Expense Type</option>
              {types.map((type) => (
                <option className="dark:text-gray-800" key={type._id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
          </div>

          {extraInfo && <div>
            <label htmlFor="extraInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Expense Type*
            </label>
            <input
              id="extraInfo"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Expense Type"
              {...register("extraInfo", {required: "Expense type is required"})}
            />
            {errors.extraInfo && <p className="mt-1 text-sm text-red-600">{errors.extraInfo.message}</p>}
          </div>}
          <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Total Amount*
            </label>
            <input
              id="totalAmount"
              type="number"
              step="0.01"
              min="0.01"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="0.00"
              {...register("totalAmount", {
                required: "Total amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
                valueAsNumber: true,
              })}
            />
            {errors.totalAmount && <p className="mt-1 text-sm text-red-600">{errors.totalAmount.message}</p>}
          </div>

          <div>
            <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Paid By*
            </label>
            <select
              id="paidBy"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:text-gray-200"
              {...register("paidBy", { required: "Paid by is required", onChange:(e)=>{if(e.target.value) setSelectedMembers({...selectedMembers,[e.target.value]:true})}})}
            >
              <option value="" className="dark:text-gray-800">Select a person</option>
              {members.map((member) => (
                <option className="dark:text-gray-800" key={member._id} value={member.name}>
                  {member.name}
                </option>
              ))}
            </select>
            {errors.paidBy && <p className="mt-1 text-sm text-red-600">{errors.paidBy.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Payment Mode
            </label>
            <div className="w-full p-1 rounded-md border border-gray-300 flex justify-around">
                <button type="button" onClick={() => setPaidThrough("Bank Transfer")} 
                    className={`px-3 py-2 w-50 rounded-md text-sm font-medium transition ${paidThrough === "Bank Transfer"
                        ? "bg-white dark:bg-gray-200 text-black dark:text-black shadow-sm"
                        : "text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white"}`}
                >
                    Bank Transfer
                </button>
                <button type="button" onClick={() => setPaidThrough("Credit Card")} 
                    className={`px-3 py-1 w-50 rounded-md text-sm font-medium transition ${paidThrough === "Credit Card"
                        ? "bg-white dark:bg-gray-200 text-black dark:text-black shadow-sm"
                        : "text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white"}`}
                >
                    Credit Card
                </button>
              </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Split Among</h3>

          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex flex-wrap gap-4 mb-4">
              {members.map((member) => (
                <label key={member._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                    checked={selectedMembers[member.name] || false}
                    onChange={(e) => setSelectedMembers({...selectedMembers,[member.name]:e.target.checked})}
                  />
                  <span className="dark:text-gray-700">{member.name}</span>
                </label>
              ))}
            </div>

            {totalAmount > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span  className="dark:text-gray-900">Person</span>
                  <span  className="dark:text-gray-900">Split Amount</span>
                </div>

                {members.map((member) =>
                    selectedMembers[member.name] && (
                      <div key={member._id} className="flex items-center justify-between">
                        <span className="dark:text-gray-600">{member.name}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={Number((manualSplits[member.name] || splitAmounts[member.name] || 0).toFixed(2))}
                            onChange={(e) => setManualSplits({...manualSplits,[member.name]:Number(e.target.value)})}
                            className="w-24 rounded-md border border-gray-300 px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-purple-600 dark:text-gray-600"
                          />
                          {manualSplits[member.name] && (
                            <button
                              type="button"
                              onClick={() => setManualSplits((pre)=>{
                                const {[member.name]:_,...rest}= pre
                                return rest
                              })}
                              className="text-xs text-purple-600 hover:text-purple-800"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    ),
                )}

                <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
                  <span className="dark:text-gray-800">Total</span>
                  <span className={Math.abs(Object.values(splitAmounts).reduce((a,b)=>a + b,0) - (totalAmount || 0)) > 0.02 ? "text-red-600" : "dark:text-gray-800"}>
                    ₹{Object.values(splitAmounts).reduce((a,b)=>a + b,0).toFixed(2)} / ₹{totalAmount?.toFixed(2) || "0.00"}
                  </span>
                </div>

                {Math.abs(Object.values(splitAmounts).reduce((a,b)=>a + b,0) - (totalAmount || 0)) > 0.02 && (
                  <p className="text-sm text-red-600">Total split amount must equal the total expense amount</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={Math.abs(Object.values(splitAmounts).reduce((a,b)=>a + b,0) - (totalAmount || 0)) > 0.02}
          >
            Add Expense
          </Button>
        </div>
      </form>
    </Card>
  )
}
