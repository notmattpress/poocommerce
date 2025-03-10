/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import interpolateComponents from '@automattic/interpolate-components';
import { H } from '@poocommerce/components';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import { SetupStepProps } from './setup';

export const AutomatedTaxes: React.FC<
	Pick<
		SetupStepProps,
		'isPending' | 'onAutomate' | 'onManual' | 'onDisable'
	>
> = ( { isPending, onAutomate, onManual, onDisable } ) => {
	return (
		<div className="poocommerce-task-tax__success">
			<span
				className="poocommerce-task-tax__success-icon"
				role="img"
				aria-labelledby="poocommerce-task-tax__success-message"
			>
				🎊
			</span>
			<H id="poocommerce-task-tax__success-message">
				{ __( 'Good news!', 'poocommerce' ) }
			</H>
			<p>
				{ interpolateComponents( {
					mixedString: __(
						'{{strong}}PooCommerce Tax{{/strong}} can automate your sales tax calculations for you.',
						'poocommerce'
					),
					components: {
						strong: <strong />,
					},
				} ) }
			</p>
			<Button
				isPrimary
				isBusy={ isPending }
				onClick={ () => {
					recordEvent( 'tasklist_tax_setup_automated_proceed', {
						setup_automatically: true,
					} );
					onAutomate();
				} }
			>
				{ __( 'Yes please', 'poocommerce' ) }
			</Button>
			<Button
				disabled={ isPending }
				isTertiary
				onClick={ () => {
					recordEvent( 'tasklist_tax_setup_automated_proceed', {
						setup_automatically: false,
					} );
					onManual();
				} }
			>
				{ __( "No thanks, I'll set up manually", 'poocommerce' ) }
			</Button>
			<Button disabled={ isPending } isTertiary onClick={ onDisable }>
				{ __( "I don't charge sales tax", 'poocommerce' ) }
			</Button>
		</div>
	);
};
