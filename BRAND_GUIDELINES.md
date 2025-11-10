# ConvertBank-Statement.com Brand Guidelines

## Color Palette

### Primary Colors

#### Brand Blue
- **Hex:** `#1E40AF`
- **RGB:** `rgb(30, 64, 175)`
- **Tailwind:** `blue-800` or `bg-[#1E40AF]`
- **Usage:** Primary brand color, used for headers, footers, main CTAs, and logo background

#### White
- **Hex:** `#FFFFFF`
- **RGB:** `rgb(255, 255, 255)`
- **Tailwind:** `white`
- **Usage:** Text on dark backgrounds, card backgrounds, logo outline variant

### Accent Colors

#### Success Green
- **Hex:** `#22C55E`
- **RGB:** `rgb(34, 197, 94)`
- **Tailwind:** `green-500`
- **Usage:** Success states, confirmation badges, positive indicators (checkmark in logo)

#### Energy Orange
- **Hex:** `#FF911D`
- **RGB:** `rgb(255, 145, 29)`
- **Tailwind:** `orange-500` or `bg-[#FF911D]`
- **Usage:** Call-to-action accents, energy indicators, conversion symbols (lightning bolt in logo)

### Supporting Colors

#### Light Blue (Text on Dark)
- **Hex:** `#DBEAFE`
- **RGB:** `rgb(219, 234, 254)`
- **Tailwind:** `blue-100`
- **Usage:** Body text on dark blue backgrounds, secondary text in footer

#### Gray Scale
- **Light Gray:** `#F9FAFB` (Tailwind: `gray-50`) - Backgrounds
- **Medium Gray:** `#6B7280` (Tailwind: `gray-500`) - Secondary text
- **Dark Gray:** `#1F2937` (Tailwind: `gray-800`) - Body text
- **Border Gray:** `#E5E7EB` (Tailwind: `gray-200`) - Borders and dividers

## Logo Usage

### Logo Variants

1. **Primary Logo (Blue Filled)**
   - File: `logo.svg` or `logos/1.svg`
   - Usage: Headers, light backgrounds, general website use
   - Min size: 32px height
   - Clear space: Minimum 8px on all sides

