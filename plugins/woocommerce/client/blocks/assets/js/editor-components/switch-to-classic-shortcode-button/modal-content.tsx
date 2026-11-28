/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

export const ModalContent = ( {
	blockType = 'poocommerce/cart',
}: {
	blockType: 'poocommerce/cart' | 'poocommerce/checkout';
} ): JSX.Element => {
	if ( blockType === 'poocommerce/cart' ) {
		return (
			<p>
				{ __(
					'If you continue, the cart block will be replaced with the classic experience powered by shortcodes. This means that you may lose customizations that you made to the cart block.',
					'poocommerce'
				) }
			</p>
		);
	}

	return (
		<>
			<p>
				{ __(
					'If you continue, the checkout block will be replaced with the classic experience powered by shortcodes. This means that you may lose:',
					'poocommerce'
				) }
			</p>
			<ul className="cross-list">
				<li>
					{ __(
						'Customizations and updates to the block',
						'poocommerce'
					) }
				</li>
				<li>
					{ __(
						'Additional local pickup options created for the new checkout',
						'poocommerce'
					) }
				</li>
			</ul>
		</>
	);
};
