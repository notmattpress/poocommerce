---
sidebar_label: Testing
category_slug: testing
post_title: Testing
---

# Testing

Setting up your test environment and writing tests when contributing to PooCommerce Core are essential parts of our development pipeline. The links below are also included in our [Contributing Guidelines](https://github.com/poocommerce/poocommerce/blob/trunk/.github/CONTRIBUTING.md) on GitHub.

If you have questions about testing, reach out to the developer community in our public channels: [Developer Blog](https://developer.poocommerce.com/blog/), [GitHub Discussions](https://github.com/poocommerce/poocommerce/discussions), or [Community Slack](https://poocommerce.com/community-slack/).

## Unit testing

[Unit tests](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/tests/README.md) run against the PooCommerce PHP test suite. The recommended local setup uses `wp-env`.

## End-to-end testing

[End-to-end tests](https://github.com/poocommerce/poocommerce/tree/trunk/plugins/poocommerce/tests/e2e) are powered by Playwright. The test site is spun up using `wp-env`.

## API testing

[API tests](https://github.com/poocommerce/poocommerce/tree/trunk/plugins/poocommerce/tests/e2e/tests/api-tests) are part of the Playwright suite and use the same `wp-env` test environment as end-to-end tests.

## Testing instructions

When opening a pull request, use the [testing instructions guide](/docs/contribution/testing/writing-high-quality-testing-instructions/) to write clear steps that cover the behavior changed in the PR.

## Calls for testing

Keep tabs on calls for testing on our [developer blog](https://developer.poocommerce.com/blog/), and read our [beta testing instructions](/docs/contribution/testing/beta-testing/) to help us build new features and enhancements.
