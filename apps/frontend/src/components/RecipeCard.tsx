import { Link } from 'react-router-dom'
import type { Recipe } from '../lib/api'
import { recipeImage } from '../lib/images'
import { Icon } from './Icon'

export function difficultyLabel(timeMins: number | null): string {
  if (timeMins == null || timeMins <= 10) return 'Sangat Mudah'
  if (timeMins <= 20) return 'Mudah'
  return 'Sedang'
}

export function RecipeCardGrid({ recipe }: { recipe: Recipe }) {
  return (
    <article className="flex h-full cursor-pointer flex-col overflow-hidden rounded-[24px] border border-primary/5 bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)]">
      <Link to={`/resep/${recipe.id}`} className="flex h-full flex-col">
        <div className="relative h-48 w-full bg-surface-container-low">
          <img
            className="h-full w-full object-cover"
            src={recipeImage(recipe)}
            alt={recipe.title}
            loading="lazy"
          />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="mb-2 text-[18px] font-bold leading-7 text-on-surface">{recipe.title}</h3>
          <div className="mt-auto flex items-center gap-4 pt-4 text-[14px] leading-6 text-on-surface-variant">
            <span className="flex items-center gap-1">
              <Icon name="schedule" size={16} /> {recipe.cookingTimeMins ?? 15} min
            </span>
            <span className="flex items-center gap-1">
              <Icon name="restaurant" size={16} /> {difficultyLabel(recipe.cookingTimeMins)}
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

export function RecipeCardRow({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      to={`/resep/${recipe.id}`}
      className="group flex cursor-pointer overflow-hidden rounded-[20px] bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)]"
    >
      <div className="w-1/3 min-h-[100px] bg-surface-container-low">
        <img
          className="h-full w-full object-cover"
          src={recipeImage(recipe)}
          alt={recipe.title}
          loading="lazy"
        />
      </div>
      <div className="flex w-2/3 flex-col justify-center p-4">
        <h3 className="mb-1 line-clamp-1 text-[18px] font-bold leading-7 text-on-surface transition-colors group-hover:text-primary">
          {recipe.title}
        </h3>
        <p className="flex items-center gap-1 text-[14px] leading-6 text-on-surface-variant">
          <Icon name="schedule" size={14} /> {recipe.cookingTimeMins ?? 15} Menit
        </p>
      </div>
    </Link>
  )
}