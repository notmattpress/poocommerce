# Using an External Environment for End to End Testing

This document provides general instructions for using `@poocommerce/e2e-environment` with your PooCommerce environment. Whether you're using a non-standard Docker configuration, a locally-hosted WC install, or a WC install hosted externally, these instructions should point you to what is needed for configuration.

## Prerequisites

Complete the [setup instructions](./README.md) in each project/repository.

## Initialization Requirements

The test sequencer uses a `ready` page to determine that the testing environment is ready for testing. It will wait up to 5 minutes for this page to be created. In your initialization script use

```
wp post create --post_type=page --post_status=publish --post_title='Ready' --post_content='E2E-tests.'
```

If you don't have shell access to your test site, simply create a Page with the title `Ready` and the content `E2E-tests.` through the WP Admin.

### Project Initialization

Each project will have its own begin test state and initialization script. For example, a project might start testing expecting that the [sample products](https://github.com/poocommerce/poocommerce/tree/trunk/sample-data) have already been imported. Below is the WP CLI equivalent initialization script for PooCommerce Core E2E testing (which expects certain users to be present and that WC is installed and active):

```
wp core install --url=http://localhost:8084 --admin_user=admin --admin_password=password --admin_email=wooadmin@example.org
wp plugin activate poocommerce
wp theme install twentynineteen --activate
wp user create customer customer@poocommercecoree2etestsuite.com \
	--user_pass=password \
	--role=subscriber \
	--first_name='Jane' \
	--last_name='Smith'
```

Again, if you don't have shell access to your test site, through WP Admin ensure that:

1. PooCommerce is installed and activated.
2. TwentyNineteen is installed and the active theme.
3. You have an admin user set up (if their credentials differ from u/ `admin` and p/ `password` be sure to update `/plugins/poocommerce/tests/e2e/config/default.json`)
4. You have a customer user set up named 'Jane Smith'. This user should be a `subscriber` and again make sure their username and password are reflected in `/plugins/poocommerce/tests/e2e/config/default.json`.

You should then be able to run the e2e tests by running `pnpm e2e --filter=@poocommerce/plugin-poocommerce`.

### Test Sequencer Setup

The test sequencer needs to know the particulars of your test install to run the tests. The sequencer reads these settings from `/plugins/poocommerce/tests/e2e/config/default.json`.

- The `customer` entry is not required by the sequencer but is required for the core test suite.
- The `url` value must match the URL of your testing container.

```
{
  "url": "http://localhost:8084/",
  "users": {
    "admin": {
      "username": "admin",
      "password": "password"
    },
    "customer": {
      "username": "customer",
      "password": "password"
    }
  }
}
```

### Travis CI

Add the following to the appropriate sections of your `.travis.yml` config file.

```yaml
version: ~> 1.0

  include:
    - name: "Core E2E Tests"
    php: 7.4
    env: WP_VERSION=latest WP_MULTISITE=0 RUN_E2E=1

....

script:
  - npm install jest --global
# add your initialization script here
  - npx wc-e2e test:e2e

....

after_script:
# add script to shut down your test container
```

Use `[[ ${RUN_E2E} == 1 ]]` in your Travis related bash scripts to test whether it is an E2E test run.

