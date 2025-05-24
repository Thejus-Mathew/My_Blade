import { getMembersAction } from "@/app/actions/member-actions"
import ExpensesDisplay from "@/components/expenses-display"
import { getTypesAction } from "../actions/type-actions";
import { getExpensesAction } from "../actions/expense-actions";
export const dynamic = "force-dynamic";

export default async function ExpensesPage({searchParams}) {
  const params = await searchParams

  if(!params?.startDate){
    const now = new Date();
    const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;    
    params.startDate = firstDay
  }
  const {startDate,endDate,paidBy,type,paidThrough,page} = params
  const [expensesResponse,membersResponse,typesResponse] = await Promise.all([getExpensesAction(startDate,endDate,paidBy,type,paidThrough,page),getMembersAction(),getTypesAction()])

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Expenses</h1>
       <ExpensesDisplay members={membersResponse.data || []} types={typesResponse.data || []} expenses={expensesResponse.expenses || []} totalPages={expensesResponse.totalPages || 1} params = {params} />
    </div>
  )
}
