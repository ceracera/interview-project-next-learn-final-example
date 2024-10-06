'use client'

import { CheckIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useState } from 'react'
import { updateInvoiceStatus } from '@/app/lib/actions';

const StatusDropDown = ({
  invoiceId,
  status,
  isStatusDropDownOpen,
  setIsStatusDropDownOpen
}) => {
  // const updateInvoiceStatusWithId = updateInvoiceStatus.bind(invoiceId, status);
  const handleUpdateStatus = async (invoiceStatus) => {
    await updateInvoiceStatus(invoiceId, invoiceStatus, 'change')
    setIsStatusDropDownOpen(false)
  }

  const allStatuses = [
    'pending',
    'paid',
    'canceled',
  ]

  return (<>
    <div
      className="fixed top-0 left-0 bottom-0 right-0"
      onClick={() => setIsStatusDropDownOpen(false)}
    >
    </div>
    <div
      className="absolute top-8 z-10 bg-gray-100 text-gray-500 rounded-md"
    >

      {allStatuses.filter(x => x !== status).map((possibleStatus, i) => (
        <div
          onClick={() => handleUpdateStatus(possibleStatus)}
          className="py-1 cursor-pointer px-2 hover:bg-gray-200 hover:rounded-md"
          key={i}
        >{possibleStatus}
        </div>
      ))}
    </div>
  </>)
}

export function InvoiceStatus({
  status,
  overdue,
  invoiceId
}: {
  status: string,
  overdue: boolean,
  invoiceId: string
}) {
  const [isStatusDropDownOpen, setIsStatusDropDownOpen] = useState(false)
  const handleOpenStatusDropDown = (id, status) => {
    setIsStatusDropDownOpen(!isStatusDropDownOpen)
  }

  return (<div className="relative">
    <span
      onClick={() => handleOpenStatusDropDown(invoiceId, status)}
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs cursor-pointer',
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
    {isStatusDropDownOpen &&
      <StatusDropDown
        invoiceId={invoiceId}
        status={status}
        isStatusDropDownOpen={isStatusDropDownOpen}
        setIsStatusDropDownOpen={setIsStatusDropDownOpen}
      />
    }
  </div>);
}
