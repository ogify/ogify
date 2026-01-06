# Template Features

When designing templates, it's important to understand what CSS features are available. OGify relies on **Satori** to convert HTML/CSS into SVG, which is then rendered to PNG.

## Supported CSS Properties

Satori supports a robust subset of CSS. Key properties include:

### Layout

- `display: flex` (Default for most elements)
- `flex-direction`
- `justify-content`
- `align-items`
- `align-content`
- `flex-wrap`
- `flex` (shorthand and individual grow/shrink/basis)
- `position` (`relative`, `absolute`)
- `top`, `right`, `bottom`, `left`

### Typography

- `font-family`
- `font-size`
- `font-weight`
- `font-style`
- `text-align`
- `color`
- `line-height`
- `letter-spacing`
- `text-overflow` (`clip`, `ellipsis`)
- `overflow` (`hidden`, `visible`)
- `white-space` (`normal`, `nowrap`, `pre-wrap`)

### Visuals

- `background-color`
- `background-image` (linear-gradient, radial-gradient, url)
- `background-size`, `background-position`, `background-repeat`
- `border` (and individual sides)
- `border-radius`
- `box-shadow`
- `opacity`
- `transform`

### Sizing & Spacing

- `width`, `height`
- `min-width`, `min-height`, `max-width`, `max-height`
- `padding` (and individual sides)
- `margin` (and individual sides)
- `gap`

## "Tailwind" Utilities

OGify includes a utility class processor (similar to `clsx` + a mini-Tailwind engine) that maps class names to styles.

### Common Mappings

- `flex`, `flex-row`, `flex-col`
- `items-center`, `items-start`, `items-end`, `items-stretch`
- `justify-center`, `justify-start`, `justify-between`, `justify-around`
- `w-full`, `h-full`, `w-1/2`, `h-screen`, etc.
- `p-4` (padding), `px-4`, `py-4`, `m-4` (margin)
- `text-center`, `text-left`, `text-right`
- `text-xl`, `text-[64px]`
- `font-bold`, `italic`
- `bg-white`, `bg-[#ff0000]`
- `text-black`, `text-white`
- `rounded`, `rounded-full`, `rounded-xl`
- `border`, `border-2`, `border-white`
- `absolute`, `relative`, `inset-0`

## Limitations

- **No CSS Grid**: Satori does not actively support CSS Grid layouts yet. Use Flexbox.
- **No `z-index`**: Stacking order depends on DOM order.
- **Limited Selectors**: Pseudo-classes like `:hover` make no sense for static images.

For a complete list of Satori's supported CSS, refer to the [Satori Documentation](https://github.com/vercel/satori#css).
