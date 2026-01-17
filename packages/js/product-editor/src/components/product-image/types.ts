/**
 * External dependencies
 */
import { Product } from '@poocommerce/data';

export type ProductImageProps = React.DetailedHTMLProps<
	React.HTMLAttributes< HTMLDivElement >,
	HTMLDivElement
> & { product: Product };
