/**
 * External dependencies
 */
import clsx from 'clsx';
import { __, _n, sprintf } from '@wordpress/i18n';
import {
	useStoreEvents,
	useStoreAddToCart,
} from '@poocommerce/base-context/hooks';
import { useStyleProps } from '@poocommerce/base-hooks';
import { decodeEntities } from '@wordpress/html-entities';
import { CART_URL } from '@poocommerce/block-settings';
import { getSetting } from '@poocommerce/settings';
import {
	useInnerBlockLayoutContext,
	useProductDataContext,
} from '@poocommerce/shared-context';
import { withProductDataContext } from '@poocommerce/shared-hocs';

/**
 * Internal dependencies
 */
import './style.scss';
import type {
	BlockAttributes,
	AddToCartButtonAttributes,
	AddToCartButtonPlaceholderAttributes,
} from './types';

const AddToCartButton = ( {
	product,
	className,
	style,
}: AddToCartButtonAttributes ): JSX.Element => {
	const {
		id,
		permalink,
		add_to_cart: productCartDetails,
		has_options: hasOptions,
		is_purchasable: isPurchasable,
		is_in_stock: isInStock,
	} = product;
	const { dispatchStoreEvent } = useStoreEvents();
	const { cartQuantity, addingToCart, addToCart } = useStoreAddToCart( id );

	const addedToCart = Number.isFinite( cartQuantity ) && cartQuantity > 0;
	const allowAddToCart = ! hasOptions && isPurchasable && isInStock;
	const buttonAriaLabel = decodeEntities(
		productCartDetails?.description || ''
	);
	const buttonText = addedToCart
		? sprintf(
				/* translators: %s number of products in cart. */
				_n( '%d in cart', '%d in cart', cartQuantity, 'poocommerce' ),
				cartQuantity
		  )
		: decodeEntities(
				productCartDetails?.text || __( 'Add to cart', 'poocommerce' )
		  );

	const ButtonTag = allowAddToCart ? 'button' : 'a';
	const buttonProps = {} as HTMLAnchorElement & { onClick: () => void };

	if ( ! allowAddToCart ) {
		buttonProps.href = permalink;
		buttonProps.rel = 'nofollow';
		buttonProps.onClick = () => {
			dispatchStoreEvent( 'product-view-link', {
				product,
			} );
		};
	} else {
		buttonProps.onClick = async () => {
			await addToCart();
			dispatchStoreEvent( 'cart-add-item', {
				product,
			} );
			// redirect to cart if the setting to redirect to the cart page
			// on cart add item is enabled
			const { cartRedirectAfterAdd }: { cartRedirectAfterAdd: boolean } =
				getSetting( 'productsSettings' );
			if ( cartRedirectAfterAdd ) {
				window.location.href = CART_URL;
			}
		};
	}

	return (
		<ButtonTag
			{ ...buttonProps }
			aria-label={ buttonAriaLabel }
			disabled={ addingToCart }
			className={ clsx(
				className,
				'wp-block-button__link',
				'wp-element-button',
				'add_to_cart_button',
				'wc-block-components-product-button__button',
				{
					loading: addingToCart,
					added: addedToCart,
				}
			) }
			style={ style }
		>
			{ buttonText }
		</ButtonTag>
	);
};

const AddToCartButtonPlaceholder = ( {
	className,
	style,
	isLoading,
}: AddToCartButtonPlaceholderAttributes ): JSX.Element => {
	return (
		<button
			className={ clsx(
				'wp-block-button__link',
				'wp-element-button',
				'add_to_cart_button',
				'wc-block-components-product-button__button',
				{
					'wc-block-components-product-button__button--placeholder':
						isLoading,
				},
				className
			) }
			style={ style }
			disabled={ true }
		>
			{ __( 'Add to cart', 'poocommerce' ) }
		</button>
	);
};

export const Block = ( props: BlockAttributes ): JSX.Element => {
	const { className, textAlign } = props;
	const styleProps = useStyleProps( props );
	const { parentClassName } = useInnerBlockLayoutContext();
	const { isLoading, product } = useProductDataContext();

	return (
		<div
			className={ clsx(
				className,
				'wp-block-button',
				'wc-block-components-product-button',
				{
					[ `${ parentClassName }__product-add-to-cart` ]:
						parentClassName,
					[ `align-${ textAlign }` ]: textAlign,
				}
			) }
		>
			{ product.id ? (
				<AddToCartButton
					product={ product }
					style={ styleProps.style }
					className={ styleProps.className }
				/>
			) : (
				<AddToCartButtonPlaceholder
					style={ styleProps.style }
					className={ styleProps.className }
					isLoading={ isLoading }
				/>
			) }
		</div>
	);
};

export default withProductDataContext( Block );
