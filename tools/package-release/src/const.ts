/**
 * External dependencies
 */
import { dirname } from 'path';

// Escape from ./tools/package-release/src
export const MONOREPO_ROOT = dirname( dirname( dirname( __dirname ) ) );

// Packages that are not meant to be released by monorepo team for whatever reason.
export const excludedPackages = [
	'@poocommerce/admin-e2e-tests',
	'@poocommerce/api',
	'@poocommerce/api-core-tests',
	'@poocommerce/e2e-core-tests',
	'@poocommerce/e2e-environment',
	'@poocommerce/e2e-utils',
];
