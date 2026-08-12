import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppStoreProvider } from './store/AppStore'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { MobileNav } from './components/MobileNav'
import { CartDrawer } from './components/CartDrawer'
import { NutritionModal } from './components/NutritionModal'
import { Home } from './pages/Home'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetail } from './pages/ProductDetail'
import { RecipesPage } from './pages/RecipesPage'
import { RecipeDetailPage } from './pages/RecipeDetail'
import { Checkout } from './pages/Checkout'
import { Dashboard } from './pages/Dashboard'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <AppStoreProvider>
        <div className="flex min-h-screen flex-col pb-20 md:pb-0">
          <Header />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/produk" element={<ProductsPage />} />
              <Route path="/produk/:id" element={<ProductDetail />} />
              <Route path="/resep" element={<RecipesPage />} />
              <Route path="/resep/:id" element={<RecipeDetailPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
          <MobileNav />
        </div>
        <CartDrawer />
        <NutritionModal />
      </AppStoreProvider>
    </BrowserRouter>
  )
}