import { useCallback, useEffect, useState } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { SetTransactionApprovalParams, Transaction } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types"

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch()
  const [approvalMap, setApprovalMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (transactions) {
      const newApprovalMap = { ...approvalMap }
      let changed = false
      transactions.forEach(transaction => {
        if (!(transaction.id in newApprovalMap)) {
          newApprovalMap[transaction.id] = transaction.approved
          changed = true
        }
      })
      if (changed) {
        setApprovalMap(newApprovalMap)
      }
    }
  }, [transactions])

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })
      setApprovalMap(prevMap => ({
        ...prevMap,
        [transactionId]: newValue
      }))
    },
    [fetchWithoutCache]
  )

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={{
            ...transaction,
            approved: approvalMap[transaction.id] ?? transaction.approved
          }}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  )
}