/**
 * External dependencies
 */
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { Template } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

const TEMPLATE: Template[] = [
	[
		'core/group',
		{
			layout: {
				type: 'flex',
				orientation: 'vertical',
				justifyContent: 'center',
				flexWrap: 'wrap',
			},
		},
		[
			[
				'core/paragraph',
				{
					textAlign: 'center',
					fontSize: 'medium',
					content: `<strong>${ __(
						'No results found',
						'poocommerce'
					) }</strong>`,
				},
			],
			[
				'core/paragraph',
				{
					content: `${ __(
						'You can try',
						'poocommerce'
					) } <a href="#" class="wc-link-clear-any-filters">${ __(
						'clearing any filters',
						'poocommerce'
					) }</a> ${ __(
						'or head to our',
						'poocommerce'
					) } <a href="#" class="wc-link-stores-home">${ __(
						"store's home",
						'poocommerce'
					) }</a>`,
				},
			],
		],
	],
];

const Edit = () => {
	const blockProps = useBlockProps( {
		className: 'wc-block-product-collection-no-results',
	} );

	return (
		<div { ...blockProps }>
			<InnerBlocks template={ TEMPLATE } />
		</div>
	);
};

export default Edit;
