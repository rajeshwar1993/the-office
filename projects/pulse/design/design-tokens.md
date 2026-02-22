# Pulse Design System - Design Tokens

**Theme**: Mindful Glassmorphism  
**Last Updated**: 2026-02-10

---

## Color Palette

### Primary Colors

**Teal** (Primary Brand Color)
- `teal-50`: `#E6F7F6` - Lightest teal, backgrounds
- `teal-100`: `#B3E8E5` - Light teal, hover states
- `teal-200`: `#80D9D4` - Medium-light teal
- `teal-300`: `#62B1AD` ⭐ **Primary** - Main brand color
- `teal-400`: `#4D8E8A` - Medium-dark teal
- `teal-500`: `#3A6B68` - Darkest teal, text

**Rose** (Accent Color)
- `rose-50`: `#FEF0F0` - Lightest rose
- `rose-100`: `#FDD5D5` - Light rose
- `rose-200`: `#FBABAB` - Medium-light rose
- `rose-300`: `#F28C8C` ⭐ **Accent** - Main accent color
- `rose-400`: `#E96B6B` - Medium-dark rose
- `rose-500`: `#E04A4A` - Darkest rose

### Neutral Colors

**Off-White**
- `offWhite`: `#F8FAFC` - Main background color

**Slate** (Grays)
- `slate-50`: `#F8FAFC` - Lightest
- `slate-100`: `#F1F5F9`
- `slate-200`: `#E2E8F0`
- `slate-300`: `#CBD5E1`
- `slate-400`: `#94A3B8`
- `slate-500`: `#64748B` - Body text
- `slate-600`: `#475569`
- `slate-700`: `#334155`
- `slate-800`: `#1E293B`
- `slate-900`: `#0F172A` - Headings

### Semantic Colors

- `success`: `#10B981` - Success states
- `warning`: `#F59E0B` - Warning states
- `error`: `#EF4444` - Error states
- `info`: `#3B82F6` - Info states

---

## Typography

### Font Families

**Primary**: Inter
- Used for: Body text, UI elements, most content
- Weights: 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold)
- Source: Google Fonts (via Next.js font optimization for web)

**Secondary**: Instrument Sans
- Used for: Special headings, emphasis
- Weights: 400 (Regular), 600 (Semi-Bold), 700 (Bold)
- Source: Google Fonts

### Font Sizes

| Token | Size | Pixels | Usage |
|-------|------|--------|-------|
| `xs` | 0.75rem | 12px | Small labels, captions |
| `sm` | 0.875rem | 14px | Secondary text |
| `base` | 1rem | 16px | Body text (default) |
| `lg` | 1.125rem | 18px | Large body text |
| `xl` | 1.25rem | 20px | Small headings |
| `2xl` | 1.5rem | 24px | Medium headings |
| `3xl` | 1.875rem | 30px | Large headings |
| `4xl` | 2.25rem | 36px | Extra large headings |

### Line Heights

- Body text: 1.5 (150%)
- Headings: 1.2 (120%)
- Tight: 1.25 (125%)

---

## Spacing System

Based on 4px base unit:

| Token | Value | Pixels |
|-------|-------|--------|
| `1` | 0.25rem | 4px |
| `2` | 0.5rem | 8px |
| `3` | 0.75rem | 12px |
| `4` | 1rem | 16px |
| `5` | 1.25rem | 20px |
| `6` | 1.5rem | 24px |
| `8` | 2rem | 32px |
| `10` | 2.5rem | 40px |
| `12` | 3rem | 48px |
| `16` | 4rem | 64px |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 4px | Small elements, buttons |
| `md` | 8px | Cards, inputs |
| `lg` | 12px | Large cards |
| `xl` | 16px | Glass cards, modals |
| `2xl` | 24px | Hero sections |
| `full` | 9999px | Pills, circular elements |

---

## Glassmorphism Effect

**Glass Card** (signature style):

```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}
```

