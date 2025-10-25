/**
 * Internal dependencies
 */
import ProductListContent from '../product-list-content/product-list-content';
import ProductListHeader from '../product-list-header/product-list-header';
import { Product, ProductCardType, ProductType } from './types';

interface ProductListProps {
	title: string;
	description: string;
	productGroup?: string;
	products: Product[];
	groupURL: string;
	type: ProductType;
	cardType?: ProductCardType;
	groupURLText: string | null;
	groupURLType: 'wc-admin' | 'wp-admin' | 'external' | undefined; // types defined by Link component
}

export default function ProductList( props: ProductListProps ): JSX.Element {
	const {
		title,
		description,
		products,
		groupURL,
		type,
		productGroup,
		groupURLText,
		groupURLType,
		cardType,
	} = props;

	return (
		<div className="poocommerce-marketplace__product-list">
			<ProductListHeader
				title={ title }
				groupURL={ groupURL }
				groupURLText={ groupURLText }
				description={ description }
				groupURLType={ groupURLType }
			/>
			<ProductListContent
				group={ title }
				products={ products }
				type={ type }
				cardType={ cardType }
				productGroup={ productGroup }
			/>
		</div>
	);
}
