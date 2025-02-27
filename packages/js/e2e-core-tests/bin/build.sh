#!/usr/bin/env bash
#
# Copy the PooCommerce sample data file to the package
#

PACKAGEPATH=$(dirname $(dirname "$0"))

cp -v $PACKAGEPATH/../../../plugins/poocommerce/sample-data/sample_products.csv $PACKAGEPATH/test-data
