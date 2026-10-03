---
post_title: Model Context Protocol (MCP) Integration
sidebar_label: MCP Integration
category_slug: mcp
---

# Model Context Protocol (MCP) Integration

## Introduction

PooCommerce includes native support for the Model Context Protocol (MCP), enabling AI assistants and tools to interact directly with PooCommerce stores through a standardized protocol. This integration exposes PooCommerce functionality as discoverable tools that AI clients can use to perform store operations with proper authentication and permissions.

:::info

**Developer Preview Notice**
The MCP implementation in PooCommerce is currently in developer preview. Implementation details, APIs, and integration patterns may change in future releases as the feature matures.

:::

## Background

The Model Context Protocol (MCP) is an open standard that enables AI applications to securely connect to external data sources and tools. PooCommerce's MCP integration builds on two core technologies:

- **[WordPress Abilities API](https://github.com/WordPress/abilities-api)** - A standardized system for registering capabilities in WordPress
- **[WordPress MCP Adapter](https://github.com/WordPress/mcp-adapter)** - The core MCP protocol implementation

This architecture allows PooCommerce to expose operations as MCP tools through the flexible WordPress Abilities system while maintaining existing security and permission models.

## What's Available

PooCommerce registers purpose-built abilities for core store operations. These abilities are available through the WordPress Abilities API and can be surfaced through the shared WordPress MCP adapter.

### Purpose-Built PooCommerce Abilities

#### Product Management

- Query products with filtering and pagination
- Create new products
- Update existing products
- Delete products

#### Order Management

- Query orders with filtering and pagination
- Update order status
- Add order notes

### Deprecated PooCommerce MCP Endpoint

The deprecated PooCommerce MCP endpoint also exposes REST-derived compatibility abilities for products and orders. These abilities map to existing REST API operations and currently include product list, retrieve, create, update, and delete operations, plus order list, retrieve, create, and update operations.

All operations respect PooCommerce's existing permission system. The deprecated PooCommerce MCP endpoint authenticates using PooCommerce REST API keys; clients using the shared WordPress MCP adapter should follow the adapter's authentication requirements.

:::warning

**Data Privacy Notice**
Order and customer operations may expose personally identifiable information (PII) including names, email addresses, physical addresses, and payment details. You are responsible for ensuring compliance with applicable data protection regulations. Use least-privilege API scopes, rotate and revoke REST API keys regularly, and follow your organization's data retention and handling policies.

:::

## Architecture

### Data Flow Overview

The MCP integration uses a multi-layered architecture to bridge between MCP clients and WordPress:

```text
AI Client (Claude, etc.)
    ↓ (MCP protocol over stdio/JSON-RPC)
Local MCP Proxy (mcp-wordpress-remote)
    ↓ (HTTP/HTTPS requests with authentication)
Remote WordPress MCP Server (mcp-adapter)
    ↓ (WordPress Abilities API)
PooCommerce Abilities
    ↓ (REST API calls or direct operations)
PooCommerce Core
```

### Architecture Components

**Local MCP Proxy** (`mcp-wordpress-remote`)

- Runs locally on the developer's machine as a Node.js process
- Converts MCP protocol messages to HTTP requests
- Handles authentication header injection
- Bridges the protocol gap between MCP clients and WordPress REST endpoints

**Remote WordPress MCP Server** (`mcp-adapter`)

- Is provided by the bundled WordPress MCP Adapter package
- Powers MCP tool discovery and execution for WordPress abilities
- Creates the deprecated `/wp-json/poocommerce/mcp` endpoint for PooCommerce compatibility

#### WordPress Abilities System

- Provides a standardized way to register and execute capabilities
- Acts as an abstraction layer between MCP tools and actual operations
- Enables flexible implementation approaches (REST bridging, direct DB operations, etc.)

### Core Components

**MCP Adapter Provider** ([`MCPAdapterProvider.php`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/src/Internal/MCP/MCPAdapterProvider.php))

- Initializes the bundled MCP adapter when the `mcp_integration` feature flag is enabled
- Creates the deprecated PooCommerce MCP endpoint
- Handles feature flag checking (`mcp_integration`)
- Provides deprecated endpoint exposure filtering

**Abilities Registry** ([`AbilitiesRegistry.php`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/src/Internal/Abilities/AbilitiesRegistry.php))

- Initializes PooCommerce ability categories and loaders
- Bridges WordPress Abilities API with PooCommerce operations
- Enables ability discovery for MCP servers and other Abilities API consumers

**Purpose-Built Domain Abilities** ([`Domain`](https://github.com/poocommerce/poocommerce/tree/trunk/plugins/poocommerce/src/Internal/Abilities/Domain))

- Provide PooCommerce product and order abilities backed by domain APIs
- Use shared WordPress MCP adapter metadata (`mcp.public` and `mcp.type`) for MCP exposure
- Keep the ability contract focused on agent-friendly store operations

**REST Bridge Implementation** ([`AbilitiesRestBridge.php`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/src/Internal/Abilities/AbilitiesRestBridge.php))

- Registers REST-derived compatibility abilities only while handling requests to the deprecated PooCommerce MCP endpoint
- Provides explicit ability definitions with schemas for REST product and order operations
- Marks those abilities with `expose_in_deprecated_poocommerce_mcp` metadata

**PooCommerce Transport** ([`PooCommerceRestTransport.php`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/src/Internal/MCP/Transport/PooCommerceRestTransport.php))

- Handles PooCommerce API key authentication
- Enforces HTTPS requirements
- Validates permissions based on API key scope

### Implementation Approach

PooCommerce's preferred implementation path is purpose-built domain abilities. These abilities use schemas and response shapes designed for agent workflows instead of automatically projecting every REST-shaped operation into MCP.

REST-derived abilities remain available as a compatibility layer for the deprecated PooCommerce MCP endpoint. This keeps existing clients working while allowing new abilities to use the shared WordPress MCP adapter without expanding the deprecated endpoint by namespace alone.

## Enabling MCP Integration

The MCP feature is controlled by the `mcp_integration` feature flag. You can enable it programmatically:

```php
add_filter( 'poocommerce_features', function( $features ) {
    $features['mcp_integration'] = true;
    return $features;
});
```

Alternatively, you can enable it via PooCommerce CLI:

```bash
wp option update poocommerce_feature_mcp_integration_enabled yes
```

## Authentication and Security

### WordPress Application Password Requirements

Remote HTTP connections authenticate using a WordPress username and an [Application Password](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/#basic-authentication-with-application-passwords). Do not use your account password or a PooCommerce REST API key.

To create an Application Password:

1. In the WordPress dashboard, navigate to **Users → Profile**.
2. Under **Application Passwords**, enter a name for the MCP client.
3. Click **Add New Application Password**.
4. Copy the generated password and store it securely. WordPress only displays it once.

Use the WordPress username and generated password as `WP_API_USERNAME` and `WP_API_PASSWORD` in the remote proxy configuration. Application Passwords can be revoked independently from the user's profile.

### HTTPS Enforcement

Use HTTPS for remote HTTP connections so credentials are encrypted in transit. Local STDIO connections authenticate through WP-CLI using the configured `--user` and do not require an Application Password.

### Permission Validation

The MCP Adapter authenticates requests as the WordPress user associated with the Application Password. The default server requires an authenticated user with the `read` capability, and each PooCommerce ability also enforces its own permission callback. Use a dedicated WordPress user with only the capabilities the MCP client needs.

## Server Endpoint

PooCommerce abilities are available through the WordPress MCP Adapter's default server:

```text
https://yourstore.com/wp-json/mcp/mcp-adapter-default-server
```

The PooCommerce-specific `/wp-json/poocommerce/mcp` endpoint is deprecated and should not be used for new integrations.

## Connecting to the MCP Server

Choose a connection method based on where the WordPress site is running. For a detailed overview and application-specific instructions, see [Connecting AI applications](https://developer.wordpress.org/news/2026/02/from-abilities-to-ai-agents-introducing-the-wordpress-mcp-adapter/#connecting-ai-applications) and the [wordpress/mcp-adaptor repository](https://github.com/wordpress/mcp-adapter).

### Local Sites Using STDIO

For a local WordPress installation, MCP clients can connect directly through the MCP Adapter's WP-CLI command. The client needs access to the WordPress files and a working WP-CLI installation.

#### JSON Configuration

Add the following server to your MCP client configuration. Replace the WordPress path and user with values from your local environment:

```json
{
  "mcpServers": {
    "poocommerce_store": {
      "command": "wp",
      "args": [
        "--path=/path/to/your/wordpress/site",
        "mcp-adapter",
        "serve",
        "--server=mcp-adapter-default-server",
        "--user=admin"
      ]
    }
  }
}
```

Claude Desktop, Claude Code, and Cursor use the `mcpServers` property shown above. For VS Code, use `servers` instead.

#### Command-Line Configuration

Claude Code users can add the same server from the command line:

```bash
claude mcp add poocommerce_store -- \
  wp --path=/path/to/your/wordpress/site \
  mcp-adapter serve \
  --server=mcp-adapter-default-server \
  --user=admin
```

You can verify the server directly with WP-CLI:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | \
  wp --path=/path/to/your/wordpress/site \
  mcp-adapter serve \
  --server=mcp-adapter-default-server \
  --user=admin
```

### Remote Sites Using HTTP

For a remote WordPress installation, use the `@automattic/mcp-wordpress-remote` proxy. The proxy translates the MCP client's local STDIO messages into HTTP requests to the WordPress MCP Adapter.

Before connecting:

1. Create or select a dedicated WordPress user with the minimum required capabilities.
2. Open the user's **Profile** screen and create a WordPress Application Password.
3. Confirm the site uses HTTPS and non-Plain permalinks.

#### JSON Configuration

Add the following server to your MCP client configuration. Replace the example URL, username, and Application Password:

```json
{
  "mcpServers": {
    "poocommerce_store": {
      "command": "npx",
      "args": [
        "-y",
        "@automattic/mcp-wordpress-remote@latest"
      ],
      "env": {
        "WP_API_URL": "https://yourstore.com/wp-json/mcp/mcp-adapter-default-server",
        "WP_API_USERNAME": "your-username",
        "WP_API_PASSWORD": "your-application-password"
      }
    }
  }
}
```

Claude Desktop, Claude Code, and Cursor use the `mcpServers` property shown above. For VS Code, use `servers` instead. Do not commit a configuration containing an Application Password to version control.

#### Command-Line Configuration

Claude Code users can add the remote server from the command line:

```bash
claude mcp add \
  --env WP_API_URL=https://yourstore.com/wp-json/mcp/mcp-adapter-default-server \
  --env WP_API_USERNAME=your-username \
  --env WP_API_PASSWORD='your-application-password' \
  poocommerce_store \
  -- npx -y @automattic/mcp-wordpress-remote@latest
```

**Troubleshooting**: For common setup issues with npx versions or SSL in local environments, see the [mcp-wordpress-remote troubleshooting guide](https://github.com/Automattic/mcp-wordpress-remote/blob/trunk/Docs/troubleshooting.md).

## Extending MCP Capabilities

Third-party plugins can register additional abilities using the WordPress Abilities API. Abilities can be implemented in various ways, including direct operations, custom logic, REST endpoint bridging, or external integrations.

### Adding Custom Abilities

Register an ability category first, then register the ability during the WordPress Abilities API init hook:

```php
add_action( 'wp_abilities_api_categories_init', function() {
    if ( ! function_exists( 'wp_register_ability_category' ) ) {
        return;
    }

    if ( function_exists( 'wp_has_ability_category' ) && wp_has_ability_category( 'your-plugin' ) ) {
        return;
    }

    wp_register_ability_category(
        'your-plugin',
        array(
            'label'       => __( 'Your Plugin', 'your-plugin' ),
            'description' => __( 'Abilities provided by Your Plugin.', 'your-plugin' ),
        )
    );
});

add_action( 'wp_abilities_api_init', function() {
    if ( ! function_exists( 'wp_register_ability' ) ) {
        return;
    }

    wp_register_ability(
        'your-plugin/custom-operation',
        array(
            'label'               => __( 'Custom Store Operation', 'your-plugin' ),
            'description'         => __( 'Performs a custom store operation.', 'your-plugin' ),
            'category'            => 'your-plugin',
            'execute_callback'    => 'your_custom_ability_handler',
            'permission_callback' => function () {
                return current_user_can( 'manage_poocommerce' );
            },
            'input_schema'        => array(
                'type'       => 'object',
                'properties' => array(
                    'store_id' => array(
                        'type'        => 'integer',
                        'description' => 'Store identifier',
                    ),
                ),
                'required' => array( 'store_id' ),
            ),
            'output_schema' => array(
                'type'       => 'object',
                'properties' => array(
                    'success' => array(
                        'type'        => 'boolean',
                        'description' => 'Operation result',
                    ),
                ),
            ),
            'meta'                => array(
                'show_in_rest' => true,
                'mcp'          => array(
                    'public' => true,
                    'type'   => 'tool',
                ),
            ),
        )
    );
});
```

The `mcp.public` and `mcp.type` metadata tells the shared WordPress MCP adapter that the ability can be exposed as an MCP tool. The `show_in_rest` metadata exposes the ability through the Abilities API REST routes.

### Including Custom Abilities in the Deprecated PooCommerce MCP Server

REST-derived PooCommerce abilities include `expose_in_deprecated_poocommerce_mcp` metadata automatically. Custom abilities are not included by namespace alone; set this metadata to boolean `true` when registering the ability to include it in the deprecated PooCommerce MCP server by default:

```php
'meta' => array(
    'show_in_rest' => true,
    'mcp'          => array(
        'public' => true,
        'type'   => 'tool',
    ),
    'expose_in_deprecated_poocommerce_mcp' => true,
),
```

To override the default metadata decision at runtime, use the `poocommerce_mcp_include_ability` filter:

```php
add_filter( 'poocommerce_mcp_include_ability', function( $include, $ability_id ) {
    if ( str_starts_with( $ability_id, 'your-plugin/' ) ) {
        return true;
    }
    return $include;
}, 10, 2 );
```

## Development Example

For a complete working example, see the [PooCommerce MCP Ability Demo Plugin](https://github.com/poocommerce/wc-mcp-ability). This demonstration plugin shows how third-party developers can:

- Register custom abilities using the WordPress Abilities API
- Define comprehensive input and output schemas
- Implement proper permission handling
- Integrate with MCP through the shared WordPress MCP adapter or the deprecated PooCommerce MCP endpoint

The demo plugin creates a `poocommerce-demo/store-info` ability that retrieves store information and statistics, demonstrating the integration patterns for extending PooCommerce MCP capabilities while using a direct implementation approach rather than REST endpoint bridging.

## Troubleshooting

### Common Issues

## MCP Server Not Available

- Verify the `mcp_integration` feature flag is enabled
- Check that the MCP adapter is properly loaded
- Review PooCommerce logs for initialization errors

## Authentication Failures

- Confirm `WP_API_USERNAME` matches the WordPress user that created the Application Password
- Confirm `WP_API_PASSWORD` contains an active Application Password, not the user's account password or a PooCommerce REST API key
- Verify the WordPress user has the capabilities required by the ability
- Ensure HTTPS is used for remote HTTP connections

## Ability Not Found

- Confirm the ability category is registered during `wp_abilities_api_categories_init`
- Confirm abilities are registered during `wp_abilities_api_init`
- For the deprecated PooCommerce MCP endpoint, check the ability's `expose_in_deprecated_poocommerce_mcp` metadata or override inclusion using the `poocommerce_mcp_include_ability` filter
- Verify ability callbacks are accessible

Check **PooCommerce → Status → Logs** for entries with source `poocommerce-mcp`.

## Important Considerations

- **Developer Preview**: This feature is in preview status and may change
- **Implementation Approach**: PooCommerce uses purpose-built domain abilities and retains REST-derived compatibility abilities for the deprecated PooCommerce MCP endpoint
- **Breaking Changes**: Future updates may introduce breaking changes
- **Production Testing**: Thoroughly test before deploying to production
- **API Stability**: The WordPress Abilities API and MCP adapter are evolving

## Related Resources

- [WordPress Abilities API Repository](https://github.com/WordPress/abilities-api)
- [WordPress MCP Adapter Repository](https://github.com/WordPress/mcp-adapter)
- [PooCommerce MCP Demo Plugin](https://github.com/poocommerce/wc-mcp-ability)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [PooCommerce REST API Documentation](/docs/apis/rest-api/)
