/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';

type EmptyStateProps = React.DetailedHTMLProps<
	React.HTMLAttributes< HTMLDivElement >,
	HTMLDivElement
> & {
	names: string[];
};

export function EmptyState( { names = [], ...props }: EmptyStateProps ) {
	return (
		<div
			{ ...props }
			role="none"
			className="poocommerce-product-empty-state"
		>
			{ names.map( ( name ) => (
				<div
					key={ name }
					className="poocommerce-product-empty-state__row"
				>
					{ name === '' ? (
						<div className="poocommerce-product-empty-state__name" />
					) : (
						<div>{ name }</div>
					) }
					<div>
						<div className="poocommerce-product-empty-state__value" />
					</div>
					<div>
						<div className="poocommerce-product-empty-state__actions" />
					</div>
				</div>
			) ) }
		</div>
	);
}
