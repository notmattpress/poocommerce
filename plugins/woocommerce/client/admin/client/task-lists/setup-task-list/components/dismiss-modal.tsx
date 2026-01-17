/**
 * External dependencies
 */
import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const DismissModal = ( {
	showDismissModal,
	setShowDismissModal,
	hideTasks,
}: {
	showDismissModal: boolean;
	setShowDismissModal: ( show: boolean ) => void;
	hideTasks: ( task: string ) => void;
} ) => {
	const closeModal = () => setShowDismissModal( false );
	const title = __( 'Hide store setup tasks', 'poocommerce' );
	const message = __(
		'Are you sure? These tasks are required for all stores.',
		'poocommerce'
	);
	const dismissActionText = __( 'Cancel', 'poocommerce' );
	const acceptActionText = __( 'Yes, hide store setup tasks', 'poocommerce' );
	return (
		<>
			{ showDismissModal && (
				<Modal
					title={ title }
					className="poocommerce-task-dismiss-modal"
					onRequestClose={ closeModal }
				>
					<div className="poocommerce-task-dismiss-modal__wrapper">
						<div className="poocommerce-usage-modal__message">
							{ message }
						</div>
						<div className="poocommerce-usage-modal__actions">
							<Button
								onClick={ () => setShowDismissModal( false ) }
							>
								{ dismissActionText }
							</Button>
							<Button
								isPrimary
								onClick={ () => {
									hideTasks( 'remove_card' );
									setShowDismissModal( false );
								} }
							>
								{ acceptActionText }
							</Button>
						</div>
					</div>
				</Modal>
			) }
		</>
	);
};

export default DismissModal;
