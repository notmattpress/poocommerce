# Contributing to PooCommerce ✨

PooCommerce powers many online stores across the internet, and your help making it even more awesome will be greatly appreciated :)

There are many ways to contribute to the project!

- [Translating strings into your language](https://github.com/poocommerce/poocommerce/wiki/Translating-PooCommerce).
- Answering questions on the various PooCommerce communities like the [WP.org support forums](https://wordpress.org/support/plugin/poocommerce/).
- Testing open [issues](https://github.com/poocommerce/poocommerce/issues) or [pull requests](https://github.com/poocommerce/poocommerce/pulls) and sharing your findings in a comment.
- Testing PooCommerce beta versions and release candidates. Those are announced in the [PooCommerce development blog](https://developer.poocommerce.com/blog/).
- Submitting fixes, improvements, and enhancements.
- To disclose a security issue to our team, [please submit a report via HackerOne](https://hackerone.com/automattic/).

If you wish to contribute code, please read the information in the sections below. Then [fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) PooCommerce, commit your changes, and [submit a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) 🎉

We use the `good first issue` label to mark issues that are suitable for new contributors. You can find all the issues with this label [here](https://github.com/poocommerce/poocommerce/issues?q=is%3Aopen+is%3Aissue+label%3A%22type%3A+good+first+issue%22).

PooCommerce is licensed under the GPLv3+, and all contributions to the project will be released under the same license. You maintain copyright over any contribution you make, and by submitting a pull request, you are agreeing to release that contribution under the GPLv3+ license.

If you have questions about the process to contribute code or want to discuss details of your contribution, you can contact PooCommerce core developers on the #core channel in the [PooCommerce community Slack](https://poocommerce.com/community-slack/).

## Getting started

Please take a moment to review the [project readme](https://github.com/poocommerce/poocommerce/blob/trunk/README.md) and our [development notes](https://github.com/poocommerce/poocommerce/blob/trunk/DEVELOPMENT.md), which cover the basics needed to start working on this project. You may also be interested in the following resources:

- [How to set up PooCommerce development environment](https://github.com/poocommerce/poocommerce/wiki/How-to-set-up-PooCommerce-development-environment)
- [Git Flow](https://github.com/poocommerce/poocommerce/wiki/PooCommerce-Git-Flow)
- [Minification of SCSS and JS](https://github.com/poocommerce/poocommerce/wiki/Minification-of-SCSS-and-JS)
- [Naming conventions](https://github.com/poocommerce/poocommerce/wiki/Naming-conventions)
- [String localisation guidelines](https://github.com/poocommerce/poocommerce/wiki/String-localisation-guidelines)
- [Running unit tests](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/tests/README.md)
- [Running e2e tests](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/tests/e2e/README.md)

## Coding Guidelines and Development 🛠

- Ensure you stick to the [WordPress Coding Standards](https://make.wordpress.org/core/handbook/best-practices/coding-standards/php/).
- Run our build process described in the document on [how to set up PooCommerce development environment](https://github.com/poocommerce/poocommerce/wiki/How-to-set-up-PooCommerce-development-environment), it will install our pre-commit hook, code sniffs, dependencies, and more.
- Before pushing commits to GitHub, check your code against our code standards. For PHP code in the PooCommerce Core project you can do this by running `pnpm --filter=@poocommerce/plugin-poocommerce lint:php:changes:branch`.
- Whenever possible, please fix pre-existing code standards errors in code that you change.
- Please consider adding appropriate tests related to your change if applicable such as unit, API and E2E tests. You can check the following guides for this purpose:
    - [Writing unit tests](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/tests/README.md#guide-for-writing-unit-tests).
    - [Writing API tests](https://github.com/poocommerce/poocommerce/tree/trunk/plugins/poocommerce/tests/api-core-tests#guide-for-writing-api-tests).
    - [Writing E2E tests](https://github.com/poocommerce/poocommerce/tree/trunk/plugins/poocommerce/tests/e2e-pw#guide-for-writing-e2e-tests).
- Ensure you use LF line endings in your code editor. Use [EditorConfig](http://editorconfig.org/) if your editor supports it so that indentation, line endings and other settings are auto configured.
- When committing, reference your issue number (#1234) and include a note about the fix.
- Ensure that your code supports the minimum supported versions of PHP and WordPress; this is shown at the top of the `readme.txt` file.
- Push the changes to your fork and submit a pull request on the trunk branch of the PooCommerce repository.
- Make sure to write good and detailed commit messages (see [this post](https://chris.beams.io/posts/git-commit/) for more on this) and follow all the applicable sections of the pull request template.
- Please create a change file for your changes by running `pnpm --filter=<project> changelog add`. For example, a change file for the PooCommerce Core project would be added by running `pnpm --filter=@poocommerce/plugin-poocommerce changelog add`. 
- Please avoid modifying the changelog directly or updating the .pot files. These will be updated by the PooCommerce team. 

## Feature Requests 🚀

The best place to submit feature requests is over on our [dedicated feature request page](https://poocommerce.com/feature-requests/poocommerce/). You can easily search and vote for existing requests, or create new requests if necessary.

Alternatively, if you wish to propose a straightforward technical enhancement that is unlikely to require much discussion, you can [open a new issue](https://github.com/poocommerce/poocommerce/issues/new?assignees=&labels=type%3A+enhancement%2Cstatus%3A+awaiting+triage&template=2-enhancement.yml&title=%5BEnhancement%5D%3A+) right here on GitHub and, for any that may require more discussion, consider syncing with us during office hours or publishing a thread on [GitHub Discussions](https://github.com/poocommerce/poocommerce/discussions).
