/**
 * External dependencies
 */
import {
	BlockContextProvider,
	useBlockProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { useCollectionData } from '@poocommerce/base-context/hooks';
import { __ } from '@wordpress/i18n';
import { TemplateArray } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { getAllowedBlocks } from '../../utils/get-allowed-blocks';
import { getPriceFilterData } from './utils';
import { InitialDisabled } from '../../components/initial-disabled';

const Edit = () => {
	const blockProps = useBlockProps();

	const { data, isLoading } = useCollectionData( {
		queryPrices: true,
		queryState: {},
		isEditor: true,
	} );

	return (
		<div { ...blockProps }>
			<InitialDisabled>
				<BlockContextProvider
					value={ {
						filterData: {
							price: getPriceFilterData( data ),
							isLoading,
						},
					} }
				>
					<InnerBlocks
						allowedBlocks={ getAllowedBlocks() }
						template={ [
							[
								'core/group',
								{
									layout: {
										type: 'flex',
										flexWrap: 'nowrap',
									},
									metadata: {
										name: __( 'Header', 'poocommerce' ),
									},
									style: {
										spacing: {
											blockGap: '0',
										},
									},
								},
								[
									[
										'core/heading',
										{
											level: 4,
											content: __(
												'Price',
												'poocommerce'
											),
										},
									],
								].filter( Boolean ) as unknown as TemplateArray,
							],
							[ 'poocommerce/product-filter-price-slider', {} ],
						] }
					/>
				</BlockContextProvider>
			</InitialDisabled>
		</div>
	);
};

export default Edit;
