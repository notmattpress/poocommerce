# @poocommerce/sanitize

PooCommerce HTML sanitization utilities using DOMPurify with trusted types support.

## Features

- **Secure HTML Sanitization**: Uses DOMPurify to sanitize HTML content
- **Trusted Types Support**: Automatically configures trusted types policy to avoid conflicts
- **Configurable**: Supports custom allowed tags and attributes
- **TypeScript Support**: Full TypeScript definitions included

## Usage

### Basic HTML Sanitization

```typescript
import { sanitizeHTML } from '@poocommerce/sanitize';

const cleanHTML = sanitizeHTML('<p>Hello <script>alert("xss")</script> World!</p>');
// Returns: '<p>Hello World!</p>'
```

### React Integration

```javascript
import { sanitizeHTML } from '@poocommerce/sanitize';

function MyComponent( { content } ) {
  const sanitizedContent = {
    __html: sanitizeHTML( content )
  };
  
  return (
    <div dangerouslySetInnerHTML={ sanitizedContent } />
  );
}
```

### Custom Configuration

```javascript
import { sanitizeHTML } from '@poocommerce/sanitize';

const customSanitized = sanitizeHTML(
    html,
    {
        tags: ['p', 'br', 'strong'],
        attr: ['class', 'id']
    }
);
```

### Selecting the return type

By default, `sanitizeHTML` returns a string. You can opt into other DOMPurify return modes with the `returnType` option:

```ts
import { sanitizeHTML } from '@poocommerce/sanitize';

// Return an HTMLBodyElement
const bodyEl = sanitizeHTML('<p>Hi</p>', { returnType: 'HTMLBodyElement' });

// Return a DocumentFragment
const fragment = sanitizeHTML('<p>Hi</p>', { returnType: 'DocumentFragment' });
```

## Trusted Types

This package automatically configures a trusted types policy named `poocommerce-sanitize` to avoid conflicts with DOMPurify's default policy. The policy is initialized when the module is loaded.

```ts
import { getTrustedTypesPolicy } from '@poocommerce/sanitize';

const policy = getTrustedTypesPolicy();
if (policy) {
  const trustedHTML = policy.createHTML('<p>Content</p>');
  element.innerHTML = trustedHTML; // Safe in Trusted Types environments
}
```

The policy automatically sanitizes HTML using the same rules as `sanitizeHTML()`.
