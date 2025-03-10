#!/bin/bash

set -eo pipefail

SCRIPT_PATH=$(
  cd "$(dirname "${BASH_SOURCE[0]}")" || return
  pwd -P
)

PLUGIN_REPOSITORY='automattic/poocommerce-payments' PLUGIN_NAME=WooPayments PLUGIN_SLUG=poocommerce-payments "$SCRIPT_PATH"/../../bin/install-plugin.sh
