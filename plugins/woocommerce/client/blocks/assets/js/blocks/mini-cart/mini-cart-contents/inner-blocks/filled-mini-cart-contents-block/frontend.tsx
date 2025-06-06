/**
 * External dependencies
 */
import { StoreNoticesContainer } from '@poocommerce/blocks-components';
import { useStoreCart } from '@poocommerce/base-context/hooks';

type FilledMiniCartContentsBlockProps = {
	children: JSX.Element;
	className: string;
};

const FilledMiniCartContentsBlock = ( {
	children,
	className,
}: FilledMiniCartContentsBlockProps ): JSX.Element | null => {
	const { cartItems } = useStoreCart();

	if ( cartItems.length === 0 ) {
		return null;
	}

	return (
		<div className={ className }>
			<StoreNoticesContainer context="wc/cart" />
			{ children }
		</div>
	);
};

export default FilledMiniCartContentsBlock;
