/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';
import { Placeholder } from '@wordpress/components';
import { Icon, file } from '@wordpress/icons';
import { gridBlockPreview } from '@poocommerce/resource-previews';

/**
 * Internal dependencies
 */
import { Props } from './types';

const EmptyPlaceholder = () => (
	<Placeholder
		icon={ <Icon icon={ file } /> }
		label={ __( 'Products by Category', 'poocommerce' ) }
		className="wc-block-products-grid wc-block-products-category"
	>
		{ __(
			'No products were found that matched your selection.',
			'poocommerce'
		) }
	</Placeholder>
);

export const ProductByCategoryBlock = ( props: Props ): JSX.Element => {
	const { name, attributes } = props;
	const hasCategories = attributes.categories.length;

	if ( attributes.isPreview ) {
		return gridBlockPreview;
	}

	return hasCategories ? (
		<ServerSideRender
			block={ name }
			attributes={ attributes }
			EmptyResponsePlaceholder={ EmptyPlaceholder }
		/>
	) : (
		<>
			{ __(
				'Select at least one category to display its products.',
				'poocommerce'
			) }
		</>
	);
};
