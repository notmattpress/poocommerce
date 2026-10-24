/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { getQuery, updateQueryString } from '@poocommerce/navigation';
import interpolateComponents from '@automattic/interpolate-components';
import { Link } from '@poocommerce/components';

/**
 * Internal dependencies
 */
import Modal from '~/task-lists/components/usage-modal';

export const UsageModal = () => {
	const query = getQuery();
	const shouldDisplayModal = query[ 'wcpay-connection-success' ] === '1';
	const [ isOpen, setIsOpen ] = useState( shouldDisplayModal );

	if ( ! isOpen ) {
		return null;
	}

	const closeModal = () => {
		setIsOpen( false );
		updateQueryString( { 'wcpay-connection-success': undefined } );
	};

	const title = __(
		'Help us build a better WooPayments experience',
		'poocommerce'
	);
	const trackingMessage = interpolateComponents( {
		mixedString: __(
			'By agreeing to share non-sensitive {{link}}usage data{{/link}}, you’ll help us improve features and optimize the WooPayments experience. You can opt out at any time.',
			'poocommerce'
		),
		components: {
			link: (
				<Link
					href="https://poocommerce.com/usage-tracking?utm_medium=product"
					target="_blank"
					type="external"
				/>
			),
		},
	} );

	return (
		<Modal
			isDismissible={ false }
			title={ title }
			message={ trackingMessage }
			acceptActionText={ __( 'I agree', 'poocommerce' ) }
			dismissActionText={ __( 'No thanks', 'poocommerce' ) }
			onContinue={ closeModal }
			onClose={ closeModal }
		/>
	);
};

export default UsageModal;
