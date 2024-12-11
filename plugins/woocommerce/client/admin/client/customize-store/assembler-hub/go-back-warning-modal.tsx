/**
 * External dependencies
 */
import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const GoBackWarningModal = ( {
	setOpenWarningModal,
	onExitClicked,
	classname = 'poocommerce-customize-store__design-change-warning-modal',
}: {
	setOpenWarningModal: ( arg0: boolean ) => void;
	onExitClicked: () => void;
	classname?: string;
} ) => {
	return (
		<Modal
			className={ classname }
			title={ __( 'Are you sure you want to exit?', 'poocommerce' ) }
			onRequestClose={ () => setOpenWarningModal( false ) }
			shouldCloseOnClickOutside={ false }
		>
			<p>
				{ __(
					"You'll lose any changes you've made to your store's design and will start the process again.",
					'poocommerce'
				) }
			</p>
			<div className="poocommerce-customize-store__design-change-warning-modal-footer">
				<Button onClick={ onExitClicked } variant="link">
					{ __( 'Exit and lose changes', 'poocommerce' ) }
				</Button>
				<Button
					onClick={ () => setOpenWarningModal( false ) }
					variant="primary"
				>
					{ __( 'Continue designing', 'poocommerce' ) }
				</Button>
			</div>
		</Modal>
	);
};
