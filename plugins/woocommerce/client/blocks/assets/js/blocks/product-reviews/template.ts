/**
 * External dependencies
 */
import { InnerBlockTemplate } from '@wordpress/blocks';

const TEMPLATE: InnerBlockTemplate[] = [
	[ 'poocommerce/product-reviews-title' ],
	[
		'poocommerce/product-review-template',
		{},
		[
			[
				'core/columns',
				{},
				[
					[
						'core/column',
						{ width: '40px' },
						[
							[
								'core/avatar',
								{
									size: 40,
									style: {
										border: { radius: '20px' },
									},
								},
							],
						],
					],
					[
						'core/column',
						{},
						[
							[
								'core/group',
								{
									tagName: 'div',
									layout: {
										type: 'flex',
										flexWrap: 'nowrap',
										justifyContent: 'space-between',
									},
								},
								[
									[
										'poocommerce/product-review-author-name',
										{
											fontSize: 'small',
										},
									],
									[ 'poocommerce/product-review-rating' ],
								],
							],
							[
								'core/group',
								{
									layout: { type: 'flex' },
									style: {
										spacing: {
											margin: {
												top: '0px',
												bottom: '0px',
											},
										},
									},
								},
								[
									[
										'poocommerce/product-review-date',
										{
											fontSize: 'small',
										},
									],
								],
							],
							[ 'poocommerce/product-review-content' ],
						],
					],
				],
			],
		],
	],
	[ 'poocommerce/product-reviews-pagination' ],
	[ 'poocommerce/product-review-form' ],
];

export default TEMPLATE;
