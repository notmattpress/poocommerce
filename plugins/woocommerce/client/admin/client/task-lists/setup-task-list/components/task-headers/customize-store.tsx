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
import { isWooExpress } from '~/utils/is-woo-express';

const CustomizeStoreHeader = ( {
	task,
	goToTask,
}: {
	task: TaskType;
	goToTask: React.MouseEventHandler;
} ) => {
	const taskDescription = isWooExpress()
		? __(
				'Use our built-in AI tools to design your store and populate it with content, or select a pre-built theme and customize it to fit your brand.',
				'poocommerce'
		  )
		: __(
				'Quickly create a beautiful looking store using our built-in store designer, or select a pre-built theme and customize it to fit your brand.',
				'poocommerce'
		  );
	return (
		<div
			className={ `poocommerce-task-header__contents-container poocommerce-task-header__${ task.id }` }
		>
			<img
				alt={ __( 'Customize your store illustration', 'poocommerce' ) }
				src={
					WC_ASSET_URL +
					'images/task_list/customize-store-illustration.svg'
				}
				className="svg-background"
			/>
			<div className="poocommerce-task-header__contents">
				<h1>{ __( 'Start customizing your store', 'poocommerce' ) }</h1>
				<p>{ taskDescription }</p>
				<Button
					isSecondary={ task.isComplete }
					isPrimary={ ! task.isComplete }
					onClick={ goToTask }
				>
					{ __( 'Start customizing', 'poocommerce' ) }
				</Button>
			</div>
		</div>
	);
};

export default CustomizeStoreHeader;
