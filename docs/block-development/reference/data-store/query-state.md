---
sidebar_label: Query State Store
---

# Query State Store (`wc/store/query-state`) 

## Overview

The Query State Store offers actions to handle and manipulate query-related data within specific contexts, such as individual blocks. This facilitates the dynamic updating and retrieval of query-state values, ensuring accurate and context-specific data management within PooCommerce Blocks.

## Usage

To utilize this store you will import the `QUERY_STATE_STORE_KEY` in any module referencing it. Assuming `@poocommerce/block-data` is registered as an external pointing to `wc.wcBlocksData` you can import the key via:

```js
const { QUERY_STATE_STORE_KEY } = window.wc.wcBlocksData;
```

## Actions

> ⚠️ New values will always overwrite any existing entry in the store.

### setQueryValue( context, queryKey, value )

This will set a single query-state value for a given context.

#### _Parameters_ 

-   _context_ `string`: The context for the query state being stored, eg. the block name so you can keep query-state specific per block.
-   _queryKey_ `string`: The reference for the value being stored.
-   _value_ `mixed`: The actual value being stored for the query-state.

### setValueForQueryContext( context ,value )

This will set the query-state for a given context. Typically this is used to set/replace the entire query-state for a given context rather than the individual keys for the context via `setQueryValue`.

#### _Parameters_ 

-   _context_ `string`: The context for the query state being stored, eg. the block name so you can keep query-state specific per block.
-   _value_ `object`: An object of key/value pairs for the query state being attached to the context.

