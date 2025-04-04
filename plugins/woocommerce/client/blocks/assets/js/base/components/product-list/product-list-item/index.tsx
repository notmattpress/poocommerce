/**
 * External dependencies
 */
import clsx from 'clsx';
import { useInnerBlockLayoutContext } from '@poocommerce/shared-context';
import { withInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { renderProductLayout } from './utils';
import { ProductListItemProps } from '../types';

const ProductListItem = ( {
	product = {},
	attributes,
	instanceId,
}: ProductListItemProps ): JSX.Element => {
	const { layoutConfig } = attributes;
	const { parentClassName, parentName } = useInnerBlockLayoutContext();
	const isLoading = Object.keys( product ).length === 0;
	const classes = clsx( `${ parentClassName }__product`, 'wc-block-layout', {
		'is-loading': isLoading,
	} );

	return (
		<li className={ classes } aria-hidden={ isLoading }>
			{ renderProductLayout(
				parentName,
				product,
				layoutConfig,
				instanceId
			) }
		</li>
	);
};

export default withInstanceId( ProductListItem );
