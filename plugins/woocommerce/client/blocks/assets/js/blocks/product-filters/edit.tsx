/**
 * External dependencies
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps, InnerBlockTemplate } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { Icon, close } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import { filterThreeLines } from '@poocommerce/icons';
import { getSetting } from '@poocommerce/settings';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import './editor.scss';
import { type BlockAttributes } from './types';
import { getColorsFromBlockSupports } from './utils/get-colors-from-block-supports';
import { presetToCssVariable } from './utils/preset-to-css-variable';

const TEMPLATE: InnerBlockTemplate[] = [
	[
		'core/heading',
		{
			level: 2,
			content: __( 'Filters', 'poocommerce' ),
			style: {
				margin: { top: '0', bottom: '0' },
				spacing: { margin: { top: '0', bottom: '0' } },
			},
		},
	],
	[ 'poocommerce/product-filter-active' ],
	[ 'poocommerce/product-filter-price' ],
	[ 'poocommerce/product-filter-rating' ],
	[ 'poocommerce/product-filter-attribute' ],
	[ 'poocommerce/product-filter-taxonomy' ],
	[ 'poocommerce/product-filter-status' ],
];

export const Edit = ( props: BlockEditProps< BlockAttributes > ) => {
	const { attributes } = props;
	const { isPreview } = attributes;
	const [ isOpen, setIsOpen ] = useState( false );

	const globalColors = getSetting< { background?: string; text?: string } >(
		'globalStylesColors',
		{}
	);
	const colors = getColorsFromBlockSupports( attributes );

	const blockGap = (
		attributes as unknown as Record<
			string,
			Record< string, Record< string, string > >
		>
	 )?.style?.spacing?.blockGap;

	const blockProps = useBlockProps( {
		className: clsx( 'wc-block-product-filters', {
			'is-overlay-opened': isOpen,
		} ),
		style: {
			'--wc-product-filters-background-color':
				colors.backgroundColor || globalColors.background || undefined,
			'--wc-product-filters-text-color':
				colors.textColor || globalColors.text || undefined,
			'--wc-product-filter-block-spacing': blockGap
				? presetToCssVariable( blockGap )
				: undefined,
		},
	} );

	return (
		<div { ...blockProps }>
			{ isPreview ? (
				<div className="wc-block-product-filters__overlay-content">
					<InnerBlocks templateLock={ false } template={ TEMPLATE } />
				</div>
			) : (
				<>
					<button
						className="wc-block-product-filters__open-overlay"
						onClick={ () => setIsOpen( ! isOpen ) }
					>
						<Icon icon={ filterThreeLines } />
						<span>{ __( 'Filter products', 'poocommerce' ) }</span>
					</button>

					<div className="wc-block-product-filters__overlay">
						<div className="wc-block-product-filters__overlay-wrapper">
							<div
								className="wc-block-product-filters__overlay-dialog"
								role="dialog"
							>
								<header className="wc-block-product-filters__overlay-header">
									<button
										className="wc-block-product-filters__close-overlay"
										onClick={ () => setIsOpen( ! isOpen ) }
									>
										<span>
											{ __( 'Close', 'poocommerce' ) }
										</span>
										<Icon icon={ close } />
									</button>
								</header>
								<div className="wc-block-product-filters__overlay-content">
									<InnerBlocks
										templateLock={ false }
										template={ TEMPLATE }
									/>
								</div>
								<footer className="wc-block-product-filters__overlay-footer">
									<button
										className="wc-block-product-filters__apply wp-block-button__link wp-element-button"
										onClick={ () => setIsOpen( ! isOpen ) }
									>
										<span>
											{ __( 'Apply', 'poocommerce' ) }
										</span>
									</button>
								</footer>
							</div>
						</div>
					</div>
				</>
			) }
		</div>
	);
};
