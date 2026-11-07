#!/bin/bash

set -eo pipefail

SCRIPT_PATH=$(
  cd "$(dirname "${BASH_SOURCE[0]}")" || return
  pwd -P
)

PLUGIN_REPOSITORY='poocommerce/poocommerce-paypal-payments' PLUGIN_NAME='PooCommerce PayPal Payments' PLUGIN_SLUG=poocommerce-paypal-payments "$SCRIPT_PATH"/../../bin/install-plugin.sh
