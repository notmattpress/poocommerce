/**
 * External dependencies
 */
import {
	useCollection,
	useCollectionData,
} from '@poocommerce/base-context/hooks';
import {
	AttributeSetting,
	AttributeTerm,
	objectHasProp,
} from '@poocommerce/types';
import {
	useBlockProps,
	useInnerBlocksProps,
	BlockContextProvider,
} from '@wordpress/block-editor';
import { withSpokenMessages } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getSetting } from '@poocommerce/settings';

/**
 * Internal dependencies
 */
import { Inspector } from './inspector';
import { attributeOptionsPreview } from './constants';
import './style.scss';
import { EditProps, isAttributeCounts } from './types';
import { getAttributeFromId } from './utils';
import { getAllowedBlocks } from '../../utils/get-allowed-blocks';
import { EXCLUDED_BLOCKS } from '../../constants';
import { FilterOptionItem } from '../../types';
import { InitialDisabled } from '../../components/initial-disabled';
import { Notice } from '../../components/notice';
import { sortFilterOptions } from '../../utils/sort-filter-options';

const ATTRIBUTES = getSetting< AttributeSetting[] >( 'attributes', [] );

const Edit = ( props: EditProps ) => {
	const { attributes: blockAttributes } = props;

	const {
		attributeId,
		queryType,
		isPreview,
		displayStyle,
		showCounts,
		sortOrder,
		hideEmpty,
	} = blockAttributes;

	const attributeObject = getAttributeFromId( attributeId );

	const [ attributeOptions, setAttributeOptions ] = useState<
		FilterOptionItem[]
	>( [] );
	const [ isOptionsLoading, setIsOptionsLoading ] =
		useState< boolean >( true );

	const { results: attributeTerms, isLoading: isTermsLoading } =
		useCollection< AttributeTerm >( {
			namespace: '/wc/store/v1',
			resourceName: 'products/attributes/terms',
			resourceValues: [ attributeObject?.id || 0 ],
			shouldSelect: !! attributeObject?.id,
			query: { orderby: 'menu_order', hide_empty: hideEmpty },
		} );

	const { data: filteredCounts, isLoading: isFilterCountsLoading } =
		useCollectionData( {
			queryAttribute: {
				taxonomy: attributeObject?.taxonomy || '',
				queryType,
			},
			queryState: {},
			isEditor: true,
		} );

	useEffect( () => {
		if ( isTermsLoading || isFilterCountsLoading ) return;

		const termIdHasProducts =
			objectHasProp( filteredCounts, 'attribute_counts' ) &&
			isAttributeCounts( filteredCounts.attribute_counts )
				? filteredCounts.attribute_counts.map( ( term ) => term.term )
				: [];

		if ( termIdHasProducts.length === 0 && hideEmpty ) {
			setAttributeOptions( [] );
		} else {
			const filteredOptions = attributeTerms
				.filter( ( term ) => {
					if ( hideEmpty )
						return termIdHasProducts.includes( term.id );
					return true;
				} )
				.map( ( term, index ) => ( {
					label: term.name,
					value: term.id.toString(),
					selected: index === 0,
					count: term.count,
				} ) );

			setAttributeOptions(
				sortFilterOptions( filteredOptions, sortOrder )
			);
		}

		setIsOptionsLoading( false );
	}, [
		showCounts,
		attributeTerms,
		filteredCounts,
		sortOrder,
		hideEmpty,
		isTermsLoading,
		isFilterCountsLoading,
		attributeObject,
	] );

	const { children, ...innerBlocksProps } = useInnerBlocksProps(
		useBlockProps(),
		{
			allowedBlocks: getAllowedBlocks( EXCLUDED_BLOCKS ),
			template: [
				[
					'core/heading',
					{
						level: 3,
						content:
							attributeObject?.label ||
							__( 'Attribute', 'poocommerce' ),
						style: {
							spacing: {
								margin: {
									bottom: '0.625rem',
									top: '0',
								},
							},
						},
					},
				],
				[ displayStyle ],
			],
		}
	);

	const isLoading =
		isTermsLoading || isFilterCountsLoading || isOptionsLoading;

	if ( Object.keys( ATTRIBUTES ).length === 0 )
		return (
			<div { ...innerBlocksProps }>
				<Inspector { ...props } />
				<Notice>
					<p>
						{ __(
							"Attributes are needed for filtering your products. You haven't created any attributes yet.",
							'poocommerce'
						) }
					</p>
				</Notice>
			</div>
		);

	if ( ! attributeId || ! attributeObject )
		return (
			<div { ...innerBlocksProps }>
				<Inspector { ...props } />
				<Notice>
					<p>
						{ __(
							'Please select an attribute to use this filter!',
							'poocommerce'
						) }
					</p>
				</Notice>
			</div>
		);

	if ( ! isLoading && attributeTerms.length === 0 )
		return (
			<div { ...innerBlocksProps }>
				<Inspector { ...props } />
				<Notice>
					<p>
						{ __(
							'There are no products with the selected attributes.',
							'poocommerce'
						) }
					</p>
				</Notice>
			</div>
		);

	return (
		<div { ...innerBlocksProps }>
			<Inspector { ...props } />
			<InitialDisabled>
				<BlockContextProvider
					value={ {
						filterData: {
							items:
								attributeOptions.length === 0 && isPreview
									? attributeOptionsPreview
									: attributeOptions,
							isLoading,
							showCounts,
						},
					} }
				>
					{ children }
				</BlockContextProvider>
			</InitialDisabled>
		</div>
	);
};

export default withSpokenMessages( Edit );
