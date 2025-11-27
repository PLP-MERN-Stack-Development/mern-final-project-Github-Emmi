# Dark Mode Implementation Guide

## Overview
EmmiDev CodeBridge uses `next-themes` for dark mode support with Tailwind CSS.

## Setup Complete ✅

### 1. ThemeProvider Configuration
- **Location**: `src/main.jsx`
- **Default theme**: Dark
- **Storage key**: `emmidev-theme`
- **System preference**: Enabled

### 2. ThemeToggle Component
- **Location**: `src/components/ui/ThemeToggle.jsx`
- **Features**:
  - Smooth icon transitions (Sun/Moon)
  - Prevents hydration mismatch
  - Glassmorphism styling
  - Hover effects

### 3. Integration Points
- ✅ Landing Page Navbar (Desktop & Mobile)
- ✅ HTML template (prevents FOUC)
- ✅ Tailwind config (`darkMode: 'class'`)

## Usage

### Using Dark Mode Classes
```jsx
// Basic usage
<div className="bg-white dark:bg-slate-900">
  <h1 className="text-gray-900 dark:text-white">Hello</h1>
</div>

// Gradient backgrounds
<div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
  Content
</div>

// Borders
<div className="border border-gray-200 dark:border-slate-700">
  Content
</div>
```

### Adding ThemeToggle to New Pages
```jsx
import { ThemeToggle } from '../components/ui';

// In your component
<ThemeToggle />
```

### Using useTheme Hook
```jsx
import { useTheme } from 'next-themes';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

## Color Palette

### Light Mode
- Background: `white`, `gray-50`, `gray-100`
- Text: `gray-900`, `gray-700`, `gray-600`
- Borders: `gray-200`, `gray-300`

### Dark Mode
- Background: `slate-900`, `slate-800`, `slate-700`
- Text: `white`, `gray-100`, `gray-300`
- Borders: `slate-700`, `slate-600`, `white/10`

### Brand Colors (Work in Both Modes)
- Indigo: `indigo-500`, `indigo-600`
- Purple: `purple-500`, `purple-600`
- Pink: `pink-500`, `pink-600`

## Best Practices

1. **Always provide dark mode variants** for:
   - Backgrounds
   - Text colors
   - Borders
   - Shadows

2. **Use semantic colors**:
   ```jsx
   // Good
   <p className="text-gray-700 dark:text-gray-300">Text</p>
   
   // Avoid
   <p className="text-gray-700">Text</p>
   ```

3. **Glassmorphism effects**:
   ```jsx
   <div className="bg-white/10 dark:bg-slate-800/50 backdrop-blur-xl">
     Glassmorphic card
   </div>
   ```

4. **Test both modes** during development

## Components with Dark Mode Support

- ✅ AnimatedBackground
- ✅ GradientButton
- ✅ GlassmorphismCard
- ✅ FeatureCard
- ✅ CourseCard
- ✅ TestimonialCard
- ✅ PostPreview
- ✅ ThemeToggle
- ✅ Navbar (Landing Page)
- ✅ Footer (Landing Page)
- ✅ LoginPage
- ✅ RegisterPage

## Future Enhancements

- [ ] Add theme transition animations
- [ ] Create theme-aware charts
- [ ] Add more color schemes (optional)
- [ ] Persist user preference across sessions (already working via localStorage)
