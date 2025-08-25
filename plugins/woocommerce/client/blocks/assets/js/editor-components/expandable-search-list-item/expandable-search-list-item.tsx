/**
 * External dependencies
 */
import { Spinner } from '@wordpress/components';
import { SearchListItem } from '@poocommerce/editor-components/search-list-control';
import { RenderItemArgs } from '@poocommerce/editor-components/search-list-control/types';
import clsx from 'clsx';

interface ExpandableSearchListItemProps extends RenderItemArgs {
	isLoading: boolean;
}

const ExpandableSearchListItem = ( {
	className,
	item,
	isSelected,
	isLoading,
	onSelect,
	disabled,
	...rest
}: ExpandableSearchListItemProps ): JSX.Element => {
	return (
		<>
			<SearchListItem
				{ ...rest }
				key={ item.id }
				className={ className }
				isSelected={ isSelected }
				item={ item }
				onSelect={ onSelect }
				disabled={ disabled }
			/>
			{ isSelected && isLoading && (
				<div
					key="loading"
					className={ clsx(
						'poocommerce-search-list__item',
						'poocommerce-product-attributes__item',
						'depth-1',
						'is-loading',
						'is-not-active'
					) }
				>
					<Spinner />
				</div>
			) }
		</>
	);
};

export default ExpandableSearchListItem;
