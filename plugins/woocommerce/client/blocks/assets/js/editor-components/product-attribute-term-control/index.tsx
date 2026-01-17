/**
 * External dependencies
 */
import clsx from 'clsx';
import { __, _n, sprintf } from '@wordpress/i18n';
import {
	SearchListControl,
	SearchListItem,
} from '@poocommerce/editor-components/search-list-control';
import { SelectControl } from '@wordpress/components';
import { withInstanceId } from '@wordpress/compose';
import useProductAttributes from '@poocommerce/base-context/hooks/use-product-attributes';
import ErrorMessage from '@poocommerce/editor-components/error-placeholder/error-message';
import ExpandableSearchListItem from '@poocommerce/editor-components/expandable-search-list-item/expandable-search-list-item';
import {
	RenderItemArgs,
	SearchListControlProps,
	SearchListItem as SearchListItemProps,
} from '@poocommerce/editor-components/search-list-control/types';
import { convertAttributeObjectToSearchItem } from '@poocommerce/utils';

/**
 * Internal dependencies
 */
import './style.scss';

interface Props
	extends Omit< SearchListControlProps, 'isSingle' | 'list' | 'selected' > {
	instanceId?: string;
	/**
	 * Callback to update the category operator. If not passed in, setting is not used.
	 */
	onOperatorChange?: () => void;
	/**
	 * Setting for whether products should match all or any selected categories.
	 */
	operator: 'all' | 'any';
	/**
	 * The list of currently selected attribute ids.
	 */
	selected: { id: number }[];
}

const ProductAttributeTermControl = ( {
	onChange,
	onOperatorChange,
	instanceId,
	isCompact = false,
	messages = {},
	operator = 'any',
	selected,
	type = 'text',
}: Props ) => {
	const { errorLoadingAttributes, isLoadingAttributes, productsAttributes } =
		useProductAttributes( true );

	const renderItem = ( args: RenderItemArgs ) => {
		const { item, search, depth = 0 } = args;
		const count = item.count || 0;
		const classes = [
			'poocommerce-product-attributes__item',
			'poocommerce-search-list__item',
			{
				'is-searching': search.length > 0,
				'is-skip-level': depth === 0 && item.parent !== 0,
			},
		];

		if ( ! item.breadcrumbs.length ) {
			return (
				<ExpandableSearchListItem
					{ ...args }
					className={ clsx( classes ) }
					item={ item }
					isLoading={ isLoadingAttributes }
					disabled={ item.count === 0 }
					name={ `attributes-${ instanceId }` }
					countLabel={ sprintf(
						/* translators: %d is the count of terms. */
						_n( '%d term', '%d terms', count, 'poocommerce' ),
						count
					) }
					aria-label={ sprintf(
						/* translators: %1$s is the item name, %2$d is the count of terms for the item. */
						_n(
							'%1$s, has %2$d term',
							'%1$s, has %2$d terms',
							count,
							'poocommerce'
						),
						item.name,
						count
					) }
				/>
			);
		}

		const itemName = `${ item.breadcrumbs[ 0 ] }: ${ item.name }`;

		return (
			<SearchListItem
				{ ...args }
				name={ `terms-${ instanceId }` }
				className={ clsx( ...classes, 'has-count' ) }
				countLabel={ sprintf(
					/* translators: %d is the count of products. */
					_n( '%d product', '%d products', count, 'poocommerce' ),
					count
				) }
				aria-label={ sprintf(
					/* translators: %1$s is the attribute name, %2$d is the count of products for that attribute. */
					_n(
						'%1$s, has %2$d product',
						'%1$s, has %2$d products',
						count,
						'poocommerce'
					),
					itemName,
					count
				) }
			/>
		);
	};

	const list = productsAttributes.reduce( ( acc, curr ) => {
		const { terms, ...props } = curr;

		return [
			...acc,
			convertAttributeObjectToSearchItem( props ),
			...terms.map( convertAttributeObjectToSearchItem ),
		];
	}, [] as SearchListItemProps[] );

	messages = {
		clear: __( 'Clear all product attributes', 'poocommerce' ),
		noItems: __(
			"Your store doesn't have any product attributes.",
			'poocommerce'
		),
		search: __( 'Search for product attributes', 'poocommerce' ),
		selected: ( n: number ) =>
			sprintf(
				/* translators: %d is the count of attributes selected. */
				_n(
					'%d attribute selected',
					'%d attributes selected',
					n,
					'poocommerce'
				),
				n
			),
		updated: __(
			'Product attribute search results updated.',
			'poocommerce'
		),
		...messages,
	};

	if ( errorLoadingAttributes ) {
		return <ErrorMessage error={ errorLoadingAttributes } />;
	}

	return (
		<>
			<SearchListControl
				className="poocommerce-product-attributes"
				isCompact={ isCompact }
				isHierarchical
				isLoading={ isLoadingAttributes }
				isSingle={ false }
				list={ list }
				messages={ messages }
				onChange={ onChange }
				renderItem={ renderItem }
				selected={
					selected
						.map( ( { id } ) =>
							list.find( ( term ) => term.id === id )
						)
						.filter( Boolean ) as SearchListItemProps[]
				}
				type={ type }
			/>
			{ !! onOperatorChange && (
				<div hidden={ selected.length < 2 }>
					<SelectControl
						className="poocommerce-product-attributes__operator"
						label={ __(
							'Display products matching',
							'poocommerce'
						) }
						help={ __(
							'Pick at least two attributes to use this setting.',
							'poocommerce'
						) }
						value={ operator }
						onChange={ onOperatorChange }
						options={ [
							{
								label: __(
									'Any selected attributes',
									'poocommerce'
								),
								value: 'any',
							},
							{
								label: __(
									'All selected attributes',
									'poocommerce'
								),
								value: 'all',
							},
						] }
					/>
				</div>
			) }
		</>
	);
};

export default withInstanceId( ProductAttributeTermControl );
