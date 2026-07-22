# Button Component

A comprehensive, reusable Button component that captures all the button patterns used throughout the Tuabi web application.

## Features

- **Multiple Variants**: Primary, Secondary, Danger, Success
- **Responsive Sizes**: Small, Medium, Large, Primary-small
- **Icon Support**: Left or right positioned icons
- **Responsive Text**: Different text for mobile and desktop
- **Loading States**: Built-in loading spinner and disabled state
- **Full Width**: Option for full-width buttons
- **Accessibility**: Proper focus states and disabled handling
- **Custom Styling**: Support for additional className props

## Usage

### Basic Usage

```tsx
import { Button } from "@/shared/components";

<Button variant="primary">Click me</Button>;
```

### With Icon

```tsx
<Button variant="primary" icon={<PlusIcon className="h-4 w-4" />}>
  Add Item
</Button>
```

### Responsive Text

```tsx
<Button
  variant="primary"
  size="primary-small"
  icon={<PlusIcon className="h-5 w-5" />}
  responsiveText={{ desktop: "Add Debtor" }}
/>
```

### Icon Only

```tsx
<Button variant="secondary" icon={<EyeIcon className="h-4 w-4" />} iconOnly />
```

**Note**: When `iconOnly` is true, the button automatically adjusts to fit the icon with compact padding and `w-auto` width, ignoring `fullWidth` and `flex-1` classes.

### Responsive Icon Only (Mobile: Icon, Desktop: Icon + Text)

```tsx
<Button
  variant="secondary"
  icon={<EyeIcon className="h-4 w-4" />}
  iconOnly
  responsiveText={{ desktop: "Details" }}
/>
```

### Loading State

```tsx
<Button variant="primary" loading={isLoading} disabled={isLoading}>
  Submit
</Button>
```

### Full Width

```tsx
<Button variant="primary" fullWidth>
  Full Width Button
</Button>
```

## Props

| Prop             | Type                                                | Default     | Description                        |
| ---------------- | --------------------------------------------------- | ----------- | ---------------------------------- |
| `variant`        | `'primary' \| 'secondary' \| 'danger' \| 'success'` | `'primary'` | Button variant/color scheme        |
| `size`           | `'small' \| 'medium' \| 'large' \| 'primary-small'` | `'medium'`  | Button size                        |
| `fullWidth`      | `boolean`                                           | `false`     | Makes button full width            |
| `loading`        | `boolean`                                           | `false`     | Shows loading spinner              |
| `icon`           | `React.ReactNode`                                   | `undefined` | Icon to display                    |
| `iconPosition`   | `'left' \| 'right'`                                 | `'left'`    | Position of the icon               |
| `iconOnly`       | `boolean`                                           | `false`     | Shows only icon (no text)          |
| `responsiveText` | `{ mobile?: string; desktop: string }`              | `undefined` | Different text for mobile/desktop  |
| `responsiveIcon` | `{ mobile?: ReactNode; desktop: ReactNode }`        | `undefined` | Different icons for mobile/desktop |
| `children`       | `React.ReactNode`                                   | `undefined` | Button content                     |
| `className`      | `string`                                            | `undefined` | Additional CSS classes             |
| `disabled`       | `boolean`                                           | `false`     | Disables the button                |
| `onClick`        | `() => void`                                        | `undefined` | Click handler                      |
| `type`           | `'button' \| 'submit' \| 'reset'`                   | `'button'`  | Button type                        |

## Variants

### Primary

- Background: `bg-primary-600`
- Hover: `hover:bg-primary-700`
- Text: White
- Use for: Main actions, CTAs, form submissions

### Secondary

- Background: `bg-secondary-100`
- Hover: `hover:bg-secondary-200`
- Text: `text-secondary-700`
- Use for: Secondary actions, cancel buttons

### Danger

- Background: `bg-danger-600`
- Hover: `hover:bg-danger-700`
- Text: White
- Use for: Destructive actions, delete buttons

### Success

- Background: `bg-success-600`
- Hover: `hover:bg-success-700`
- Text: White
- Use for: Success actions, confirm buttons

## Sizes

### Small

- Padding: `py-1 px-3`
- Text: `text-xs`
- Use for: Compact spaces, table actions

### Medium (Default)

- Padding: `py-2 px-2`
- Use for: Standard buttons

### Large

- Padding: `px-8 py-4`
- Text: `text-lg`
- Use for: Prominent CTAs

### Primary-small

- Padding: `p-2 md:py-2 md:px-2`
- Shape: `rounded-full md:rounded-md`
- Use for: Floating action buttons, responsive headers

## Real-world Examples

### Retry Button

```tsx
<Button onClick={() => refetch()} variant="primary">
  Retry
</Button>
```

### Add Debtor Button (Header)

```tsx
<Button
  onClick={handleAddDebtor}
  variant="primary"
  size="primary-small"
  icon={<PlusIcon className="h-5 w-5" />}
  responsiveText={{ desktop: "Add Debtor" }}
/>
```

### Action Buttons Row (Mobile-Friendly)

```tsx
<div className="flex space-x-2">
  <Button
    variant="secondary"
    className="text-sm"
    icon={<EyeIcon className="h-4 w-4" />}
    iconOnly
    responsiveText={{ desktop: "Details" }}
  />
  <Button
    variant="secondary"
    className="text-sm"
    icon={<PencilIcon className="h-4 w-4" />}
    iconOnly
    responsiveText={{ desktop: "Edit" }}
  />
  <Button
    variant="primary"
    className="text-sm"
    icon={<PlusIcon className="h-4 w-4" />}
    iconOnly
    responsiveText={{ desktop: "Add Payment" }}
  />
</div>
```

### Form Submit Button

```tsx
<Button
  type="submit"
  variant="primary"
  fullWidth
  loading={isLoading}
  disabled={isLoading}
>
  {isLoading ? "Submitting..." : "Submit"}
</Button>
```

## Migration from Old Buttons

### Before (CSS Classes)

```tsx
<button className="btn-primary">Click me</button>
<button className="btn-secondary w-full">Submit</button>
<button className="btn-primary-small flex items-center space-x-2">
  <PlusIcon className="h-5 w-5" />
  <span className="hidden md:block">Add Debtor</span>
</button>
```

### After (Button Component)

```tsx
<Button variant="primary">Click me</Button>
<Button variant="secondary" fullWidth>Submit</Button>
<Button
  variant="primary"
  size="primary-small"
  icon={<PlusIcon className="h-5 w-5" />}
  responsiveText={{ desktop: "Add Debtor" }}
/>
```

## Benefits

1. **Consistency**: All buttons follow the same design system
2. **Maintainability**: Changes to button styles happen in one place
3. **Accessibility**: Built-in focus states and ARIA attributes
4. **Responsive**: Handles mobile/desktop differences automatically
5. **Type Safety**: Full TypeScript support with proper prop types
6. **Flexibility**: Supports custom styling while maintaining base functionality
