/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { WC_ASSET_URL } from '../../../../utils/admin-settings';

const StoreDetailsHeader = ( { task, goToTask } ) => {
	return (
		<div className="poocommerce-task-header__contents-container">
			<img
				alt={ __( 'Store location illustration', 'poocommerce' ) }
				src={
					WC_ASSET_URL +
					'images/task_list/store-details-illustration.png'
				}
				className="svg-background"
			/>
			<div className="poocommerce-task-header__contents">
				<h1>
					{ __( 'First, tell us about your store', 'poocommerce' ) }
				</h1>
				<p>
					{ __(
						'Get your store up and running in no time. Add your store’s address to set up shipping, tax and payments faster.',
						'poocommerce'
					) }
				</p>
				<Button
					isSecondary={ task.isComplete }
					isPrimary={ ! task.isComplete }
					onClick={ goToTask }
				>
					{ __( 'Add details', 'poocommerce' ) }
				</Button>
			</div>
		</div>
	);
};

export default StoreDetailsHeader;
