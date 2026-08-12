export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

export function parseNutritionTags(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

const NUTRITION_LABELS: Record<string, string> = {
  fiber: 'Kaya Serat',
  high_fiber: 'Tinggi Serat',
  iron: 'Zat Besi',
  low_carb: 'Rendah Kalori',
  uric_acid_safe: 'Aman Asam Urat',
  vitamin_c: 'Vitamin C',
  protein: 'Tinggi Protein',
}

export function nutritionLabel(tag: string): string {
  return NUTRITION_LABELS[tag] ?? tag
}

export function parseInstructions(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}