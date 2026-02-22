/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';

export function TableRowSkeleton() {
	return (
		<div
			className="poocommerce-table-row-skeleton poocommerce-product-variations__table-row"
			aria-hidden="true"
		>
			<div className="poocommerce-sortable__handle" />

			<div className="poocommerce-product-variations__selection">
				<div className="poocommerce-table-row-skeleton__checkbox" />
			</div>

			<div className="poocommerce-product-variations__attributes">
				{ Array( 2 )
					.fill( 0 )
					.map( ( _, index ) => (
						<div
							key={ index }
							className="poocommerce-tag poocommerce-product-variations__attribute"
						>
							<div className="poocommerce-table-row-skeleton__attribute-option" />
						</div>
					) ) }
			</div>

			<div className="poocommerce-product-variations__price">
				<div className="poocommerce-table-row-skeleton__regular-price" />
			</div>

			<div className="poocommerce-product-variations__quantity">
				<div className="poocommerce-table-row-skeleton__quantity" />
			</div>

			<div className="poocommerce-product-variations__actions">
				<div className="poocommerce-table-row-skeleton__visibility-icon" />

				<div className="poocommerce-table-row-skeleton__edit-link" />

				<div className="poocommerce-table-row-skeleton__menu-toggle" />
			</div>
		</div>
	);
}
