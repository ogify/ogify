# RTL Support

OGify has built-in support for Right-to-Left (RTL) languages like Arabic, Hebrew, and Persian.

## Enabling RTL

To enable RTL support, simply pass `isRTL: true` in the options object when calling `renderToImage`.

```typescript
const imageBuffer = await renderer.renderToImage('basic', {
  title: 'مرحبا بالعالم', // Arabic: Hello World
  subtitle: 'هذه أول صورة OG لي',
  layout: 'aligned',
}, {
  isRTL: true
});
```

## How it works

When `isRTL` is set to `true`:

1. **Text Direction**: The text direction is switched to `rtl`.
2. **Layout Mirroring**:
    - Flex containers with `flex-direction: row` are automatically reversed to `flex-direction: row-reverse` (if the template handles it).
    - `text-align: left` becomes `text-align: right`.
    - `margin-left` and `padding-left` are swaped with their `right` counterparts in some contexts, but mostly it relies on the template's implementation using logic like `isRTL ? 'text-right' : 'text-left'`.

## Template Support

All built-in templates (like `basic`) fully support RTL. If you are creating a custom template, you can access the `isRTL` boolean in your renderer function to conditionally apply styles.

```typescript
renderer: ({ params, isRTL }) => {
  return `
    <div style="direction: ${isRTL ? 'rtl' : 'ltr'}; text-align: ${isRTL ? 'right' : 'left'}">
      ${params.title}
    </div>
  `;
}
```
