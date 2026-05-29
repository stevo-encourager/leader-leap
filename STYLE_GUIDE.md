# Leader Leap Style Guide

## Color Palette

### Primary Colors
```css
/* Brand Colors */
--color-brand-primary: #2F5850;      /* Dark green - main brand color */
--color-brand-primary-hover: #4A6A61; /* Lighter dark green - hover states */
--color-brand-primary-light: #F0F4F3; /* Very light green - 5% opacity of #2F5850 */
--color-brand-accent: #C96736;       /* Orange-brown - CTAs, buttons */
--color-brand-accent-hover: #D07A52;  /* Lighter orange - button hovers */
--color-brand-background: #FAF8F1;   /* Warm off-white - page background */

/* Neutral Colors */
--color-gray-dark: #58595b;          /* Brand gray */
--color-gray-light: #f5f5f5;         /* Light gray background */
--color-white: #ffffff;              /* Pure white */
```

### Tailwind Classes
```
bg-encourager-background    → Page background (#FAF8F1)
bg-encourager-background-light → Card background (#FDFCF8)
bg-encourager              → Background dark green (#2F5850)
bg-encourager-light         → Background lighter green (#4A6A61)
bg-encourager-primary-light → Very light green tint (#F0F4F3 - 5% of #2F5850)
bg-encourager-accent        → Background orange-brown (#C96736)
bg-encourager-accent-hover  → Background lighter orange (#D97745)
text-encourager             → Text dark green (#2F5850)
text-encourager-accent      → Text orange-brown
hover:bg-encourager-accent/90 → Hover state for accent buttons

/* Opacity variants for #2F5850 (alternative to bg-encourager-primary-light) */
bg-encourager/5            → 5% opacity (very light green tint)
bg-encourager/10           → 10% opacity (light green tint)
bg-encourager/20           → 20% opacity (green tint borders)
border-encourager/20       → 20% opacity borders
```

### Usage Guidelines

#### Buttons
- **Primary CTA**: Use `bg-encourager-accent` with `hover:bg-encourager-accent/90`
- **Secondary**: Use `bg-encourager` with `hover:bg-encourager-light`
- **Text**: Always white on colored backgrounds

#### Headers & Titles
- **Main headers**: Use `text-encourager` (dark green)
- **Subheaders**: Use `text-slate-600` or `text-gray-600`

#### Cards & Backgrounds
- **Feature cards**: Use `bg-encourager` with white text
- **Content cards**: Use `bg-white` with subtle shadows
- **Page background**: Use `bg-slate-50` or `bg-gray-50`

## Typography

### Font Families
```css
/* Font Stacks */
--font-heading: 'Oswald', sans-serif;          /* Headers, titles */
--font-body: 'Quicksand', sans-serif;          /* Body text, UI elements */
--font-accent: 'Noto Sans', sans-serif;        /* Special accents */
```

### Tailwind Classes
```
font-oswald       → Heading font (Oswald)
font-quicksand    → Body font (Quicksand)
font-notica       → Accent font (Noto Sans)
```

### Font Sizes & Weights

#### Headings
- **H1**: `text-4xl md:text-5xl font-normal font-oswald text-black`
- **H2**: `text-3xl md:text-4xl font-normal font-oswald text-black`
- **H3**: `text-2xl md:text-3xl font-normal font-oswald text-black`
- **H4**: `text-xl md:text-2xl font-normal font-oswald text-black`

#### Body Text
- **Large**: `text-lg font-quicksand`
- **Regular**: `text-base font-quicksand`
- **Small**: `text-sm font-quicksand`

#### Special Text
- **Button text**: `font-medium font-notica uppercase tracking-wider`
- **Labels**: `text-sm font-medium`
- **Captions**: `text-xs text-gray-500`

## Component Patterns

### Buttons

#### Primary Button (CTA)
```jsx
className="bg-encourager-accent text-white hover:bg-encourager-accent/90 
          px-6 py-3 rounded-lg font-medium font-notica uppercase tracking-wider transition-colors"
```

