---
name: Fresh Harvest Minimalism
colors:
  surface: '#f9faf7'
  surface-dim: '#d9dad8'
  surface-bright: '#f9faf7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f1'
  surface-container: '#edeeeb'
  surface-container-high: '#e7e8e6'
  surface-container-highest: '#e2e3e0'
  on-surface: '#191c1b'
  on-surface-variant: '#404945'
  inverse-surface: '#2e312f'
  inverse-on-surface: '#f0f1ee'
  outline: '#707974'
  outline-variant: '#c0c9c3'
  surface-tint: '#376757'
  primary: '#003629'
  on-primary: '#ffffff'
  primary-container: '#1b4d3e'
  on-primary-container: '#8abda9'
  inverse-primary: '#9ed1bd'
  secondary: '#5c5f60'
  on-secondary: '#ffffff'
  secondary-container: '#dee0e2'
  on-secondary-container: '#606365'
  tertiary: '#4c221c'
  on-tertiary: '#ffffff'
  tertiary-container: '#673831'
  on-tertiary-container: '#e4a399'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#baeed9'
  primary-fixed-dim: '#9ed1bd'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#1d4f40'
  secondary-fixed: '#e1e2e4'
  secondary-fixed-dim: '#c5c6c8'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#fab6ac'
  on-tertiary-fixed: '#34100b'
  on-tertiary-fixed-variant: '#693a33'
  background: '#f9faf7'
  on-background: '#191c1b'
  surface-variant: '#e2e3e0'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 24px
  gutter: 16px
  section-gap: 48px
---

## Brand & Style

The design system focuses on "Sayur Online," a premium grocery platform delivering fresh vegetables. The brand personality is organic, trustworthy, and hyper-efficient. By utilizing a **Minimalist** style with elements of **Corporate Modern**, the UI prioritizes clarity and product photography over decorative elements. 

The emotional response should be one of "cleanliness" and "reliability." High amounts of whitespace represent the freshness of the produce, while the deep green palette anchors the experience in nature and sustainability. The interface avoids clutter to ensure the shopping experience feels as effortless as picking a vegetable from a garden.

## Colors

The palette is intentionally restricted to two primary tones to maintain a high-end, editorial feel. 

- **Primary (#1B4D3E):** A deep, saturated leaf green used for all functional actions, typography, and branding. It provides high contrast against the light backgrounds.
- **Background (#F4F5F7):** A soft off-white used for the main application canvas to reduce eye strain and distinguish from card elements.
- **Surface (#FFFFFF):** Pure white reserved for cards and interactive containers to create a subtle layered effect.
- **Neutral:** Shades of the primary green at low opacity (5-10%) are used for disabled states or subtle dividers.

## Typography

This design system utilizes **Plus Jakarta Sans** for its modern, friendly, yet professional geometric qualities. 

- **Headlines:** Set in Bold (700) and exclusively in the primary green. Tight letter spacing is applied to large headings to maintain a compact, premium look.
- **Body:** Set in Medium (500) weight rather than Regular to ensure legibility and a sense of "substance" against the off-white backgrounds. 
- **Language:** All microcopy and UI labels should be in Indonesian (e.g., "Keranjang," "Checkout," "Segar").

## Layout & Spacing

The system follows a **Fluid Grid** model with generous padding to emphasize the minimalist aesthetic.

- **Desktop:** 12-column grid with 24px gutters and 80px side margins.
- **Mobile:** 4-column grid with 16px gutters and 24px side margins.
- **Spacing Logic:** All spacing must be a multiple of 8px. Use large vertical gaps (48px+) between content sections (e.g., between "Produk Terpopuler" and "Kategori") to allow the layout to "breathe."

## Elevation & Depth

Depth is conveyed through **Tonal Layering** combined with **Ambient Shadows**. 

- **Base Layer:** The off-white background (#F4F5F7) acts as the lowest level.
- **Card Layer:** Pure white (#FFFFFF) surfaces sit on top of the base.
- **Shadows:** Use a single, very soft shadow for elevated elements. 
  - *Style:* `0px 10px 30px rgba(27, 77, 62, 0.05)`. The shadow color is a tinted version of the primary green at a very low opacity to maintain a natural, organic feel.
- **Interactions:** On hover, cards should slightly lift (y-axis shift) and the shadow opacity should increase to 0.08.

## Shapes

The shape language is defined by **Pill-shaped** and extra-large rounded corners, echoing the organic forms found in nature.

- **Cards & Containers:** Use a 24px (xl) corner radius.
- **Buttons:** Use a fully rounded/pill-shaped radius to make them appear friendly and "tappable."
- **Form Inputs:** Match the 24px radius of the cards to maintain visual continuity.

## Components

- **Buttons:**
  - **Primary:** Filled #1B4D3E with #F4F5F7 text. No border. Pill-shaped.
  - **Secondary:** Outlined with 2px stroke of #1B4D3E. Background is transparent or #FFFFFF.
- **Product Cards:**
  - Pure white background, 24px radius, soft ambient shadow.
  - Product imagery should have a subtle #F4F5F7 background or be transparent.
  - Price tags in Bold 700 Primary Green.
- **Input Fields:**
  - #FFFFFF background with a subtle 1px border in 10% Primary Green. 
  - Focus state: 2px border in Primary Green.
- **Chips/Kategori:**
  - Small pill-shaped containers. Unselected: #FFFFFF background with #1B4D3E text. Selected: #1B4D3E background with #F4F5F7 text.
- **Quantity Selector:**
  - A compact horizontal pill with plus/minus icons in Primary Green and a centered number.