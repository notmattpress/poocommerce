/**
 * External dependencies
 */
import clsx from 'clsx';
import { createElement } from '@wordpress/element';
import { useWooBlockProps } from '@poocommerce/block-templates';
import {
	// @ts-expect-error no exported member.
	useInnerBlocksProps,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { SubsectionBlockAttributes } from './types';
import { ProductEditorBlockEditProps } from '../../../types';
import { SectionHeader } from '../../../components/section-header';

export function SubsectionBlockEdit( {
	attributes,
}: ProductEditorBlockEditProps< SubsectionBlockAttributes > ) {
	const { description, title, blockGap } = attributes;

	const blockProps = useWooBlockProps( attributes );
	const innerBlockProps = useInnerBlocksProps(
		{
			className: clsx(
				'wp-block-poocommerce-product-section-header__content',
				`wp-block-poocommerce-product-section-header__content--block-gap-${ blockGap }`
			),
		},
		{ templateLock: 'all' }
	);
	const SubsectionTagName = title ? 'fieldset' : 'div';

	return (
		<SubsectionTagName { ...blockProps }>
			{ title && (
				<SectionHeader
					description={ description }
					sectionTagName={ SubsectionTagName }
					title={ title }
				/>
			) }

			<div { ...innerBlockProps } />
		</SubsectionTagName>
	);
}
