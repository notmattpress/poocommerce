/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { cart } from '@poocommerce/icons';
import { Icon } from '@wordpress/icons';
import { registerBlockType } from '@wordpress/blocks';
import type { BlockConfiguration } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import edit, { Save as save } from './edit';
import { blockName, attributes } from './attributes';
import './inner-blocks';

const settings: BlockConfiguration = {
	apiVersion: 3,
	title: __( 'Mini-Cart Contents', 'poocommerce' ),
	icon: {
		src: (
			<Icon
				icon={ cart }
				className="wc-block-editor-components-block-icon"
			/>
		),
	},
	category: 'poocommerce',
	keywords: [ __( 'PooCommerce', 'poocommerce' ) ],
	description: __( 'Display a Mini-Cart widget.', 'poocommerce' ),
	supports: {
		align: false,
		html: false,
		multiple: false,
		reusable: false,
		inserter: false,
		color: {
			link: true,
		},
		lock: false,
		__experimentalBorder: {
			color: true,
			width: true,
		},
	},
	attributes,
	example: {
		attributes: {
			isPreview: true,
		},
	},
	edit,
	save,
};

registerBlockType( blockName, settings );
