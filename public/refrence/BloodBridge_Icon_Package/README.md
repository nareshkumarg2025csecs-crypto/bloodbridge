# BloodBridge Icon Package

A small, consistent outline SVG icon set designed for the BloodBridge blue-and-white healthcare dashboard.

## Contents
- `svg/` — 23 individual SVG icons (24 × 24 viewBox)
- Icons use `currentColor`, so their color inherits from CSS.
- Stroke style: 1.8px, rounded caps and joins.

## Use in HTML
```html
<img src="/icons/home.svg" alt="" width="24" height="24">
```

## Use inline in React
```jsx
<img src="/icons/inventory.svg" alt="" className="h-5 w-5 text-blue-700" />
```

For CSS color inheritance, use the SVG inline:
```jsx
<svg className="h-5 w-5 text-blue-700" ...>...</svg>
```

Suggested palette:
- Primary blue: #1255B5
- Navy: #102B55
- Background: #F5F8FD
- Text: #172B4D
- Alert: #E5484D
