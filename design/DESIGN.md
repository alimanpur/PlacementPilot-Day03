---
name: PlacementPilot
colors:
  surface: '#f9f9f9'
  surface-dim: '#d9dada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#404849'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f0'
  outline: '#717879'
  outline-variant: '#c0c8c9'
  surface-tint: '#3b6569'
  primary: '#05373b'
  on-primary: '#ffffff'
  primary-container: '#234e52'
  on-primary-container: '#93bec2'
  inverse-primary: '#a3ced3'
  secondary: '#5c614d'
  on-secondary: '#ffffff'
  secondary-container: '#e0e5cc'
  on-secondary-container: '#626753'
  tertiary: '#4b2815'
  on-tertiary: '#ffffff'
  tertiary-container: '#653e29'
  on-tertiary-container: '#e1aa8f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#beeaef'
  primary-fixed-dim: '#a3ced3'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#224d51'
  secondary-fixed: '#e0e5cc'
  secondary-fixed-dim: '#c4c9b1'
  on-secondary-fixed: '#191d0e'
  on-secondary-fixed-variant: '#444937'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#f2ba9e'
  on-tertiary-fixed: '#311303'
  on-tertiary-fixed-variant: '#643d28'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display:
    fontFamily: DM Sans
    fontSize: 48px
    fontWeight: '500'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: DM Sans
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: DM Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-md:
    fontFamily: DM Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is built on a foundation of **Editorial Minimalism**. It positions the product as a "Career Operating System" for students—an environment that feels like a premium workspace rather than a typical student portal. The personality is calm, confident, and authoritative, reducing cognitive load during the high-stakes period of career placement.

The aesthetic avoids all digital trends like glassmorphism or neon glows in favor of a "physical paper" feel. It utilizes high-quality typography, generous whitespace, and a strict structural grid to evoke the feeling of a modern academic journal or a high-end architectural portfolio. The UI should feel permanent and reliable.

## Colors
The palette is grounded in earthy, sophisticated tones. 
- **Background (#F8F7F4):** A warm off-white that reduces eye strain and provides a tactile, "paper" quality.
- **Sidebar (#1F1F1F):** A soft charcoal used for high-level navigation to provide a strong structural anchor.
- **Primary Accent (#234E52):** A deep forest green used for primary actions and brand presence. It signals growth and stability.
- **Secondary Accent (#6B705C):** A muted olive for secondary metadata and auxiliary UI elements.
- **Borders (#E7E5E4):** Used consistently for containment, keeping the layout organized without adding visual weight.

## Typography
Typography is the primary driver of the visual hierarchy. 
- **Headings:** Use DM Sans (as a high-quality "General Sans" alternative) for a clean, modern, and slightly authoritative look.
- **Body:** Inter provides maximum legibility for long-form content, applications, and resumes.
- **Numbers & Metadata:** JetBrains Mono is used for dates, status counts, and data points to emphasize the "System/OS" nature of the product.

All typography should follow a tight vertical rhythm. Large headings should use slightly negative letter spacing to maintain a compact, editorial feel.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy within a fluid container. 
- **Grid:** Use a 12-column grid for desktop with 24px gutters. 
- **Margins:** Desktop margins are generous (40px) to allow the content to "breathe" and maintain the premium feel. 
- **Sidebar:** The sidebar is fixed at 280px, utilizing the charcoal background to separate navigation from the main workspace.
- **Mobile:** Transition to a 4-column grid with 16px margins. 

Elements should be grouped using logical spacing units (multiples of 4px). Use `lg` and `xl` spacing to separate major sections, reinforcing the editorial aesthetic.

## Elevation & Depth
This design system avoids heavy shadows and traditional depth metaphors. Depth is communicated through:
- **Tonal Layering:** The primary background is off-white (#F8F7F4). Surfaces placed "on top" of this use white (#FFFFFF) with a subtle 1px border (#E7E5E4).
- **Subtle Shadows:** When elevation is necessary (e.g., a floating dropdown), use a highly diffused, low-opacity shadow: `0 4px 20px rgba(0, 0, 0, 0.04)`.
- **Strict Outlines:** Instead of shadows, 1px borders are the primary method of defining container boundaries.

## Shapes
The shape language is structured and "Soft-Geometric." 
- **Corners:** A standard radius of 12px is applied to cards, buttons, and input fields. This softens the brutalism of the grid while maintaining a professional look.
- **Buttons:** Primary buttons use the 12px radius. Avoid pill-shapes except for status tags (chips).
- **Icons:** Use linear icons with a 1.5px or 2px stroke weight to match the border language of the UI.

## Components
- **Buttons:** Primary buttons are solid deep forest green (#234E52) with white text. Secondary buttons are outlined with 1px #E7E5E4 and charcoal text.
- **Cards:** White background, 1px border (#E7E5E4), 12px corner radius. No shadow unless hovered.
- **Input Fields:** 1px border, 12px radius, with JetBrains Mono for placeholder text to signal a "data-entry" mode. Focused state uses a 1px #234E52 border (no glow).
- **Chips/Status:** Muted olive (#6B705C) backgrounds at 10% opacity with solid text in the same color. Use JetBrains Mono for chip labels.
- **Lists:** Clean row-based layout with 1px bottom borders. High-density data should be avoided; allow rows to have height (min 64px).
- **Sidebar Items:** High-contrast white text on charcoal background for active states; 60% opacity for inactive states.