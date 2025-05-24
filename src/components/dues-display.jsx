"use client"

import Card from "./card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, Users } from "lucide-react"

export default function DuesDisplay({ dues }) {
  console.log(dues,"dues");
  
  const totalDues = Object.keys(dues).map(member=>{
    return {member,amount:Object.values(dues[member]).reduce((a,b)=>a+b,0)}
  })

  function calculateEffectiveDues(dues) {
  // Step 1: Remove negative values
  const cleaned = {};
  for (const payer in dues) {
    cleaned[payer] = {};
    for (const debtor in dues[payer]) {
      const amount = dues[payer][debtor];
      if (amount > 0) {
        cleaned[payer][debtor] = amount;
      }
    }
    // Remove empty objects
    if (Object.keys(cleaned[payer]).length === 0) {
      delete cleaned[payer];
    }
  }

  // Step 2: Calculate net balances for each person
  const balances = {};
  // Initialize balances for everyone involved
  Object.keys(dues).forEach(payer => {
    balances[payer] = 0;
    Object.keys(dues[payer]).forEach(debtor => {
      balances[debtor] = 0;
    });
  });

  // Calculate balances: paid reduces balance, owed increases
  for (const payer in cleaned) {
    for (const debtor in cleaned[payer]) {
      const amount = cleaned[payer][debtor];
      balances[payer] -= amount;   // payer paid money
      balances[debtor] += amount;  // debtor owes money
    }
  }

  // Step 3: Now settle the balances to get effective dues in same format
  // Positive balance means the person owes money
  // Negative balance means the person is owed money

  const payers = Object.entries(balances).filter(([_, bal]) => bal < 0);
  const debtors = Object.entries(balances).filter(([_, bal]) => bal > 0);

  const result = {};

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < payers.length) {
    const [debtorName, debtorBal] = debtors[i];
    const [payerName, payerBal] = payers[j];

    const debt = Math.min(debtorBal, -payerBal);

    if (!result[payerName]) {
      result[payerName] = {};
    }
    result[payerName][debtorName] = debt;

    // Update balances
    debtors[i][1] -= debt;
    payers[j][1] += debt;

    // Move to next debtor or payer if settled
    if (debtors[i][1] === 0) i++;
    if (payers[j][1] === 0) j++;
  }

  return result;
}
console.log(calculateEffectiveDues(dues));


  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="To Pay">
            <div className="space-y-4">
              {totalDues.filter(item=>item.amount<0).length>0?
              totalDues.filter(item=>item.amount<0)
                .map(item => (
                  <div key={item.member} className="flex justify-between items-center">
                    <span className="font-medium">{item.member}</span>
                    <span className="dark:text-red-300 text-red-600 font-medium">{formatCurrency(item.amount)}</span>
                  </div>
                )):
                <p className="text-gray-500">No dues to pay</p>
              }
            </div>
        </Card>

        <Card title="To Receive">
            <div className="space-y-4">
              {totalDues.filter(item=>item.amount>0).length>0?
              totalDues.filter(item=>item.amount>0)
                .map(item => (
                  <div key={item.member} className="flex justify-between items-center">
                    <span className="font-medium">{item.member}</span>
                    <span className="text-green-600 dark:text-green-300 font-medium">{formatCurrency(item.amount)}</span>
                  </div>
                )):
                <p className="text-gray-500">No dues to pay</p>
              }
            </div>
        </Card>
      </div>

      {/* Detailed Dues */}
      <Card title="Effective Dues">
        {Object.entries(calculateEffectiveDues(dues)).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(calculateEffectiveDues(dues)).map(([payerName, payerDues]) => (
              Object.entries(payerDues).filter(([_,due])=>due>0).map(([dueName,due]) => (
              <div key={payerName+dueName} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{dueName}</p>
                    <p className="text-sm text-muted-foreground">owes</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <p className="font-medium text-right">{payerName}</p>
                    <p className="text-sm text-muted-foreground text-right">{formatCurrency(due)}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>
              ))))}
          </div>
        ) : (
          <p className="text-gray-500">No dues to settle</p>
        )}
      </Card>
      <Card title="All Dues">
        {Object.entries(dues).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(dues).map(([payerName, payerDues]) => (
              Object.entries(payerDues).filter(([_,due])=>due>0).map(([dueName,due]) => (
              <div key={payerName+dueName} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{dueName}</p>
                    <p className="text-sm text-muted-foreground">owes</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <p className="font-medium text-right">{payerName}</p>
                    <p className="text-sm text-muted-foreground text-right">{formatCurrency(due)}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>
              ))))}
          </div>
        ) : (
          <p className="text-gray-500">No dues to settle</p>
        )}
      </Card>
    </div>
  )
}
