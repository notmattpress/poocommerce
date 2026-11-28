/**
 * External dependencies
 */
import { globalIgnores } from 'eslint/config';

/**
 * Internal dependencies
 */
import poocommerce from '@poocommerce/eslint-config';

export default [ ...poocommerce, globalIgnores( [ 'dist/**' ] ) ];
