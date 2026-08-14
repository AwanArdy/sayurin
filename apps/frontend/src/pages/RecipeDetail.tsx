import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getRecipe, type RecipeDetail } from '../lib/api'
import { demoRecipeDetail } from '../data/demo'
import { formatRupiah, parseInstructions, difficultyLabel } from '../lib/format'
import { recipeImage } from '../lib/images'
import { useAppStore } from '../store/context'
import { Icon } from '../components/Icon'

type IngredientWise = RecipeDetail['ingredients'][number]

export function RecipeDetailPage() {
  const { id = '' } = useParams()
  const { addToCart } = useAppStore()

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null)
  const [servings, setServings] = useState(2)
  const [pantryIds, setPantryIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getRecipe(id)
      .then((r) => {
        if (!cancelled) setRecipe(r)
      })
      .catch(() => {
        if (!cancelled) setRecipe(demoRecipeDetail)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const togglePantry = (ingredientId: string) => {
    setPantryIds((prev) =>
      prev.includes(ingredientId)
        ? prev.filter((x) => x !== ingredientId)
        : [...prev, ingredientId],
    )
  }

  const itemsToBuy = useMemo(() => {
    if (!recipe) return []
    return recipe.ingredients
      .filter((ing) => !pantryIds.includes(ing.id))
      .map((ing) => ({
        ingredient: ing,
        amount: ing.amountPerServing * servings,
      }))
  }, [recipe, servings, pantryIds])

  const totalPrice = useMemo(
    () => itemsToBuy.reduce((sum, item) => sum + item.ingredient.product.price, 0),
    [itemsToBuy],
  )

  const addAllToCart = () => {
    itemsToBuy.forEach((item) => addToCart(item.ingredient.product, 1))
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-6 py-[48px] text-center text-on-surface-variant">
        Memuat resep…
      </main>
    )
  }

  if (!recipe) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-6 py-[48px] text-center">
        <h1 className="text-[24px] font-bold text-primary">Resep tidak ditemukan</h1>
        <Link
          to="/resep"
          className="mt-4 inline-block rounded-full bg-primary-container px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.05em] text-on-primary"
        >
          Lihat Semua Resep
        </Link>
      </main>
    )
  }

  const steps = parseInstructions(recipe.instructions)

  return (
    <main className="mx-auto w-full max-w-[1200px] space-y-[48px] px-6 py-[48px]">
      {/* Hero */}
      <section className="relative h-[400px] w-full overflow-hidden rounded-[24px] bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.05)] md:h-[500px]">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={recipeImage(recipe)}
          alt={recipe.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="absolute bottom-0 left-0 flex w-full flex-col items-end justify-between gap-4 p-8 md:flex-row">
          <div>
            <h1 className="mb-4 text-[24px] font-bold leading-8 text-surface-container-lowest md:text-[32px] md:leading-10">
              {recipe.title}
            </h1>
            <div className="flex gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-lowest/20 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.05em] text-surface-container-lowest backdrop-blur-md">
                <Icon name="timer" size={16} /> {recipe.cookingTimeMins ?? 15} Menit
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-lowest/20 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.05em] text-surface-container-lowest backdrop-blur-md">
                <Icon name="restaurant" size={16} /> {difficultyLabel(recipe.cookingTimeMins)}
              </span>
            </div>
          </div>
          <span className="rounded-full bg-surface-container-lowest/20 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.05em] text-surface-container-lowest backdrop-blur-md">
            {servings} Porsi
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: steps */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          <section>
            <h2 className="mb-6 text-[24px] font-semibold leading-8 text-primary">
              Langkah Memasak
            </h2>
            <div className="relative flex flex-col gap-6">
              <div className="absolute bottom-6 left-6 top-6 hidden w-0.5 bg-outline-variant/30 md:block" />
              {steps.length > 0 ? (
                steps.map((step, i) => (
                  <div key={i} className="group relative z-10 flex items-start gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-container font-bold text-[24px] leading-8 text-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.1)] transition-transform group-hover:-translate-y-1">
                      {i + 1}
                    </div>
                    <div className="flex-grow rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
                      <p className="text-on-surface">{step}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest p-6 text-on-surface-variant">
                  Langkah memasak untuk resep ini akan segera diisi oleh tim kami.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right: pantry & cart widget */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-[100px]">
            <div className="flex flex-col gap-6 rounded-[24px] border-2 border-primary-container bg-surface-bright p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
              <div className="text-center">
                <h3 className="mb-2 text-[24px] font-semibold leading-8 text-primary">
                  Atur Porsi &amp; Cek Pantry
                </h3>
                <p className="text-[14px] leading-5 text-on-surface-variant">
                  Sesuaikan bahan belanjaan Anda
                </p>
              </div>

              {/* Portion stepper */}
              <div className="flex items-center justify-between rounded-[24px] bg-surface-container-lowest p-4 shadow-sm">
                <span className="text-[14px] font-semibold leading-5 text-on-surface">
                  Jumlah Porsi:
                </span>
                <div className="flex items-center gap-3 rounded-full bg-surface-container px-2 py-1">
                  <button
                    type="button"
                    aria-label="Kurangi porsi"
                    onClick={() => setServings((s) => Math.max(1, s - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-variant"
                  >
                    <Icon name="remove" />
                  </button>
                  <span className="w-14 text-center text-[16px] font-bold leading-6 text-primary">
                    {servings} Porsi
                  </span>
                  <button
                    type="button"
                    aria-label="Tambah porsi"
                    onClick={() => setServings((s) => Math.min(16, s + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-variant"
                  >
                    <Icon name="add" />
                  </button>
                </div>
              </div>

              {/* Ingredient list */}
              <div className="flex flex-col gap-3">
                {recipe.ingredients.map((ing: IngredientWise) => {
                  const inPantry = pantryIds.includes(ing.id)
                  const amount = ing.amountPerServing * servings
                  return (
                    <div
                      key={ing.id}
                      className={`flex items-center justify-between gap-4 rounded-[24px] p-4 ${
                        inPantry
                          ? 'border border-dashed border-primary-container bg-surface-container/50 opacity-75'
                          : 'border border-primary-container bg-surface-container-lowest'
                      }`}
                    >
                      <div className="flex-grow">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <span
                            className={`text-[16px] font-bold leading-6 ${
                              inPantry
                                ? 'text-on-surface-variant line-through'
                                : 'text-primary'
                            }`}
                          >
                            {ing.product.name}
                          </span>
                          <span className="text-[14px] font-bold leading-5 text-primary">
                            {amount} {ing.unit ?? ing.product.unit}
                          </span>
                        </div>
                        {inPantry ? (
                          <p className="flex items-center gap-1 text-[14px] leading-5 text-on-surface-variant">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[12px] font-semibold uppercase tracking-[0.05em] ${
                                inPantry
                                  ? 'bg-surface-variant text-on-surface-variant'
                                  : ''
                              }`}
                            >
                              Di Dapur
                            </span>
                          </p>
                        ) : (
                          <p className="text-[14px] leading-5 text-on-surface-variant">
                            Disesuaikan untuk {servings} porsi
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center justify-center">
                        <input
                          type="checkbox"
                          checked={inPantry}
                          onChange={() => togglePantry(ing.id)}
                          aria-label={`Tandai ${ing.product.name} ada di pantry`}
                          className="h-6 w-6 cursor-pointer rounded border-2 border-primary-container accent-primary-container"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={addAllToCart}
                disabled={itemsToBuy.length === 0}
                className="mt-2 w-full rounded-full bg-primary-container py-4 text-[16px] font-bold text-surface-container-lowest transition-all duration-200 hover:-translate-y-1 hover:bg-primary hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {itemsToBuy.length > 0
                  ? `Tambah ${itemsToBuy.length} Bahan Sisa ke Keranjang - ${formatRupiah(totalPrice)}`
                  : 'Semua Bahan Sudah di Pantry'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}