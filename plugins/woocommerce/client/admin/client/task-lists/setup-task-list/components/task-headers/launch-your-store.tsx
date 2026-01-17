/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { TaskType } from '@poocommerce/data';
/**
 * Internal dependencies
 */
import { WC_ASSET_URL } from '../../../../utils/admin-settings';

const LaunchYourStoreHeader = ( {
	task,
	goToTask,
}: {
	task: TaskType;
	goToTask: React.MouseEventHandler;
} ) => {
	return (
		<div
			className={ `poocommerce-task-header__contents-container poocommerce-task-header__${ task.id }` }
		>
			<img
				alt={ __( 'Launch Your Store illustration', 'poocommerce' ) }
				src={
					WC_ASSET_URL +
					'images/task_list/launch-your-store-illustration.svg'
				}
				className="svg-background"
			/>
			<div className="poocommerce-task-header__contents">
				<h1>
					{ __( 'Your store is ready for launch!', 'poocommerce' ) }
				</h1>
				<p>
					{ __(
						'It’s time to celebrate – you’re ready to launch your store! Woo! Hit the button to preview your store and make it public.',
						'poocommerce'
					) }
				</p>
				<Button
					variant={ task.isComplete ? 'secondary' : 'primary' }
					onClick={ goToTask }
				>
					{ __( 'Launch store', 'poocommerce' ) }
				</Button>
			</div>
		</div>
	);
};

export default LaunchYourStoreHeader;
