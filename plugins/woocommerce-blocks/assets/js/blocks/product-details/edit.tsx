/**
 * External dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';
import { InnerBlockTemplate } from '@wordpress/blocks';

const createAccordionItem = (
	title: string,
	content: InnerBlockTemplate[]
): InnerBlockTemplate => {
	return [
		'poocommerce/accordion-item',
		{},
		[
			[ 'poocommerce/accordion-header', { title }, [] ],
			[ 'poocommerce/accordion-panel', {}, content ],
		],
	];
};

const descriptionAccordion = createAccordionItem( 'Description', [
	[
		'core/paragraph',
		{
			content:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget turpis eget nunc fermentum ultricies. Nullam nec sapien nec0',
		},
	],
] );

const additionalInformationAccordion = createAccordionItem(
	'Additional Information',
	[
		[
			'core/paragraph',
			{
				content:
					'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget turpis eget nunc fermentum ultricies. Nullam nec sapien nec0',
			},
		],
	]
);

const reviewsAccordion = createAccordionItem( 'Reviews', [
	[
		'core/paragraph',
		{
			content:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget turpis eget nunc fermentum ultricies. Nullam nec sapien nec0',
		},
	],
] );

const TEMPLATE: InnerBlockTemplate[] = [
	[
		'poocommerce/accordion-group',
		{},
		[
			descriptionAccordion,
			additionalInformationAccordion,
			reviewsAccordion,
		],
	],
];

const Edit = () => {
	return <InnerBlocks template={ TEMPLATE } />;
};

export default Edit;
