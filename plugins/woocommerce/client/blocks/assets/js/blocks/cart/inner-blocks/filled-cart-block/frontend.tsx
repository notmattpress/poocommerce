/**
 * External dependencies
 */
import clsx from 'clsx';
import { SidebarLayout } from '@poocommerce/base-components/sidebar-layout';
import { useStoreCart } from '@poocommerce/base-context/hooks';

/**
 * Internal dependencies
 */
import { useCartBlockContext } from '../../context';

const FrontendBlock = ( {
	children,
	className,
}: {
	children: JSX.Element | JSX.Element[];
	className: string;
} ): JSX.Element | null => {
	const { cartItems, cartIsLoading } = useStoreCart();
	const { hasDarkControls } = useCartBlockContext();

	if ( cartIsLoading || cartItems.length >= 1 ) {
		return (
			<SidebarLayout
				className={ clsx( 'wc-block-cart', className, {
					'has-dark-controls': hasDarkControls,
				} ) }
			>
				{ children }
			</SidebarLayout>
		);
	}
	return null;
};

export default FrontendBlock;