#### Secondary Button
```jsx
className="bg-encourager text-white hover:bg-encourager-light 
          px-6 py-3 rounded-lg font-medium font-notica uppercase tracking-wider transition-colors"
```

#### Outline Button
```jsx
className="border-2 border-encourager text-encourager 
          hover:bg-encourager hover:text-white 
          px-6 py-3 rounded-lg font-medium font-notica uppercase tracking-wider transition-all"
```

### Cards

#### Feature Card
```jsx
className="bg-encourager text-white p-6 rounded-lg shadow-card 
          hover:shadow-elevated transition-shadow"
```

#### Content Card
```jsx
className="bg-white p-6 rounded-lg shadow-card 
          hover:shadow-elevated transition-shadow"
```

### Form Elements

#### Input Fields
```jsx
className="border border-gray-300 rounded-md px-4 py-2 
          focus:border-encourager-accent focus:ring-2 
          focus:ring-encourager-accent/20"
```

#### Labels
```jsx
className="text-sm font-medium text-gray-700 mb-1"
```

## Shadows

```css
/* Shadow Utilities */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-card: 0px 5px 15px rgba(0, 0, 0, 0.05);
--shadow-elevated: 0px 10px 25px rgba(0, 0, 0, 0.1);
--shadow-lg: 0px 10px 30px rgba(0, 0, 0, 0.08);
```

### Tailwind Classes
```
shadow-card       → Default card shadow
shadow-elevated   → Hover state shadow
shadow-lg         → Large element shadow
```

## Spacing

### Standard Spacing Scale
```
p-2  → 0.5rem (8px)
p-4  → 1rem (16px)
p-6  → 1.5rem (24px)
p-8  → 2rem (32px)
```

### Section Spacing
- **Between sections**: `space-y-8` or `mb-8`
- **Inside cards**: `p-6`
- **Between card items**: `space-y-4`

## Responsive Design

### Breakpoints
```
sm: 640px   → Mobile landscape
md: 768px   → Tablet
lg: 1024px  → Desktop
xl: 1280px  → Large desktop
2xl: 1536px → Extra large
```

### Mobile-First Patterns
```jsx
// Text sizing
className="text-2xl md:text-4xl"

// Padding
className="p-4 md:p-6 lg:p-8"

// Grid layouts
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

## Animation & Transitions

### Standard Transitions
```jsx
// Color transitions
className="transition-colors duration-200"

// All properties
className="transition-all duration-300"

// Shadow transitions
className="transition-shadow duration-300"
```

### Hover Effects
```jsx
// Lift effect
className="hover:-translate-y-1 transition-transform"

// Scale effect
className="hover:scale-105 transition-transform"
```

## Accessibility

### Focus States
- Always include focus-visible states
- Use `focus:ring-2 focus:ring-encourager-accent`

### Color Contrast
- Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
- White text on `#2F5850` ✅ (6.8:1)
- White text on `#C96736` ✅ (3.3:1)

### Interactive Elements
- Minimum touch target: 44x44px
- Clear hover and active states
- Keyboard navigation support

## Implementation Notes

### Converting Inline Styles
Replace inline styles with Tailwind classes:

❌ **Don't:**
```jsx
style={{ backgroundColor: '#2F5850' }}
```

✅ **Do:**
```jsx
className="bg-encourager"
```

### Creating Custom Utilities
For repeated patterns, create custom utility classes in `index.css`:

```css
@layer components {
  .btn-primary {
    @apply bg-encourager-accent text-white hover:bg-encourager-accent/90 
           px-6 py-3 rounded-lg font-medium transition-colors;
  }
  
  .card-feature {
    @apply bg-encourager text-white p-6 rounded-lg shadow-card 
           hover:shadow-elevated transition-shadow;
  }
}
```

### Using CSS Variables
For dynamic theming or complex calculations:

```css
:root {
  --brand-primary: #2F5850;
  --brand-accent: #C96736;
}

.dynamic-element {
  background: var(--brand-primary);
}
```