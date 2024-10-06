'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { auth } from "@/auth"

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid', 'canceled'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
  prevStatus: z.string().nullable(),
});

const InvoiceStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'paid', 'canceled'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  action: z.enum(['change', 'restore']),
  invoiceId: z.string(),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ date: true, id: true });
const UpdateInvoiceStatus = InvoiceStatusSchema.omit({ date: true, id: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoiceStatus(
  id: string,
  invoiceStatus: string,
  statusAction: string,
) {
  const session = await auth()
  const validatedFields = UpdateInvoiceStatus.safeParse({
    invoiceId: id,
    status: invoiceStatus,
    action: statusAction,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice status.',
    };
  }

  const { status, action, invoiceId } = validatedFields.data;

  const logDate = new Date().toISOString().split('T')[0];

  try {
    await sql`
      UPDATE invoices
      SET status = ${invoiceStatus}
      WHERE id = ${invoiceId}
    `;
    await sql`
      INSERT INTO invoice_status_log (user_id, invoice_id, date, status, action)
      VALUES (${session?.user?.id}, ${invoiceId}, ${logDate}, ${status}, ${action})
    `;
  } catch (error) {
    console.log(error)
    return { message: 'Database Error: Failed to Update Invoice status.' };
  }

  revalidatePath('/', 'layout');
  // redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const session = await auth()
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
    prevStatus: formData.get('prevStatus'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status, prevStatus } = validatedFields.data;
  const amountInCents = amount * 100;

  const logDate = new Date().toISOString().split('T')[0];

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
    prevStatus !== status && await sql`
      INSERT INTO invoice_status_log (user_id, invoice_id, date, status, action)
      VALUES (${session?.user?.id}, ${id}, ${logDate}, ${status}, 'change')
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

/*
export async function deleteInvoice(id: string) {
  // throw new Error('Failed to Delete Invoice');

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}
*/

export async function deleteInvoice(
  id: string,
) {
  const session = await auth()
  const logDate = new Date().toISOString().split('T')[0];

  try {
    await sql`
      UPDATE invoices
      SET status = 'canceled'
      WHERE id = ${id}
    `;
    await sql`
      INSERT INTO invoice_status_log (user_id, invoice_id, date, status, action)
      VALUES (${session?.user?.id}, ${id}, ${logDate}, 'canceled', 'change')
    `;
  } catch (error) {
    console.log(error)
    return { message: 'Database Error: Failed to set invoice status to canceled.' };
  }

  revalidatePath('/dashboard/invoices');
  // redirect('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
