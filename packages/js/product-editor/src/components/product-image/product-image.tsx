/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import { Product } from '@poocommerce/data';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import { ProductImageProps } from './types';

export function getProductImageStyle( product: Product ) {
	return product.images.length > 0
		? {
				backgroundImage: `url(${ product.images[ 0 ].src })`,
		  }
		: undefined;
}

export function ProductImage( {
	product,
	className,
	style,
	...props
}: ProductImageProps ) {
	return (
		<div
			aria-hidden="true"
			{ ...props }
			className={ clsx( 'poocommerce-product-image', className ) }
			style={ { ...style, ...getProductImageStyle( product ) } }
		/>
	);
}
