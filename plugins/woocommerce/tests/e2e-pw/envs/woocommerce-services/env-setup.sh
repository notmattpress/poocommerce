#!/bin/bash

set -eo pipefail

SCRIPT_PATH=$(
  cd "$(dirname "${BASH_SOURCE[0]}")" || return
  pwd -P
)

PLUGIN_REPOSITORY='automattic/poocommerce-services' PLUGIN_NAME='PooCommerce Shipping & Tax' PLUGIN_SLUG='poocommerce-services' "$SCRIPT_PATH"/../../bin/install-plugin.sh
