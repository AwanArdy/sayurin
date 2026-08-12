import z from "zod";

export const registerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
});

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string(),
});

export const calculateCartSchema = z.object({
  servings: z.number().min(1, 'Input porsi harus lebih dari 0'),
  pantry_ingredient_ids: z.array(z.string()).default([]),
});

export const checkoutSchema = z.object({
  items: z.array(z.object({
    product_id: z.string(),
    quantity: z.number().min(1)
  })),
  substitution_policy: z.enum(['auto_similiar','whatsapp_confirm', 'auto_refund']),
  shipping_address_id: z.string()
});
