import { useEffect, useState } from 'react'
import { getRecipes, type Recipe } from '../lib/api'
import { demoRecipes } from '../data/demo'
import { RecipeCardGrid } from '../components/RecipeCard'

export function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>(demoRecipes)

  useEffect(() => {
    let cancelled = false
    getRecipes()
      .then((r) => {
        if (!cancelled && r.length) setRecipes(r)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="mx-auto w-full max-w-[1200px] px-6 py-[48px]">
      <header className="mb-8">
        <h1 className="text-[32px] font-bold leading-10 text-primary">Inspirasi Resep</h1>
        <p className="mt-1 text-[18px] leading-7 text-on-surface-variant">
          Temukan resep sehat dan belanja bahannya langsung dari sini.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {recipes.map((recipe) => (
          <RecipeCardGrid key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </main>
  )
}