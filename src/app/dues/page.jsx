import { getMembersAction } from "@/app/actions/member-actions"
import { getDuesAction } from "@/app/actions/expense-actions"
import DuesDisplay from "@/components/dues-display"
export const dynamic = "force-dynamic";

export default async function DuesPage() {
  const dues = await getDuesAction()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dues</h1>
      <DuesDisplay dues={dues || {}} />
    </div>
  )
}
