/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { useCallback, useContext, useState } from '@wordpress/element';
import * as WooNumber from '@poocommerce/number';
import {
	Product,
	ProductsStoreActions,
	ProductStatus,
	productsStore,
	ReadOnlyProperties,
	productReadOnlyProperties,
	experimentalProductVariationsStore,
} from '@poocommerce/data';
import { recordEvent } from '@poocommerce/tracks';
import { CurrencyContext } from '@poocommerce/currency';

/**
 * Internal dependencies
 */
import { AUTO_DRAFT_NAME, getDerivedProductType } from '../index';
import {
	NUMBERS_AND_DECIMAL_SEPARATOR,
	ONLY_ONE_DECIMAL_SEPARATOR,
	TRACKS_SOURCE,
} from '../constants';
import { ProductVariationsOrder } from './use-variations-order';

// TODO: Having to add TS ignore comments here, should be able to address with TS config but running into issues.

function removeReadonlyProperties(
	product: Product
): Omit< Product, ReadOnlyProperties > {
	productReadOnlyProperties.forEach( ( key ) => delete product[ key ] );
	return product;
}

function getNoticePreviewActions( status: ProductStatus, permalink: string ) {
	return status === 'publish' && permalink
		? [
				{
					label: __( 'View in store', 'poocommerce' ),
					onClick: () => {
						recordEvent( 'product_preview_changes', {
							source: TRACKS_SOURCE,
						} );
						window.open( permalink, '_blank' );
					},
				},
		  ]
		: [];
}

