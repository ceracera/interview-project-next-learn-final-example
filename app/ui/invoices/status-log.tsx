'use client';

import { Button } from '@/app/ui/button';
import clsx from 'clsx';
import { updateInvoiceStatus } from '@/app/lib/actions';
import { InvoiceLog } from '@/app/lib/definitions'

export default function InvoiceStatusLog({ log }) {
  const handleUpdateStatus = async (invoiceId, status) => {
    await updateInvoiceStatus(invoiceId, status, 'restore')
  }

  return (<>
    <h3 className="text-gray-400 border-b-2 py-2">Status changes</h3>
    {log?.length > 0 ?
      <div className="text-xs">
        {log.map(l => (
          <div key={l.id} className="py-2 border-b text-gray-700 group">
            <span
              className={clsx(
                'rounded-md bg-gray-200 py-1 px-2 capitalize inline-block',
                {
                  'bg-red-500 text-white': l.status === 'pending',
                  'bg-gray-100 text-gray-500': l.status === 'pending' || l.status === 'canceled',
                  'bg-green-500 text-white': l.status === 'paid',
                },
              )}
            >{l.status}</span>
            <span className="px-2 capitalize">{l.action} by</span>
            <span className="px-2 capitalize font-bold">{l.username}</span>
            <span className="px-2 capitalize">{l.date.toDateString()}</span>
            <span
              className="rounded-md bg-gray-200 py-1 cursor-pointer px-2 hidden group-hover:inline-block hover:bg-blue-500 hover:text-white"
              onClick={() => handleUpdateStatus(l.invoice_id, l.status)}
            >Restore this status</span>
          </div>
        ))}
      </div>
      : <div className="py-2 text-gray-400">No changes</div>
    }
  </>)
}
