/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { Label } from '@poocommerce/blocks-components';
import {
	useInnerBlockLayoutContext,
	useProductDataContext,
} from '@poocommerce/shared-context';
import { useStyleProps } from '@poocommerce/base-hooks';
import { withProductDataContext } from '@poocommerce/shared-hocs';
import type { HTMLAttributes } from 'react';

/**
 * Internal dependencies
 */
import './style.scss';
import type { BlockAttributes } from './types';

type Props = BlockAttributes &
	HTMLAttributes< HTMLDivElement > & { align: boolean };

export const Block = ( props: Props ): JSX.Element | null => {
	const { className, align } = props;
	const styleProps = useStyleProps( props );
	const { parentClassName } = useInnerBlockLayoutContext();
	const { product } = useProductDataContext();

	if (
		( ! product.id || ! product.on_sale ) &&
		! props.isDescendentOfSingleProductTemplate
	) {
		return null;
	}

	const alignClass =
		typeof align === 'string'
			? `wc-block-components-product-sale-badge--align-${ align }`
			: '';

	return (
		<div
			className={ clsx(
				'wc-block-components-product-sale-badge',
				className,
				alignClass,
				{
					[ `${ parentClassName }__product-onsale` ]: parentClassName,
				},
				styleProps.className
			) }
			style={ styleProps.style }
		>
			<Label
				label={ __( 'Sale', 'poocommerce' ) }
				screenReaderLabel={ __( 'Product on sale', 'poocommerce' ) }
			/>
		</div>
	);
};

export default withProductDataContext( Block );
