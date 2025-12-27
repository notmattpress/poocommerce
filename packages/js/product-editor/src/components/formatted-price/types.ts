/**
 * External dependencies
 */
import { Product } from '@poocommerce/data';

export type FormattedPriceProps = React.DetailedHTMLProps<
	React.HTMLAttributes< HTMLSpanElement >,
	HTMLSpanElement
> & {
	product: Product;
};
