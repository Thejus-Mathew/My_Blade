import AddExpenseForm from "@/components/add-expense-form"
import { getMembersAction } from "@/app/actions/member-actions"
import { getTypesAction } from "./actions/type-actions";
export const dynamic = "force-dynamic";

export default async function Home() {
  const membersResponse = await getMembersAction()
  const members = membersResponse.success?membersResponse.data:[]
  const typesResponse = await getTypesAction()
  const types = typesResponse.success?typesResponse.data:[]
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add Expense</h1>
      <AddExpenseForm members={members} types={types}/>
    </div>
  )
}
