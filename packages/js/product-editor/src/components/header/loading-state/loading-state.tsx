/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';

export function LoadingState() {
	return (
		<div
			className="poocommerce-product-header is-loading"
			aria-hidden="true"
		>
			<div className="poocommerce-product-header__inner">
				<div />

				<div className="poocommerce-product-header__title" />

				<div className="poocommerce-product-header__actions">
					<div className="poocommerce-product-header__action" />
					<div className="poocommerce-product-header__action" />
					<div className="poocommerce-product-header__action" />
					<div className="poocommerce-product-header__action" />
				</div>
			</div>

			<div className="poocommerce-product-tabs">
				{ Array( 7 )
					.fill( 0 )
					.map( ( _, index ) => (
						<div key={ index } className="components-button" />
					) ) }
			</div>
		</div>
	);
}
