/**
 * External dependencies
 */
import { PartialProduct, ProductDimensions } from '@poocommerce/data';
import { isEmpty } from '@poocommerce/types';
import { __ } from '@wordpress/i18n';

export const isAdditionalProductDataEmpty = (
	product: PartialProduct
): boolean => {
	const isDimensionsEmpty = ( value: ProductDimensions | undefined ) => {
		return (
			! value ||
			Object.values( value ).every(
				( val ) => ! val || val.trim() === ''
			)
		);
	};

	return (
		isEmpty( product.weight ) &&
		isDimensionsEmpty( product.dimensions ) &&
		isEmpty( product.attributes )
	);
};

export const getTemplate = (
	product: PartialProduct | null,
	{
		isInnerBlockOfSingleProductBlock,
	}: { isInnerBlockOfSingleProductBlock: boolean }
) => {
	const additionalProductDataEmpty =
		product !== null &&
		product !== undefined &&
		isAdditionalProductDataEmpty( product ) &&
		isInnerBlockOfSingleProductBlock;

	return [
		[
			'poocommerce/accordion-group',
			{
				metadata: {
					isDescendantOfProductDetails: true,
				},
			},
			[
				[
					'poocommerce/accordion-item',
					{
						openByDefault: true,
					},
					[
						[
							'poocommerce/accordion-header',
							{ title: __( 'Description', 'poocommerce' ) },
							[],
						],
						[
							'poocommerce/accordion-panel',
							{},
							[ [ 'poocommerce/product-description', {}, [] ] ],
						],
					],
				],
				...( ! additionalProductDataEmpty
					? [
							[
								'poocommerce/accordion-item',
								{},
								[
									[
										'poocommerce/accordion-header',
										{
											title: __(
												'Additional Information',
												'poocommerce'
											),
										},
										[],
									],
									[
										'poocommerce/accordion-panel',
										{},
										[
											[
												'poocommerce/product-specifications',
												{},
											],
										],
									],
								],
							],
					  ]
					: [] ),
				[
					'poocommerce/accordion-item',
					{},
					[
						[
							'poocommerce/accordion-header',
							{ title: __( 'Reviews', 'poocommerce' ) },
							[],
						],
						[
							'poocommerce/accordion-panel',
							{},
							[ [ 'poocommerce/product-reviews', {} ] ],
						],
					],
				],
			],
		],
	];
};