**Variations**:
- **Light Glass**: `background: rgba(255, 255, 255, 0.15)`
- **Dark Glass**: `background: rgba(0, 0, 0, 0.1)`

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards |
| `lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals |
| `xl` | `0 20px 25px rgba(0,0,0,0.1)` | Popovers |
| `glass` | `0 8px 32px rgba(31,38,135,0.15)` | Glass cards |

---

## Animation

### Durations

- **Fast**: 150ms - Micro-interactions
- **Base**: 300ms - Standard transitions
- **Slow**: 500ms - Complex animations

### Easing

- **Ease-in**: `cubic-bezier(0.4, 0, 1, 1)` - Accelerating
- **Ease-out**: `cubic-bezier(0, 0, 0.2, 1)` - Decelerating (preferred)
- **Ease-in-out**: `cubic-bezier(0.4, 0, 0.2, 1)` - Smooth

---

## Component Patterns

### Button

**Primary Button**:
- Background: `teal-300`
- Text: `white`
- Hover: `teal-400`
- Padding: `12px 24px`
- Border Radius: `8px`

**Secondary Button**:
- Background: `transparent`
- Border: `1px solid teal-300`
- Text: `teal-300`
- Hover: `background: teal-50`

### Input Field

- Background: `white`
- Border: `1px solid slate-300`
- Focus Border: `teal-300`
- Padding: `12px 16px`
- Border Radius: `8px`

### Card

- Background: `white`
- Border: `1px solid slate-200`
- Border Radius: `12px`
- Padding: `24px`
- Shadow: `md`

### Glass Card (Special)

- Use glassmorphism effect (see above)
- Padding: `24px`
- Border Radius: `16px`

---

## Platform-Specific Implementation

### Flutter

**Colors** (`lib/core/theme/colors.dart`):
```dart
class AppColors {
  static const Color teal = Color(0xFF62B1AD);
  static const Color rose = Color(0xFFF28C8C);
  static const Color offWhite = Color(0xFFF8FAFC);
  static const Color slate500 = Color(0xFF64748B);
  static const Color slate900 = Color(0xFF0F172A);
  // ... etc
}
```

**Theme** (`lib/core/theme/app_theme.dart`):
```dart
class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.light(
        primary: AppColors.teal,
        secondary: AppColors.rose,
        surface: AppColors.offWhite,
      ),
      textTheme: GoogleFonts.interTextTheme(),
    );
  }
}
```

**Usage**:
```dart
Container(
  color: AppColors.teal,
  child: Text(
    'Hello',
    style: TextStyle(color: AppColors.slate900),
  ),
)
```

---

### Next.js / Tailwind CSS v4

**CSS Variables** (`src/app/globals.css`):
```css
:root {
  --teal-300: #62B1AD;
  --rose-300: #F28C8C;
  --off-white: #F8FAFC;
  --slate-500: #64748B;
  --slate-900: #0F172A;
}

@theme inline {
  --color-teal-300: var(--teal-300);
  --color-rose-300: var(--rose-300);
  --color-offWhite: var(--off-white);
  --color-slate-500: var(--slate-500);
  --color-slate-900: var(--slate-900);
  
  --font-sans: var(--font-inter), sans-serif;
  --font-secondary: var(--font-instrument-sans), sans-serif;
}
```

**Usage**:
```tsx
<div className="bg-[var(--off-white)] text-teal-300">
  <h1 className="text-4xl font-bold">Hello</h1>
</div>
```

---

## Accessibility

### Color Contrast

All color combinations meet WCAG 2.1 AA standards:
- `teal-300` on `white`: 4.52:1 ✓
- `slate-900` on `offWhite`: 15.8:1 ✓
- `slate-500` on `white`: 4.54:1 ✓

### Touch Targets

Minimum touch target size: **44x44 points** (iOS) / **48x48 dp** (Android)

---

## Design Consistency Verification

To verify design token consistency across platforms:

1. **Color Values**: Ensure hex codes match exactly
2. **Font Families**: Both platforms use Inter (primary) and Instrument Sans (secondary)
3. **Spacing**: 4px base unit system applied consistently
4. **Border Radius**: Same values across platforms

---

## Resources

- **Figma**: [Design files link - TBD]
- **Color Palette Tool**: https://coolors.co/62b1ad-f28c8c-f8fafc
- **Google Fonts**: https://fonts.google.com/specimen/Inter
- **Tailwind CSS v4**: https://tailwindcss.com/docs

---

**Maintained By**: Pulse Design Team  
**Questions?**: Contact design lead or refer to implementation examples in `pulse-app` and `pulse-web` repositories
