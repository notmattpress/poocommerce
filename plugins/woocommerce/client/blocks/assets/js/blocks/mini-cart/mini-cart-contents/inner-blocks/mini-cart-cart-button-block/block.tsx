/**
 * External dependencies
 */
import { CART_URL } from '@poocommerce/block-settings';
import Button from '@poocommerce/base-components/button';
import clsx from 'clsx';
import { useStyleProps } from '@poocommerce/base-hooks';

/**
 * Internal dependencies
 */
import { defaultCartButtonLabel } from './constants';
import { getVariant } from '../utils';

type MiniCartCartButtonBlockProps = {
	cartButtonLabel?: string;
	className?: string;
	style?: string;
};

const Block = ( {
	className,
	cartButtonLabel,
	style,
}: MiniCartCartButtonBlockProps ): JSX.Element | null => {
	const styleProps = useStyleProps( { style } );

	if ( ! CART_URL ) {
		return null;
	}

	return (
		<Button
			className={ clsx(
				className,
				styleProps.className,
				'wc-block-mini-cart__footer-cart'
			) }
			style={ styleProps.style }
			href={ CART_URL }
			variant={ getVariant( className, 'outlined' ) }
		>
			{ cartButtonLabel || defaultCartButtonLabel }
		</Button>
	);
};

export default Block;
