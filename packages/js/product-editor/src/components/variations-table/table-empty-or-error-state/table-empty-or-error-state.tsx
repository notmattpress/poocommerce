/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { createElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { TableEmptyOrErrorStateProps } from './types';
import { ErrorVariationsImage } from '../../../images/error-variations-image';
import { EmptyVariationsImage } from '../../../images/empty-variations-image';

export function EmptyOrErrorTableState( {
	message,
	actionText,
	isError,
	onActionClick,
}: TableEmptyOrErrorStateProps ) {
	return (
		<div className="poocommerce-variations-table-error-or-empty-state">
			{ isError ? <ErrorVariationsImage /> : <EmptyVariationsImage /> }
			<p className="poocommerce-variations-table-error-or-empty-state__message">
				{ isError
					? __( 'We couldn’t load the variations', 'poocommerce' )
					: message ?? __( 'No variations yet', 'poocommerce' ) }
			</p>

			<div className="poocommerce-variations-table-error-or-empty-state__actions">
				<Button variant="link" onClick={ onActionClick }>
					{ isError
						? __( 'Try again', 'poocommerce' )
						: actionText ??
						  __( 'Generate from options', 'poocommerce' ) }
				</Button>
			</div>
		</div>
	);
}
