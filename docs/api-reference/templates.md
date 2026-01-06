# Templates

The `@ogify/templates` package contains pre-built, production-ready templates.

## Basic Template

A versatile, general-purpose template suitable for blog posts, announcements, and more.

### Import

```typescript
import template from '@ogify/templates/basic';
import type { TemplateParams } from '@ogify/templates/basic';
```

### Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | The main headline of the image. |
| `subtitle` | `string` | (Optional) A secondary description or tagline. |
| `layout` | `'aligned' \| 'centered' \| 'split'` | The visual arrangement of elements. Default: `'split'`. |
| `brandName` | `string` | (Optional) Your brand or website name. |
| `brandLogo` | `string` | (Optional) URL to your brand logo. |
| `cta` | `string` | (Optional) Call to action text (e.g., "Read More"). |
| `primaryColor` | `string` | (Optional) Primary theme color (hex code). Default: `#4c8f5f`. |
| `secondaryColor` | `string` | (Optional) Secondary theme color (hex code). Default: `#faf8f5`. |
| `textColor` | `string` | (Optional) Text color (hex code). Default: `#fff`. |
| `extras` | `string[]` | (Optional) Array of extra tags or metadata (e.g., hashtags, dates). |
| `pattern` | `string` | (Optional) URL to a background pattern image. |

### Layouts

- **Centered**: All content is centered. Best for simple announcements.
- **Aligned**: Content is aligned to the start (left for LTR, right for RTL). Good for blog posts.
- **Split**: Content is split into two columns.
