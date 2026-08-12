---
name: Ethos Garden
colors:
  surface: '#f4fafd'
  surface-dim: '#d4dbdd'
  surface-bright: '#f4fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef5f7'
  surface-container: '#e8eff1'
  surface-container-high: '#e2e9ec'
  surface-container-highest: '#dde4e6'
  on-surface: '#161d1f'
  on-surface-variant: '#404945'
  inverse-surface: '#2b3234'
  inverse-on-surface: '#ebf2f4'
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
  tertiary: '#2d2f2f'
  on-tertiary: '#ffffff'
  tertiary-container: '#434545'
  on-tertiary-container: '#b1b2b2'
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
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f4fafd'
  on-background: '#161d1f'
  surface-variant: '#dde4e6'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style
The design system is built for a premium, eco-conscious grocery and botanical e-commerce experience. The brand personality is grounded, trustworthy, and organic, emphasizing freshness and ethical sourcing. 

The design style is a blend of **Minimalism** and **Modern Corporate**, focusing on high-quality whitespace, crisp structural alignment, and tactile feedback. The UI evokes a sense of calm and reliability through a limited, nature-inspired palette and sophisticated typography. The interface should feel breathable, using generous margins and soft tonal transitions to guide the user through the shopping and checkout experience without friction.

## Colors
The palette is rooted in botanical tones and clean neutrals to establish a professional yet organic aesthetic.

- **Primary (#1B4D3E):** "Deep Leaf Green." Used for high-emphasis actions, selected states, branding, and key navigational elements.
- **Secondary (#F4F5F7):** "Soft Slate." Used for large background surfaces, input fields, and subtle container fills to provide contrast against pure white.
- **Tertiary (#FFFFFF):** "Pure White." Used for cards, modals, and elevated surfaces to create depth.
- **Neutral (#2D3436):** A deep charcoal for primary text and iconography to ensure high legibility and a premium feel.

## Typography
The design system utilizes **Plus Jakarta Sans** across all levels to maintain a friendly yet modern and geometric appearance. 

- **Headlines:** Use Bold (700) or SemiBold (600) weights with slight negative letter-spacing for a tight, editorial look.
- **Body:** Regular (400) weight ensures high readability for product descriptions and policy text.
- **Labels:** Medium (500) or SemiBold (600) weights are used for buttons, tags, and micro-copy to provide clear hierarchy.
- **Scale:** Large display sizes must scale down on mobile (e.g., 48px to 32px) to prevent awkward wrapping.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a maximum container width of 1200px for desktop. 

- **Rhythm:** An 8px baseline grid governs all vertical spacing.
- **Grid:** 12 columns on desktop, 8 columns on tablet, and 4 columns on mobile.
- **Checkout Specifics:** Use a 2/3 and 1/3 split for the desktop checkout page (Main Content / Order Summary). On mobile, the Order Summary becomes a sticky footer or a collapsible top drawer.
- **Margins:** 24px internal padding for cards and modals to maintain an airy, premium feel.

## Elevation & Depth
Depth is created through **Tonal Layering** supplemented by extremely soft **Ambient Shadows**.

- **Level 0 (Background):** Secondary color (#F4F5F7).
- **Level 1 (Cards/Content):** Tertiary color (#FFFFFF) with a 1px border of #E2E4E9 (Subtle Grey) or no border and a soft shadow (0px 4px 20px rgba(0,0,0,0.04)).
- **Level 2 (Modals/Popovers):** Tertiary color (#FFFFFF) with a more pronounced shadow (0px 12px 40px rgba(0,0,0,0.08)).
- **Interaction:** Elements like buttons or selectable radio cards should lift slightly on hover (shadow increase) and flatten on press.

## Shapes
The design system uses a **Rounded** language with specific emphasis on "XL" corners for primary containers to evoke a soft, organic feel.

- **Base Radius:** 0.5rem (8px) for small components like tags or checkboxes.
- **Large Radius (XL):** 1.5rem (24px) for product cards, checkout selection groups, and modals.
- **Inputs:** 0.75rem (12px) to balance between the soft containers and sharp text.

## Components

### Checkout Radio Groups
Selection cards (e.g., Shipping Methods, Payment Options) use the following states:
- **Unselected:** Background: #FFFFFF; Border: 1px solid #E2E4E9; Padding: 20px; Radius: 1.5rem.
- **Selected:** Background: #F4F5F7; Border: 2px solid #1B4D3E (Deep Leaf Green); Padding: 19px (to account for border stroke). The internal radio circle should be filled with #1B4D3E.

### Substitution Policy Modal
- **Surface:** Pure White (#FFFFFF) with XL rounded corners (1.5rem).
- **Header:** Plus Jakarta Sans Bold, 24px.
- **Content:** Use #F4F5F7 for informational callout boxes within the modal.
- **Action:** Primary button in Deep Leaf Green (#1B4D3E) with White (#FFFFFF) text.

### Buttons
- **Primary:** Background #1B4D3E; Text #FFFFFF; Weight 600; Radius 0.75rem.
- **Secondary:** Background #F4F5F7; Text #1B4D3E; Weight 600; Radius 0.75rem.

### Input Fields
- **Default:** Background #FFFFFF; Border 1px solid #E2E4E9; Height 48px; Radius 0.75rem. 
- **Focus:** Border 2px solid #1B4D3E.

### Chips/Tags
- Small, pill-shaped (1rem radius) with #F4F5F7 background and #1B4D3E text for categories or status indicators.