export function useProductHelper() {
	const { createProduct, updateProduct, deleteProduct } = useDispatch(
		productsStore
	) as ProductsStoreActions;
	const {
		batchUpdateProductVariations,
		invalidateResolutionForStoreSelector,
	} = useDispatch( experimentalProductVariationsStore );

	const { createNotice } = useDispatch( 'core/notices' );
	const [ isDeleting, setIsDeleting ] = useState( false );
	const [ updating, setUpdating ] = useState( {
		draft: false,
		publish: false,
	} );
	const context = useContext( CurrencyContext );

	/**
	 * Create product with status.
	 *
	 * @param {Product} product    the product to be created.
	 * @param {string}  status     the product status.
	 * @param {boolean} skipNotice if the notice should be skipped (default: false).
	 * @return {Promise<Product>} Returns a promise with the created product.
	 */
	const createProductWithStatus = useCallback(
		async (
			product: Omit< Product, ReadOnlyProperties >,
			status: ProductStatus,
			skipNotice = false
		) => {
			setUpdating( {
				...updating,
				[ status ]: true,
			} );
			return createProduct( {
				...product,
				status,
				type: getDerivedProductType( product ),
			} ).then(
				( newProduct ) => {
					if ( ! skipNotice ) {
						const noticeContent =
							newProduct.status === 'publish'
								? __( 'Product published.', 'poocommerce' )
								: __(
										'Product successfully created.',
										'poocommerce'
								  );
						createNotice( 'success', `🎉‎ ${ noticeContent }`, {
							actions: getNoticePreviewActions(
								newProduct.status,
								newProduct.permalink
							),
						} );
					}
					setUpdating( {
						...updating,
						[ status ]: false,
					} );
					return newProduct;
				},
				( error ) => {
					if ( ! skipNotice ) {
						createNotice(
							'error',
							status === 'publish'
								? __(
										'Failed to publish product.',
										'poocommerce'
								  )
								: __(
										'Failed to create product.',
										'poocommerce'
								  )
						);
					}
					setUpdating( {
						...updating,
						[ status ]: false,
					} );
					return error;
				}
			);
		},
		[ updating ]
	);

	async function updateVariationsOrder(
		productId: number,
		variationsOrder?: { [ page: number ]: { [ id: number ]: number } }
	) {
		if ( ! variationsOrder ) return undefined;

		return batchUpdateProductVariations(
			{
				product_id: productId,
			},
			{
				update: Object.values( variationsOrder )
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					.flatMap( Object.entries )
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					.map( ( [ id, menu_order ]: [ number, number ] ) => ( {
						id,
						menu_order,
					} ) ),
			}
		);
	}

	/**
	 * Update product with status.
	 *
	 * @param {number}  productId  the product id to be updated.
	 * @param {Product} product    the product to be updated.
	 * @param {string}  status     the product status.
	 * @param {boolean} skipNotice if the notice should be skipped (default: false).
	 * @return {Promise<Product>} Returns a promise with the updated product.
	 */
	const updateProductWithStatus = useCallback(
		async (
			productId: number,
			product: Partial< Product >,
			status: ProductStatus,
			skipNotice = false
		): Promise< Product > => {
			setUpdating( {
				...updating,
				[ status ]: true,
			} );
			return updateProduct( productId, {
				...product,
				status,
				type: getDerivedProductType( product ),
			} )
				.then( async ( updatedProduct ) =>
					updateVariationsOrder(
						updatedProduct.id,
						( product as ProductVariationsOrder ).variationsOrder
					)
						.then( () =>
							invalidateResolutionForStoreSelector(
								'getProductVariations'
							)
						)
						.then( () => updatedProduct )
				)
				.then(
					( updatedProduct ) => {
						if ( ! skipNotice ) {
							const noticeContent =
								product.status === 'draft' &&
								updatedProduct.status === 'publish'
									? __( 'Product published.', 'poocommerce' )
									: __(
											'Product successfully updated.',
											'poocommerce'
									  );
							createNotice( 'success', `🎉‎ ${ noticeContent }`, {
								actions: getNoticePreviewActions(
									updatedProduct.status,
									updatedProduct.permalink
								),
							} );
						}
						setUpdating( {
							...updating,
							[ status ]: false,
						} );
						return updatedProduct;
					},
					( error ) => {
						if ( ! skipNotice ) {
							createNotice(
								'error',
								__( 'Failed to update product.', 'poocommerce' )
							);
						}
						setUpdating( {
							...updating,
							[ status ]: false,
						} );
						return error;
					}
				);
		},
		[ updating ]
	);

	/**
	 * Creates a copy of the given product with the given status.
	 *
	 * @param {Product} product the product to be copied.
	 * @param {string}  status  the product status.
	 * @return {Promise<Product>} promise with the newly created and copied product.
	 */
	const copyProductWithStatus = useCallback(
		async ( product: Product, status: ProductStatus = 'draft' ) => {
			return createProductWithStatus(
				removeReadonlyProperties( {
					...product,
					name: ( product.name || AUTO_DRAFT_NAME ) + ' - Copy',
				} ),
				status
			);
		},
		[]
	);

	/**
	 * Deletes a product by given id and redirects to the product list page.
	 *
	 * @param {number} id the product id to be deleted.
	 * @return {Promise<Product>} promise with the deleted product.
	 */
	const deleteProductAndRedirect = useCallback( async ( id: number ) => {
		setIsDeleting( true );
		return deleteProduct( id ).then(
			( product ) => {
				const noticeContent = __(
					'Successfully moved product to Trash.',
					'poocommerce'
				);
				createNotice( 'success', `🎉‎ ${ noticeContent }` );
				setIsDeleting( false );
				return product;
			},
			( error ) => {
				createNotice(
					'error',
					__( 'Failed to move product to Trash.', 'poocommerce' )
				);
				setIsDeleting( false );
				return error;
			}
		);
	}, [] );

	/**
	 * Sanitizes a price.
	 *
	 * @param {string} price the price that will be sanitized.
	 * @return {string} sanitized price.
	 */
	const sanitizePrice = useCallback(
		( price: string ) => {
			if ( ! price.length ) {
				return '';
			}

			const { getCurrencyConfig } = context;
			const { decimalSeparator } = getCurrencyConfig();
			// Build regex to strip out everything except digits, decimal point and minus sign.
			const regex = new RegExp(
				NUMBERS_AND_DECIMAL_SEPARATOR.replace( '%s', decimalSeparator ),
				'g'
			);
			const decimalRegex = new RegExp(
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				ONLY_ONE_DECIMAL_SEPARATOR.replaceAll( '%s', decimalSeparator ),
				'g'
			);
			const cleanValue = price
				.replace( regex, '' )
				.replace( decimalRegex, '' )
				.replace( decimalSeparator, '.' );
			return cleanValue;
		},
		[ context ]
	);

	/**
	 * Format a value using the Woo General Currency Settings.
	 *
	 * @param {string} value the value that will be formatted.
	 * @return {string} the formatted number.
	 */
	const formatNumber = useCallback(
		( value: string ): string => {
			const { getCurrencyConfig } = context;
			const { decimalSeparator, thousandSeparator } = getCurrencyConfig();

			return WooNumber.numberFormat(
				{ decimalSeparator, thousandSeparator },
				value
			);
		},
		[ context ]
	);

	/**
	 * Parse a value using the Woo General Currency Settings.
	 *
	 * @param {string} value the value that will be parsed.
	 * @return {string} the parsed number.
	 */
	const parseNumber = useCallback(
		( value: string ): string => {
			const { getCurrencyConfig } = context;
			const { decimalSeparator, thousandSeparator } = getCurrencyConfig();

			return WooNumber.parseNumber(
				{ decimalSeparator, thousandSeparator },
				value
			);
		},
		[ context ]
	);

	return {
		createProductWithStatus,
		updateProductWithStatus,
		copyProductWithStatus,
		deleteProductAndRedirect,
		sanitizePrice,
		formatNumber,
		parseNumber,
		isUpdatingDraft: updating.draft,
		isUpdatingPublished: updating.publish,
		isDeleting,
	};
}
