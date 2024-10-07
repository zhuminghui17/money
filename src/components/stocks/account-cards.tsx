import AccountCard, { type Account } from "./account-card"

const AccountCards = ({ props: accounts }: { props: Account[] }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
        {accounts && accounts.map((account: Account, idx: number) => <AccountCard key={`acc_${idx}`} props={account} />)}
    </div>
  )
}

export default AccountCards