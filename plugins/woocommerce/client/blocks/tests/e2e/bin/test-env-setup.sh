#!/usr/bin/env bash
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Remove the database snapshot if it exists.
wp-env run tests-cli -- rm -f blocks_e2e.sql
# Run the main script in the container for better performance.
wp-env run tests-cli -- bash wp-content/plugins/poocommerce/blocks-bin/playwright/scripts/index.sh
# Disable the LYS Coming Soon banner.
wp-env run tests-cli -- wp option update poocommerce_coming_soon 'no'
# Activate the Test Helper APIs utility plugin.
wp-env run tests-cli -- wp plugin activate poocommerce-test-plugins/test-helper-apis

echo "Generating test translations"
node $script_dir/generate-test-translations.js
