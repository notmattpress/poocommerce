/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import ProductControl from '@poocommerce/editor-components/product-control';
import type { SelectedOption } from '@poocommerce/block-hocs';
import { createInterpolateElement } from '@wordpress/element';
import {
	Placeholder,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import type { ProductCollectionEditComponentProps } from '../types';
import { getCollectionByName } from '../collections';

const SingleProductPicker = (
	props: ProductCollectionEditComponentProps & {
		isDeletedProductReference: boolean;
	}
) => {
	const { attributes, isDeletedProductReference } = props;

	const blockProps = useBlockProps();

	const collection = getCollectionByName( attributes.collection );
	if ( ! collection ) {
		return null;
	}

	const infoText = isDeletedProductReference
		? __(
				'Previously selected product is no longer available.',
				'poocommerce'
		  )
		: createInterpolateElement(
				sprintf(
					/* translators: %s: collection title */
					__(
						'<strong>%s</strong> requires a product to be selected in order to display associated items.',
						'poocommerce'
					),
					collection.title
				),
				{ strong: <strong /> }
		  );

	return (
		<div { ...blockProps }>
			<Placeholder className="wc-block-editor-product-collection__product-picker">
				<HStack alignment="center">
					<Icon
						icon={ info }
						className="wc-block-editor-product-collection__info-icon"
					/>
					<Text>{ infoText }</Text>
				</HStack>
				<ProductControl
					selected={
						attributes.query?.productReference as SelectedOption
					}
					onChange={ ( value = [] ) => {
						const isValidId = ( value[ 0 ]?.id ?? null ) !== null;
						if ( isValidId ) {
							props.setAttributes( {
								query: {
									...attributes.query,
									productReference: value[ 0 ].id,
								},
							} );
						}
					} }
					messages={ {
						search: __( 'Select a product', 'poocommerce' ),
					} }
				/>
			</Placeholder>
		</div>
	);
};

export default SingleProductPicker;
