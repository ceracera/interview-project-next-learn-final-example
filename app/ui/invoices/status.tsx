import { CheckIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function InvoiceStatus({ status, overdue }: { status: string, overdue: boolean }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'bg-red-500 text-white': status === 'pending' && overdue,
          'bg-gray-100 text-gray-500': status === 'pending' || status === 'canceled',
          'bg-green-500 text-white': status === 'paid',
        },
      )}
    >
      {status === 'pending' && overdue ? (
        <>
          Overdue
          <ClockIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
      {status === 'pending' && !overdue ? (
        <>
          Pending
          <ClockIcon className="ml-1 w-4 text-gray-500" />
        </>
      ) : null}
      {status === 'paid' ? (
        <>
          Paid
          <CheckIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
      {status === 'canceled' ? (
        <>
          Canceled
          <TrashIcon className="ml-1 w-4 text-gray-500" />
        </>
      ) : null}
    </span>
  );
}
