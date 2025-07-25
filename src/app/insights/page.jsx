import { getMembersAction } from "@/app/actions/member-actions"
import { getTypesAction } from "../actions/type-actions";
import { getAllExpensesAction } from "../actions/expense-actions";
import InsightFilter from "@/components/insight-filter";
import InsightDisplay from "@/components/insight-display";
export const dynamic = "force-dynamic";

export default async function InsightsPage({searchParams}) {
  const params = await searchParams
  const [expensesResponse,membersResponse,typesResponse] = await Promise.all([getAllExpensesAction(params),getMembersAction(),getTypesAction()])
  
  return (
    <div className="max-w-6xl mx-auto ">
        <h1 className="text-3xl font-bold mb-6">Insights</h1>
        <InsightFilter members={membersResponse.data || []} types={(typesResponse.data || []).filter(item=>item.name!=='Settle Dues')} params = {params} />
        <InsightDisplay members={membersResponse.data || []} expenses={(expensesResponse || []).filter(item=>item.type!=='Settle Dues')}/>
    </div>
  )
}
