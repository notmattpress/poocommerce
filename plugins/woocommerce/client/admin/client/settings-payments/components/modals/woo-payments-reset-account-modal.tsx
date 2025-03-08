/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Button, Modal } from '@wordpress/components';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './modals.scss';
import { getWooPaymentsResetAccountLink } from '~/settings-payments/utils';

interface WooPaymentsResetAccountModalProps {
	/**
	 * Indicates if the modal is currently open.
	 */
	isOpen: boolean;
	/**
	 * Callback function to handle modal closure.
	 */
	onClose: () => void;

	/**
	 * Indicates if the account is a test-drive/sandbox account.
	 */
	isTestMode?: boolean;
}

/**
 * A modal component that allows users to reset their WooPayments test account.
 */
export const WooPaymentsResetAccountModal = ( {
	isOpen,
	onClose,
	isTestMode,
}: WooPaymentsResetAccountModalProps ) => {
	const [ isResettingAccount, setIsResettingAccount ] = useState( false );

	/**
	 * Handles the "Reset Account" action.
	 * Redirects the user to the WooPayments reset account link.
	 */
	const handleResetAccount = () => {
		setIsResettingAccount( true );

		window.location.href = getWooPaymentsResetAccountLink();
	};

	return (
		<>
			{ isOpen && (
				<Modal
					title={ __( 'Reset your test account', 'poocommerce' ) }
					className="poocommerce-woopayments-modal"
					isDismissible={ true }
					onRequestClose={ onClose }
				>
					<div className="poocommerce-woopayments-modal__content">
						<div className="poocommerce-woopayments-modal__content__item">
							<div>
								<span>
									{ isTestMode
										? sprintf(
												/* translators: %s: plugin name */
												__(
													'When you reset your test account, all payment data — including your %s account details, test transactions, and payouts history — will be lost. Your order history will remain. This action cannot be undone, but you can create a new test account at any time.',
													'poocommerce'
												),
												'WooPayments'
										  )
										: sprintf(
												/* translators: %s: plugin name */
												__(
													'When you reset your account, all payment data — including your %s account details, test transactions, and payouts history — will be lost. Your order history will remain. This action cannot be undone, but you can create a new test account at any time.',
													'poocommerce'
												),
												'WooPayments'
										  ) }
								</span>
							</div>
						</div>
						<div className="poocommerce-woopayments-modal__content__item">
							<h3>
								{ __(
									"Are you sure you'd like to continue?",
									'poocommerce'
								) }
							</h3>
						</div>
					</div>
					<div className="poocommerce-woopayments-modal__actions">
						<Button
							className="danger"
							variant="secondary"
							isBusy={ isResettingAccount }
							disabled={ isResettingAccount }
							onClick={ handleResetAccount }
						>
							{ __( 'Yes, reset account', 'poocommerce' ) }
						</Button>
					</div>
				</Modal>
			) }
		</>
	);
};
