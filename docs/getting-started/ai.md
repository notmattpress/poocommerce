---
post_title: AI
sidebar_label: AI
sidebar_position: 3
---

# AI

This guide provides an overview of AI tools and how to use them to enhance your PooCommerce development workflows.

## MCP

PooCommerce registers product and order abilities that compatible AI clients can use through the WordPress MCP Adapter. This integration is a developer preview. See the [MCP documentation](/docs/features/mcp/) for setup and permissions.

## AI documentation tools

### Curated documentation index

The [curated `llms.txt` index](https://developer.poocommerce.com/docs/llms.txt) links directly to Markdown versions of starting points and key references for PooCommerce development. Choose the guides relevant to your task, then open the individual pages for full instructions.

The index does not include the contents of the [PooCommerce Code Reference](https://poocommerce.github.io/code-reference/).

### Serve as Markdown

To read an individual documentation page as Markdown, append `.md` to its URL. For example, this page is available at:

```text
https://developer.poocommerce.com/docs/getting-started/ai.md
```

### Copy to Markdown

On every page of the Developer Docs, you'll see a Clipboard icon in the upper-right-hand corner. Selecting this icon will copy the current doc in Markdown formatting, which you can paste into your LLM's chat interface.

## AI Development Tools

### Agent Skills for Contributors

The PooCommerce monorepo includes [agent skills](https://agentskills.io/home) that provide AI assistants with procedural guidance for common development tasks. These skills are located in the `.ai/skills/` directory at the root of the repository.

Each skill contains a `SKILL.md` file with step-by-step instructions for tasks like:

- Backend PHP development and testing conventions
- Code review standards and best practices
- Git workflows and commit conventions
- Build and linting processes
- UI copy and documentation guidelines

Skills are designed to be tool-agnostic and can be used with various AI coding assistants. To explore available skills, browse the [`.ai/skills/` directory](https://github.com/poocommerce/poocommerce/tree/trunk/.ai/skills) in the repository.

### Agent Skills for Extending

If you are building on top of WordPress and PooCommerce, the [WordPress/agent-skills](https://github.com/WordPress/agent-skills) and [poocommerce/agent-skills](https://github.com/poocommerce/agent-skills) repositories provide reusable guidance for AI coding assistants.

The WordPress skills cover foundational WordPress development patterns, while the PooCommerce skills build on those foundations with guidance for PooCommerce extension development. Review both repositories for installation instructions.

### Cursor Rules files for contributors

The `.cursor/rules/` directory contains configuration files that provide AI assistants with specific guidance for working with the PooCommerce codebase. These files help ensure consistent development practices and workflows.
