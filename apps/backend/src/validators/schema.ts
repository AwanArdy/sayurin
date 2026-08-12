import z from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  name: z.string().trim().min(2, 'Nama minimal 2 karakter'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const calculateCartSchema = z.object({
  servings: z.number().min(1, 'Input porsi harus lebih dari 0'),
  pantry_ingredient_ids: z.array(z.string()).default([]),
});

export const checkoutSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().min(1, 'product_id wajib diisi'),
    quantity: z.number().int('quantity harus bilangan bulat').min(1, 'quantity minimal 1')
  })).min(1, 'Minimal satu item untuk checkout'),
  substitution_policy: z.enum(['auto_similiar','whatsapp_confirm', 'auto_refund']),
});
