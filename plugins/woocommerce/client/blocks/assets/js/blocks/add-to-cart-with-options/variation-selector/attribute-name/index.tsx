/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { Icon, heading } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import AttributeNameEdit from './edit';
import { shouldBlockifiedAddToCartWithOptionsBeRegistered } from '../../utils';

if ( shouldBlockifiedAddToCartWithOptionsBeRegistered ) {
	registerBlockType( metadata, {
		edit: AttributeNameEdit,
		attributes: metadata.attributes,
		icon: {
			src: <Icon icon={ heading } />,
		},
		save: () => null,
	} );
}
