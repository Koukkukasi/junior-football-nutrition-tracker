# Modern UI Design Guide - Junior Football Nutrition Tracker

## Color Palette

### Primary Colors
- **Primary Blue**: `#2563eb` - Main brand color
- **Secondary Purple**: `#7c3aed` - Accent color
- **Success Green**: `#10b981` - Positive actions/states
- **Warning Yellow**: `#f59e0b` - Caution/attention states
- **Error Red**: `#ef4444` - Error/critical states

### Neutral Colors
- **Gray-50**: `#f9fafb` - Lightest backgrounds
- **Gray-100**: `#f3f4f6` - Light backgrounds
- **Gray-200**: `#e5e7eb` - Borders
- **Gray-300**: `#d1d5db` - Disabled states
- **Gray-400**: `#9ca3af` - Placeholder text
- **Gray-500**: `#6b7280` - Secondary text
- **Gray-600**: `#4b5563` - Primary text
- **Gray-700**: `#374151` - Headings
- **Gray-800**: `#1f2937` - Dark text
- **Gray-900**: `#111827` - Darkest text

## Nutrition Score System

### Score Ranges & Colors
- **0-40%**: Red (`#ef4444`) - "Needs Improvement"
- **41-60%**: Yellow (`#f59e0b`) - "Fair"
- **61-80%**: Blue (`#2563eb`) - "Good"
- **81-100%**: Green (`#10b981`) - "Excellent"

### Scoring Components
- **Meal Frequency**: 50% weight
  - Based on logging 5 meals per day
- **Food Quality**: 50% weight
  - Based on nutritional value of foods

## Typography

### Font Sizes
- **Heading 1**: `text-3xl` (30px)
- **Heading 2**: `text-2xl` (24px)
- **Heading 3**: `text-xl` (20px)
- **Body**: `text-base` (16px)
- **Small**: `text-sm` (14px)
- **Extra Small**: `text-xs` (12px)

### Font Weights
- **Bold**: `font-bold` (700)
- **Semibold**: `font-semibold` (600)
- **Medium**: `font-medium` (500)
- **Regular**: `font-normal` (400)

## Component Specifications

### Dashboard KPIs
1. **Meals Logged**: Current/Target format
2. **Energy Level**: 1-5 scale with visual indicator
3. **Sleep Hours**: Numeric display with icon
4. **Training Days**: Weekly count

### Navigation
- **Desktop**: Fixed left sidebar (240px width)
- **Mobile**: Bottom navigation bar
- **Tablet**: Collapsible sidebar

### Cards
- **Border Radius**: `rounded-lg` (8px)
- **Shadow**: `shadow-lg`
- **Padding**: `p-6` (24px)
- **Background**: White on gray-50 background

## Responsive Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## Implementation Stack
- **Frontend Framework**: React.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Data Fetching**: TanStack Query

## Accessibility Guidelines
- Minimum contrast ratio: 4.5:1 for normal text
- Focus indicators on all interactive elements
- Semantic HTML structure
- ARIA labels for complex components
- Keyboard navigation support