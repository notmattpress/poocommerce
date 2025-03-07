/**
 * External dependencies
 */
import { ProductImage } from '@poocommerce/components';
import { createElement } from '@wordpress/element';

export const Basic = () => (
	<div>
		<ProductImage product={ null } />
		<ProductImage product={ { images: [] } } />
		<ProductImage
			product={ {
				images: [
					{
						src: 'https://cldup.com/6L9h56D9Bw.jpg',
					},
				],
			} }
		/>
	</div>
);

export default {
	title: 'Components/ProductImage',
	component: ProductImage,
};
