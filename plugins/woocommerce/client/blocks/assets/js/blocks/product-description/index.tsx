/**
 * External dependencies
 */
import { registerProductBlockType } from '@poocommerce/atomic-utils';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit';
import icon from './icon';

const blockConfig = {
	...metadata,
	icon,
	edit,
};

registerProductBlockType( blockConfig, {
	isAvailableOnPostEditor: true,
} );
