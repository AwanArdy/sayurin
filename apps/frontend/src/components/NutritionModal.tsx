import type { Product } from '../lib/api'
import { parseNutritionTags, nutritionLabel } from '../lib/format'
import { productImage } from '../lib/images'
import { useAppStore } from '../store/AppStore'
import { Icon } from './Icon'

interface Nutrient {
  label: string
  value: string
  pct: string
}

interface NutritionFact {
  tags: string[]
  macro: Nutrient[]
  vitamin: Nutrient[]
  mineral: Nutrient[]
}

function nutritionFacts(product: Product): NutritionFact {
  const tags = parseNutritionTags(product.nutritionTags)
  const base: NutritionFact = {
    tags,
    macro: [
      { label: 'Kalori', value: '23 kcal', pct: '1%' },
      { label: 'Serat', value: '4.2g', pct: '17%' },
    ],
    vitamin: [{ label: 'Vitamin C', value: '35mg', pct: '40%' }],
    mineral: [{ label: 'Zat Besi', value: '2.1mg', pct: '12%' }],
  }
  const slug = product.slug
  if (slug.includes('wortel')) {
    base.macro = [
      { label: 'Kalori', value: '41 kcal', pct: '2%' },
      { label: 'Serat', value: '2.8g', pct: '11%' },
    ]
    base.vitamin = [{ label: 'Vitamin A', value: '835µg', pct: '93%' }]
  }
  if (slug.includes('brokoli')) {
    base.macro = [
      { label: 'Kalori', value: '34 kcal', pct: '2%' },
      { label: 'Serat', value: '2.6g', pct: '10%' },
    ]
    base.vitamin = [{ label: 'Vitamin C', value: '89mg', pct: '99%' }]
  }
  if (slug.includes('tomat')) {
    base.macro = [
      { label: 'Kalori', value: '18 kcal', pct: '1%' },
      { label: 'Serat', value: '1.2g', pct: '5%' },
    ]
    base.vitamin = [{ label: 'Vitamin C', value: '14mg', pct: '16%' }]
  }
  return base
}

function Row({ nutrient }: { nutrient: Nutrient }) {
  return (
    <div className="flex items-center justify-between border-b border-outline-variant/30 py-2">
      <span className="text-[16px] leading-6 text-on-surface">{nutrient.label}</span>
      <div className="flex items-center gap-4">
        <span className="text-[16px] leading-6 text-secondary">{nutrient.value}</span>
        <span className="flex w-12 items-center justify-center rounded-full bg-primary-container px-1 py-0.5 text-center text-[12px] leading-4 text-surface-container-lowest">
          {nutrient.pct}
        </span>
      </div>
    </div>
  )
}

export function NutritionModal() {
  const { nutritionProduct, closeNutrition } = useAppStore()

  if (!nutritionProduct) return null

  const facts = nutritionFacts(nutritionProduct)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        aria-label="Tutup modal"
        className="absolute inset-0 bg-primary-container/40"
        onClick={closeNutrition}
      />
      <div className="relative flex max-h-[90vh] w-full max-w-[480px] flex-col overflow-hidden rounded-[24px] bg-surface-container-lowest shadow-[0px_12px_40px_rgba(0,0,0,0.08)]">
        {/* Header */}
        <div className="z-10 flex items-center justify-between border-b border-primary-container bg-surface-container-lowest px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              className="h-12 w-12 rounded-xl border border-outline-variant object-cover"
              src={productImage(nutritionProduct)}
              alt={nutritionProduct.name}
            />
            <div>
              <h2 className="text-[24px] font-semibold leading-8 text-primary-container">
                Info Gizi: {nutritionProduct.name}
              </h2>
              <p className="text-[12px] leading-4 text-primary-container">
                Berdasarkan porsi 100 gram
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={closeNutrition}
            className="flex items-center justify-center rounded-full p-2 text-primary-container transition-colors hover:bg-surface-container-low"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {facts.tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {facts.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-primary-container px-3 py-1 text-[12px] leading-4 text-primary-container"
                >
                  {nutritionLabel(tag)}
                </span>
              ))}
            </div>
          )}

          <div className="mb-6">
            <h3 className="mb-2 text-[14px] font-semibold uppercase tracking-wider text-primary-container">
              Makronutrien
            </h3>
            <div className="flex flex-col border-t border-outline-variant/30">
              {facts.macro.map((n) => (
                <Row key={n.label} nutrient={n} />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 text-[14px] font-semibold uppercase tracking-wider text-primary-container">
              Vitamin
            </h3>
            <div className="flex flex-col border-t border-outline-variant/30">
              {facts.vitamin.map((n) => (
                <Row key={n.label} nutrient={n} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-[14px] font-semibold uppercase tracking-wider text-primary-container">
              Mineral
            </h3>
            <div className="flex flex-col border-t border-outline-variant/30">
              {facts.mineral.map((n) => (
                <Row key={n.label} nutrient={n} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="z-10 border-t border-primary-container bg-surface-container-lowest p-6">
          <button
            type="button"
            onClick={closeNutrition}
            className="w-full rounded-xl border border-primary-container bg-[#EEF5F7] py-3 text-[14px] font-semibold text-primary-container transition-colors hover:bg-surface-container-low"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}