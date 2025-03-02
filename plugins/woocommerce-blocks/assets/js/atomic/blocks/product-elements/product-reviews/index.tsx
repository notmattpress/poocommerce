/**
 * External dependencies
 */
import { registerProductBlockType } from '@poocommerce/atomic-utils';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit';
import './style.scss';

const blockConfig = {
	...metadata,
	edit,
};

registerProductBlockType( blockConfig, {
	isAvailableOnPostEditor: false,
} );
