import { Card } from '@tremor/react';
import { OfficeBuildingIcon, CurrencyDollarIcon } from '@heroicons/react/outline';

export interface Account {
    name: string;
    type: string;
    balance: number;
    available: number;
}

const AccountCard = ({ props: account }: { props: Account }) => {
  return (
    <Card
      className="mx-auto"
      decoration="top"
      decorationColor="indigo"
    >
      <div className='flex items-center mb-2'>
        <OfficeBuildingIcon className='w-14 me-2' />
        <div>
            <p className="text-2xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">{account.name}</p>
            <p className="text-tremor-content dark:text-dark-tremor-content">{account.type}</p>
        </div>
      </div>
      <div className='flex items-center ps-2'>
        <CurrencyDollarIcon className='w-6 me-1' />
        <p className="text-xl text-tremor-content-strong dark:text-dark-tremor-content-strong">Balance: {account.balance}</p>
      </div>
      <div className='flex items-center ps-2'>
        <CurrencyDollarIcon className='w-6 me-1' />
        <p className="text-xl text-tremor-content-strong dark:text-dark-tremor-content-strong">Available: {account.available}</p>
      </div>
    </Card>
  )
}

export default AccountCard;