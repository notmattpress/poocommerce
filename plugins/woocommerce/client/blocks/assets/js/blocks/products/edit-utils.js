/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, Placeholder } from '@wordpress/components';
import { ADMIN_URL } from '@poocommerce/settings';
import { Icon, external } from '@wordpress/icons';

export const renderNoProductsPlaceholder = ( blockTitle, blockIcon ) => (
	<Placeholder
		className="wc-block-products"
		icon={ blockIcon }
		label={ blockTitle }
	>
		<p>
			{ __(
				"You haven't published any products to list here yet.",
				'poocommerce'
			) }
		</p>
		<Button
			className="wc-block-products__add-product-button"
			variant="secondary"
			href={ ADMIN_URL + 'post-new.php?post_type=product' }
			target="_top"
		>
			{ __( 'Add new product', 'poocommerce' ) + ' ' }
			<Icon icon={ external } />
		</Button>
		<Button
			className="wc-block-products__read_more_button"
			variant="tertiary"
			href="https://poocommerce.com/document/managing-products/"
			target="_blank"
		>
			{ __( 'Learn more', 'poocommerce' ) }
		</Button>
	</Placeholder>
);

export const renderHiddenContentPlaceholder = ( blockTitle, blockIcon ) => (
	<Placeholder
		className="wc-block-products"
		icon={ blockIcon }
		label={ blockTitle }
	>
		{ __(
			'The content for this block is hidden due to block settings.',
			'poocommerce'
		) }
	</Placeholder>
);
