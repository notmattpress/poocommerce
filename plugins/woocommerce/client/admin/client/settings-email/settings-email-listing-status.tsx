/**
 * Inspired by https://github.com/WordPress/gutenberg/blob/ee3406972d4688cf90efecb49cb0b158f49652a4/packages/fields/src/fields/status/index.tsx
 * The statusField provided by @wordpress/fields is not used because it doesn't allow custom statuses.
 */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { scheduled, published, cancelCircleFilled } from '@wordpress/icons';
import { __experimentalHStack as HStack, Icon } from '@wordpress/components';

export const EMAIL_STATUSES = [
	{
		value: 'enabled',
		label: __( 'Enabled', 'poocommerce' ),
		icon: published,
	},
	{
		value: 'disabled',
		label: __( 'Disabled', 'poocommerce' ),
		icon: cancelCircleFilled,
	},
	{
		value: 'manual',
		label: __( 'Manually sent', 'poocommerce' ),
		icon: scheduled,
	},
];

export const Status = ( { slug }: { slug: string | undefined } ) => {
	const status = slug
		? EMAIL_STATUSES.find( ( s ) => s.value === slug )
		: undefined;
	if ( ! status ) {
		return slug;
	}
	return (
		<HStack
			alignment="left"
			spacing={ 0 }
			className="poocommerce-email-listing-status"
		>
			<Icon icon={ status.icon } size={ 24 } />
			<span className="poocommerce-email-listing-status-label">
				{ status.label }
			</span>
		</HStack>
	);
};
