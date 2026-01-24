/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { WC_ASSET_URL } from '../../../../utils/admin-settings';

const MarketingHeader = ( { task, goToTask } ) => {
	return (
		<div className="poocommerce-task-header__contents-container">
			<img
				alt={ __( 'Marketing illustration', 'poocommerce' ) }
				src={ WC_ASSET_URL + 'images/task_list/sales-illustration.svg' }
				className="svg-background"
			/>
			<div className="poocommerce-task-header__contents">
				<h1>{ __( 'Reach more customers', 'poocommerce' ) }</h1>
				<p>
					{ __(
						'Start growing your business by showcasing your products on social media and Google, boost engagement with email marketing, and more!',
						'poocommerce'
					) }
				</p>
				<Button
					isSecondary={ task.isComplete }
					isPrimary={ ! task.isComplete }
					onClick={ goToTask }
				>
					{ __( 'Grow your business', 'poocommerce' ) }
				</Button>
			</div>
		</div>
	);
};

export default MarketingHeader;
