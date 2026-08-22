/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { WC_ASSET_URL } from '../../../../utils/admin-settings';

const TaxHeader = ( { task, goToTask } ) => {
	return (
		<div className="poocommerce-task-header__contents-container">
			<img
				alt={ __( 'Tax illustration', 'poocommerce' ) }
				src={ WC_ASSET_URL + 'images/task_list/tax-illustration.svg' }
				className="svg-background"
			/>
			<div className="poocommerce-task-header__contents">
				<h1>{ __( 'Configure your tax settings', 'poocommerce' ) }</h1>
				<p>
					{ __(
						'Choose to set up your tax rates manually, or use one of our tax automation tools.',
						'poocommerce'
					) }
				</p>
				<Button
					isSecondary={ task.isComplete }
					isPrimary={ ! task.isComplete }
					onClick={ goToTask }
				>
					{ __( 'Collect sales tax', 'poocommerce' ) }
				</Button>
			</div>
		</div>
	);
};

export default TaxHeader;
