/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';
import { UpgradeDowngradeNotice } from '@poocommerce/editor-components/upgrade-downgrade-notice';

/**
 * Internal dependencies
 */
import { upgradeToBlockifiedProductGallery } from './edit-utils';

export const UpgradeNotice = ( {
	blockClientId,
	showAddToCartWithOptionsCompatibilityNotice,
}: {
	blockClientId: string;
	showAddToCartWithOptionsCompatibilityNotice: boolean;
} ) => {
	const notice = showAddToCartWithOptionsCompatibilityNotice
		? __(
				'The classic Product Image Gallery block is not compatible with the Add to Cart + Options block in this template. Switch to the new Product Gallery block for a better experience.',
				'poocommerce'
		  )
		: createInterpolateElement(
				__(
					'Upgrade to the <strongText /> for more flexibility.',
					'poocommerce'
				),
				{
					strongText: (
						<strong>
							{ __( `Product Gallery block`, 'poocommerce' ) }
						</strong>
					),
				}
		  );

	const buttonLabel = __( 'Use the Product Gallery block', 'poocommerce' );

	return (
		<UpgradeDowngradeNotice
			isDismissible={ false }
			actionLabel={ buttonLabel }
			onActionClick={ () =>
				upgradeToBlockifiedProductGallery( blockClientId )
			}
			status={
				showAddToCartWithOptionsCompatibilityNotice ? 'warning' : 'info'
			}
		>
			{ notice }
		</UpgradeDowngradeNotice>
	);
};
