---
post_title: AI
sidebar_label: AI
sidebar_position: 3
---

# AI

This guide provides an overview of AI tools and how to use them to enhance your PooCommerce development workflows.

## MCP

PooCommerce includes native support for the Model Context Protocol (MCP), enabling AI assistants and tools to interact directly with PooCommerce stores through a standardized protocol. Visit our full [MCP documentation](/docs/features/mcp/) for more information.

## AI Documentation Tools

### LLMS.txt Files

To feed the PooCommerce Developer Documentation into your LLM or AI-assisted IDE, you have two options:

1. [`llms.txt`](https://developer.poocommerce.com/docs/llms.txt) - A table of contents that includes the title, URL, and description of each document in the developer docs.
2. [`llms-full.txt`](https://developer.poocommerce.com/docs/llms-full.txt) - A full Markdown-formatted export of the entire documentation in one file.

If you are using an IDE like Cursor or Windsurf, we recommend adding these links as custom documentation so that you can reference them as needed.

**Note** that these do not include the contents of the [WC REST API documentation](https://poocommerce.github.io/poocommerce-rest-api-docs/#introduction) or the [PooCommerce Code Reference](https://poocommerce.github.io/code-reference/).

### Copy to Markdown

On every page of the Developer Docs, you'll see a Clipboard icon in the upper-right hand corner. Selecting this icon will copy the current doc in Markdown formatting, which you can paste into your LLM's chat interface.

## AI Development Tools

### Cursor Rules files for contributors

The `.cursor/rules/` directory contains configuration files that provide AI assistants with specific guidance for working with the PooCommerce codebase. These files help ensure consistent development practices and workflows:

-   **`generate-pr-description.mdc`** - Provides guidelines for creating pull request descriptions using the repository's PR template. It ensures proper markdown structure, changelog formatting, and automation compatibility.

-   **`git.mdc`** - Defines branching conventions and commit message standards for the PooCommerce repository, including naming patterns for different types of changes (fixes, features, refactors, etc.).

-   **`woo-build.mdc`** - Contains instructions for building the PooCommerce plugin, including dependency installation commands and development build processes using pnpm and nvm.

-   **`woo-phpunit.mdc`** - Provides guidance for running PHPUnit tests in the PooCommerce codebase, including the specific command structure and directory requirements.

These rules files help AI assistants understand the project's development workflow and maintain consistency with PooCommerce's coding standards and practices.
