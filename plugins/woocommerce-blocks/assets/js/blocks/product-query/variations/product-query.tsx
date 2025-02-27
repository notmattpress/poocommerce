/**
 * External dependencies
 */
import {
	registerBlockVariation,
	unregisterBlockVariation,
} from '@wordpress/blocks';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { stacks } from '@poocommerce/icons';
import { isWpVersion, getSettingWithCoercion } from '@poocommerce/settings';
import { select, subscribe } from '@wordpress/data';
import {
	QueryBlockAttributes,
	ProductQueryBlockQuery,
} from '@poocommerce/blocks/product-query/types';
import { isSiteEditorPage } from '@poocommerce/utils';
import { isNumber } from '@poocommerce/types';

/**
 * Internal dependencies
 */
import {
	PRODUCT_QUERY_VARIATION_NAME,
	DEFAULT_ALLOWED_CONTROLS,
	INNER_BLOCKS_TEMPLATE,
	QUERY_DEFAULT_ATTRIBUTES,
	QUERY_LOOP_ID,
} from '../constants';

const ARCHIVE_PRODUCT_TEMPLATES = [
	'poocommerce/poocommerce//archive-product',
	'poocommerce/poocommerce//taxonomy-product_cat',
	'poocommerce/poocommerce//taxonomy-product_tag',
	'poocommerce/poocommerce//taxonomy-product_attribute',
	'poocommerce/poocommerce//product-search-results',
];

const registerProductsBlock = ( attributes: QueryBlockAttributes ) => {
	registerBlockVariation( QUERY_LOOP_ID, {
		description: __(
			'A block that displays a selection of products in your store.',
			'poocommerce'
		),
		name: PRODUCT_QUERY_VARIATION_NAME,
		/* translators: “Products“ is the name of the block. */
		title: __( 'Products (Beta)', 'poocommerce' ),
		isActive: ( blockAttributes ) =>
			blockAttributes.namespace === PRODUCT_QUERY_VARIATION_NAME,
		icon: (
			<Icon
				icon={ stacks }
				className="wc-block-editor-components-block-icon wc-block-editor-components-block-icon--stacks"
			/>
		),
		attributes: {
			...attributes,
			namespace: PRODUCT_QUERY_VARIATION_NAME,
		},
		// Gutenberg doesn't support this type yet, discussion here:
		// https://github.com/WordPress/gutenberg/pull/43632
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		allowedControls: DEFAULT_ALLOWED_CONTROLS,
		innerBlocks: INNER_BLOCKS_TEMPLATE,
		scope: [],
	} );
};

if ( isWpVersion( '6.1', '>=' ) ) {
	let currentTemplateId: string | undefined;
	subscribe( () => {
		const previousTemplateId = currentTemplateId;
		const store = select( 'core/edit-site' );
		currentTemplateId = store?.getEditedPostId();
		if ( previousTemplateId === currentTemplateId ) {
			return;
		}

		if ( isSiteEditorPage( store ) ) {
			const inherit =
				ARCHIVE_PRODUCT_TEMPLATES.includes( currentTemplateId );

			const inheritQuery: Partial< ProductQueryBlockQuery > = {
				inherit,
			};

			if ( inherit ) {
				inheritQuery.perPage = getSettingWithCoercion(
					'loopShopPerPage',
					12,
					isNumber
				);
			}

			const queryAttributes = {
				...QUERY_DEFAULT_ATTRIBUTES,
				query: {
					...QUERY_DEFAULT_ATTRIBUTES.query,
					...inheritQuery,
				},
			};

			unregisterBlockVariation(
				QUERY_LOOP_ID,
				PRODUCT_QUERY_VARIATION_NAME
			);

			registerProductsBlock( queryAttributes );
		}
	}, 'core/edit-site' );

	let isBlockRegistered = false;
	subscribe( () => {
		if ( ! isBlockRegistered ) {
			isBlockRegistered = true;
			registerProductsBlock( QUERY_DEFAULT_ATTRIBUTES );
		}
	}, 'core/edit-post' );
}
