# @ogify/core

[![npm version](https://badge.fury.io/js/%40ogify%2Fcore.svg)](https://badge.fury.io/js/%40ogify%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Core types and utilities for OGify Open Graph image generator.

## Installation

```bash
pnpm add @ogify/core zod
```

## Overview

`@ogify/core` provides the foundation for building type-safe Open Graph image templates. It includes:

- Complete TypeScript interfaces for templates, themes, and configuration
- Template definition utilities
- Parameter merging and validation logic
- Theme system with inheritance
- Cache key generation utilities

## Basic Usage

```typescript
import { defineTemplate, z } from '@ogify/core'

// Define a template schema
const blogSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(200).optional(),
  author: z.string().min(1).max(50),
})

// Create a template
const blogTemplate = defineTemplate({
  id: 'blog',
  name: 'Blog Post',
  description: 'Template for blog posts',
  schema: blogSchema,
  component: ({ params }) => ({
    type: 'div',
    props: {
      children: [
        { type: 'h1', props: { children: params.title } },
        params.description && {
          type: 'p',
          props: { children: params.description }
        },
        { type: 'p', props: { children: `By ${params.author}` } }
      ].filter(Boolean)
    }
  })
})
```

## API Reference

### Core Types

#### `OGTemplate<T>`

Interface for Open Graph templates.

```typescript
interface OGTemplate<T = any> {
  id: string                    // Unique identifier
  name: string                  // Display name
  description?: string          // Optional description
  category?: string             // Template category
  tags?: string[]               // Search tags
  schema: z.ZodSchema<T>        // Parameter validation schema
  defaultParams?: Partial<T>    // Default parameter values
  component: (props: TemplateProps<T>) => any  // Render function
  theme?: ThemeConfig           // Default theme
  fonts?: FontConfig[]          // Required fonts
}
```

#### `ThemeConfig`

Configuration for visual theming.

```typescript
interface ThemeConfig {
  name?: string
  colors?: {
    primary?: string
    secondary?: string
    background?: string
    text?: string
    accent?: string
    error?: string
    success?: string
    warning?: string
  }
  fonts?: FontConfig[]
  spacing?: Record<string, number>
  borderRadius?: Record<string, number>
  shadows?: Record<string, string>
  typography?: {
    fontFamily?: string
    fontSize?: number
    lineHeight?: number
    fontWeight?: number
    letterSpacing?: number
  }
  custom?: Record<string, any>
}
```

#### `FontConfig`

Font configuration for Satori rendering.

```typescript
interface FontConfig {
  name: string
  data: ArrayBuffer | Buffer
  weight?: number
  style?: 'normal' | 'italic'
}
```

### Template Definition

#### `defineTemplate<T>(config: OGTemplate<T>)`

Creates a new OG template with type safety.

```typescript
const myTemplate = defineTemplate({
  id: 'my-template',
  name: 'My Template',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional()
  }),
  component: ({ params }) => ({
    type: 'div',
    props: {
      children: [
        { type: 'h1', props: { children: params.title } },
        params.subtitle && { type: 'p', props: { children: params.subtitle } }
      ].filter(Boolean)
    }
  })
})
```

### Parameter Processing

#### `processTemplateParams<T>(...)`

Processes template parameters with merging and validation.

```typescript
import { processTemplateParams } from '@ogify/core'

const result = processTemplateParams(
  template,
  registration,
  globalDefaults,
  globalTheme,
  requestParams
)

console.log(result.params)    // Validated and merged parameters
console.log(result.theme)     // Merged theme configuration
console.log(result.fonts)     // Merged font configurations
```

### Utility Functions

#### `mergeParams<T>(...)`

Merges parameters in priority order.

```typescript
import { mergeParams } from '@ogify/core'

const merged = mergeParams(
  templateDefaults,    // Level 1: Template defaults
  registrationDefaults, // Level 2: Registration defaults
  globalDefaults,      // Level 3: Global defaults
  requestParams        // Level 4: Request parameters
)
```

#### `mergeThemes(...)`

Merges theme configurations with inheritance.

```typescript
import { mergeThemes } from '@ogify/core'

const theme = mergeThemes(
  templateTheme,
  registrationTheme,
  globalTheme
)
```

#### `generateCacheKey(...)`

Generates cache keys for template rendering.

```typescript
import { generateCacheKey } from '@ogify/core'

const key = generateCacheKey('template-id', params, customKeyFn)
```

#### `zodToJsonSchema(schema)`

Converts Zod schema to JSON schema format.

```typescript
import { zodToJsonSchema } from '@ogify/core'

const jsonSchema = zodToJsonSchema(myZodSchema)
```

## Parameter Merging Priority

Parameters are merged in the following priority order (highest to lowest):

1. **Request Parameters** - User-provided values from URL or API
2. **Link Generation Defaults** - Passed to `generateOGLink()`
3. **Global Defaults** - Set in `createTemplateHandler()`
4. **Registration Defaults** - Set in template registration
5. **Template Defaults** - Baked into template definition

## Theme Inheritance

Themes are merged with the following priority:

1. **Registration Theme** - Specific to template registration
2. **Global Theme** - Applied to all templates
3. **Template Theme** - Default theme in template definition

## Error Handling

The core package throws typed errors for:

- **Validation Errors** - When parameters don't match schema
- **Missing Templates** - When requested template doesn't exist
- **Theme Errors** - When theme configuration is invalid

```typescript
try {
  const result = processTemplateParams(template, registration, defaults)
} catch (error) {
  if (error.name === 'ZodError') {
    console.error('Parameter validation failed:', error.errors)
  } else {
    console.error('Template processing failed:', error.message)
  }
}
```

## Peer Dependencies

This package requires `zod` as a peer dependency:

```json
{
  "peerDependencies": {
    "zod": "^3.22.0"
  }
}
```

## License

MIT