2. **White Outline Logo**
   - File: `logo-white.svg` or `logos/3.svg`
   - Usage: Footer, dark backgrounds (#1E40AF)
   - Min size: 32px height
   - Clear space: Minimum 8px on all sides

### Logo Sizes

- **Small (sm):** 32px × 32px - Mobile navigation, compact spaces
- **Medium (md):** 40px × 40px - Standard components
- **Large (lg):** 60px × 60px - Header, footer, prominent placements

### Logo Don'ts

- ❌ Don't stretch or distort the logo
- ❌ Don't change logo colors
- ❌ Don't add effects (shadows, gradients) to the logo
- ❌ Don't use the blue logo on dark backgrounds
- ❌ Don't use the white logo on light backgrounds
- ❌ Don't recreate or redraw the logo

## Typography

### Font Family

- **Primary Font:** Inter
- **Fallback:** system-ui, -apple-system, sans-serif

### Font Sizes

- **Heading 1:** 3.75rem (60px) - Desktop hero titles
- **Heading 2:** 3rem (48px) - Section titles
- **Heading 3:** 2.25rem (36px) - Subsection titles
- **Heading 4:** 1.875rem (30px) - Card titles
- **Heading 5:** 1.5rem (24px) - Small titles
- **Heading 6:** 1.25rem (20px) - Labels

- **Body Large:** 1.125rem (18px) - Lead paragraphs
- **Body Regular:** 1rem (16px) - Standard body text
- **Body Small:** 0.875rem (14px) - Captions, helper text
- **Body Tiny:** 0.75rem (12px) - Fine print

### Font Weights

- **Light:** 300 - Rarely used
- **Regular:** 400 - Body text
- **Medium:** 500 - Emphasis, navigation
- **Semibold:** 600 - Headings, buttons
- **Bold:** 700 - Strong emphasis

## Spacing System

Uses Tailwind's default spacing scale (4px base unit):

- **xs:** 4px (space-1)
- **sm:** 8px (space-2)
- **md:** 16px (space-4)
- **lg:** 24px (space-6)
- **xl:** 32px (space-8)
- **2xl:** 48px (space-12)
- **3xl:** 64px (space-16)

### Component Spacing

- **Logo to text:** 4px (space-x-1 or gap-1)
- **Card padding:** 24px (p-6)
- **Section padding:** 64px vertical (py-16)
- **Container max-width:** 1280px

## Components

### Buttons

#### Primary Button
```css
Background: #1E40AF
Text: #FFFFFF
Padding: 12px 24px
Border radius: 6px
Font weight: 600
Hover: Darken by 10%
```

#### Secondary Button
```css
Background: transparent
Border: 2px solid #1E40AF
Text: #1E40AF
Padding: 12px 24px
Border radius: 6px
Font weight: 600
Hover: Background #1E40AF, Text #FFFFFF
```

#### Success Button (CTA)
```css
Background: #22C55E
Text: #FFFFFF
Padding: 12px 24px
Border radius: 6px
Font weight: 600
Hover: Darken by 10%
```

### Cards

```css
Background: #FFFFFF
Border: 1px solid #E5E7EB
Border radius: 8px
Padding: 24px
Shadow: 0 1px 3px rgba(0,0,0,0.1)
Hover shadow: 0 4px 6px rgba(0,0,0,0.1)
```

### Navigation

```css
Background: #FFFFFF
Border bottom: 1px solid #E5E7EB
Height: 64px
Logo size: 60px
Logo to text spacing: 4px
Link color: #1F2937
Link hover: #1E40AF
```

### Footer

```css
Background: #1E40AF
Text color: #DBEAFE (blue-100)
Heading color: #FFFFFF
Padding top: 160px (pt-40)
Padding bottom: 64px (pb-16)
Border top: 1px solid rgba(255,255,255,0.2)
Logo: White outline variant (logo-white.svg)
```

## Icon System

- **Style:** Line icons preferred
- **Stroke width:** 2px
- **Size:** 20px or 24px standard
- **Color:** Inherit from text color or #1E40AF

## Favicon Sizes

- **16×16px** - Standard browser tab
- **32×32px** - Retina browser tab
- **48×48px** - Windows site icons
- **180×180px** - Apple Touch Icon (iOS)
- **192×192px** - Android Chrome
- **512×512px** - PWA and high-resolution displays

## Border Radius System

- **Small:** 4px (rounded-sm) - Input fields
- **Default:** 6px (rounded-md) - Buttons
- **Medium:** 8px (rounded-lg) - Cards
- **Large:** 12px (rounded-xl) - Modals
- **Full:** 9999px (rounded-full) - Pills, avatars

## Shadows

### Card Shadow
```css
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
```

### Hover Shadow
```css
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
```

### Large Shadow (Modal)
```css
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
```

## Accessibility

### Color Contrast Ratios

- Body text on white: Must meet WCAG AA (4.5:1 minimum)
- Large text (18px+): Must meet WCAG AA (3:1 minimum)
- White text on #1E40AF: ✓ Passes (11.5:1)
- #DBEAFE text on #1E40AF: ✓ Passes (5.8:1)

### Focus States

```css
Focus ring: 2px solid #1E40AF
Focus ring offset: 2px
Tailwind: focus:ring-2 focus:ring-blue-800 focus:ring-offset-2
```

## Animation & Motion

### Transition Timings

- **Fast:** 150ms - Hover states, small interactions
- **Default:** 200ms - Most transitions
- **Slow:** 300ms - Complex animations, modals

### Easing Functions

- **Default:** ease-in-out - Most animations
- **Emphasis:** cubic-bezier(0.4, 0, 0.2, 1) - Button hovers
- **Smooth:** cubic-bezier(0.25, 0.1, 0.25, 1) - Page transitions

## Usage Examples

### Header
```tsx
<header className="bg-white border-b border-gray-200">
  <div className="container flex items-center space-x-1 h-16">
    <Image src="/logo.svg" width={60} height={60} />
    <span className="text-sm font-medium text-gray-700">
      convertbank-statement.com
    </span>
  </div>
</header>
```

### Footer
```tsx
<footer className="bg-[#1E40AF] pt-40 pb-16">
  <div className="container">
    <div className="flex items-center gap-1">
      <Image src="/logo-white.svg" width={60} height={60} />
      <h2 className="text-xl font-semibold text-white">
        convertbank-statement.com
      </h2>
    </div>
    <p className="text-blue-100 mt-6">
      Secure, private, and GDPR-compliant bank statement conversion.
    </p>
  </div>
</footer>
```

### Primary CTA Button
```tsx
<button className="bg-[#1E40AF] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#1a3a9f] transition-colors">
  Get Started Free
</button>
```

### Success Button
```tsx
<button className="bg-[#22C55E] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#16a34a] transition-colors">
  Convert Now
</button>
```

## File Structure

```
/logos
  /convertbank-statement.com logo | transparent | SVG
    1.svg (blue filled - for headers)
    2.svg (blue filled variant)
    3.svg (white outline - for footer)
  /convertbank-statement.com logo | transparent | PNG
    1.png
    2.png
    3.png

/public
  logo.svg (header logo - 1.svg)
  logo-white.svg (footer logo - 3.svg)
  favicon-16x16.png
  favicon-32x32.png
  favicon-48x48.png
  apple-touch-icon.png
  android-chrome-192x192.png
  android-chrome-512x512.png
  favicon.ico
```

## Version History

- **v1.0** (2024-11-10) - Initial brand guidelines created
  - Established #1E40AF as primary brand color
  - Defined logo usage and variants
  - Created comprehensive color system
  - Documented typography and spacing

---

**Last Updated:** November 10, 2024
**Maintained By:** ConvertBank-Statement Team
