"use client"

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export const TabNav = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <nav>
      <ul className="inline-block mt-6 text-sm">
        <li className={`inline-block rounded-md px-3 py-1 text-gray-400 ${!searchParams.has('status') && 'text-gray-800 bg-gray-100'}`}>
          <Link href="/dashboard/invoices/">All invoices</Link>
        </li>
        <li className={`inline-block rounded-md px-3 py-1 text-gray-400 ${searchParams.get('status') === 'paid' && 'text-gray-800 bg-gray-100'}`}>
          <Link href="/dashboard/invoices/?status=paid">Paid</Link>
        </li>
        <li className={`inline-block rounded-md px-3 py-1 text-gray-400 ${searchParams.get('status') === 'pending' && 'text-gray-800 bg-gray-100'}`}>
          <Link href="/dashboard/invoices/?status=pending">Pending</Link>
        </li>
        <li className={`inline-block rounded-md px-3 py-1 text-gray-400 ${searchParams.get('status') === 'canceled' && 'text-gray-800 bg-gray-100'}`}>
          <Link href="/dashboard/invoices/?status=canceled">Canceled</Link>
        </li>
        <li className={`inline-block rounded-md px-3 py-1 text-gray-400 ${searchParams.get('status') === 'overdue' && 'text-gray-800 bg-gray-100'}`}>
          <Link href="/dashboard/invoices/?status=overdue">Overdue</Link>
        </li>
      </ul>
    </nav>
  )
}


