/**
 * External dependencies
 */
import clsx from 'clsx';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useEntityProp } from '@wordpress/core-data';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { resolveSelect } from '@wordpress/data';
import { reviewsStore } from '@poocommerce/data';
import {
	// @ts-expect-error AlignmentControl is not exported from @wordpress/block-editor
	AlignmentControl,
	BlockControls,
	useBlockProps,
	InspectorControls,
	// @ts-expect-error HeadingLevelDropdown is not exported from @wordpress/block-editor
	HeadingLevelDropdown,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import type { ProductReviewsTitleEditProps } from './types';

function getProductReviewsTitle(
	showReviewsCount: boolean,
	reviewsCount: number,
	showProductTitle: boolean,
	productTitle: string
) {
	if ( showReviewsCount && showProductTitle ) {
		return reviewsCount === 1
			? sprintf(
					/* translators: %s: Product title. */
					__( 'One review for %s', 'poocommerce' ),
					productTitle
			  )
			: sprintf(
					/* translators: 1: Number of comments, 2: Product title. */
					_n(
						'%1$s review for %2$s',
						'%1$s reviews for %2$s',
						reviewsCount,
						'poocommerce'
					),
					reviewsCount,
					productTitle
			  );
	}

	if ( ! showReviewsCount && showProductTitle ) {
		return reviewsCount === 1
			? sprintf(
					/* translators: %s: Product title. */
					__( 'Review for %s', 'poocommerce' ),
					productTitle
			  )
			: sprintf(
					/* translators: %s: Product title. */
					__( 'Reviews for %s', 'poocommerce' ),
					productTitle
			  );
	}

	if ( showReviewsCount && ! showProductTitle ) {
		return reviewsCount === 1
			? __( 'One review', 'poocommerce' )
			: sprintf(
					/* translators: %s: Number of reviews. */
					_n(
						'%s review',
						'%s reviews',
						reviewsCount,
						'poocommerce'
					),
					reviewsCount
			  );
	}

	if ( reviewsCount === 1 ) {
		return __( 'Review', 'poocommerce' );
	}
	return __( 'Reviews', 'poocommerce' );
}

export default function Edit( {
	attributes: {
		textAlign,
		showProductTitle,
		showReviewsCount,
		level,
		levelOptions,
	},
	setAttributes,
	context: { postType, postId },
}: ProductReviewsTitleEditProps ) {
	const TagName = 'h' + level;
	const [ reviewsCount, setReviewsCount ] = useState< number >( 3 );
	const [ rawTitle ] = useEntityProp( 'postType', postType, 'title', postId );
	const isSiteEditor = typeof postId === 'undefined';
	const blockProps = useBlockProps( {
		className: clsx( {
			[ `has-text-align-${ textAlign }` ]: textAlign,
		} ),
	} );

	useEffect( () => {
		if ( isSiteEditor ) {
			setReviewsCount( 3 );
			return;
		}
		resolveSelect( reviewsStore )
			.getReviewsTotalCount( {
				product: [ Number( postId ) ],
			} )
			.then( ( totalCount: number ) => {
				setReviewsCount( totalCount );
			} )
			.catch( () => {
				setReviewsCount( 0 );
			} );
	}, [ postId, isSiteEditor ] );

	const blockControls = (
		// @ts-expect-error BlockControls is not typed.
		<BlockControls group="block">
			<AlignmentControl
				value={ textAlign }
				onChange={ ( newAlign: string ) =>
					setAttributes( { textAlign: newAlign } )
				}
			/>
			<HeadingLevelDropdown
				value={ level }
				options={ levelOptions }
				onChange={ ( newLevel: number ) =>
					setAttributes( { level: newLevel } )
				}
			/>
		</BlockControls>
	);

	const inspectorControls = (
		<InspectorControls>
			<PanelBody title={ __( 'Settings', 'poocommerce' ) }>
				<ToggleControl
					// @ts-expect-error ToggleControl is not typed.
					__nextHasNoMarginBottom
					label={ __( 'Show Product Title', 'poocommerce' ) }
					checked={ showProductTitle }
					onChange={ ( value ) =>
						setAttributes( { showProductTitle: value } )
					}
				/>
				<ToggleControl
					// @ts-expect-error ToggleControl is not typed.
					__nextHasNoMarginBottom
					label={ __( 'Show Reviews Count', 'poocommerce' ) }
					checked={ showReviewsCount }
					onChange={ ( value ) =>
						setAttributes( { showReviewsCount: value } )
					}
				/>
			</PanelBody>
		</InspectorControls>
	);

	const productTitle = isSiteEditor
		? __( 'Product Title', 'poocommerce' )
		: rawTitle;

	const placeholder = getProductReviewsTitle(
		showReviewsCount,
		reviewsCount,
		showProductTitle,
		productTitle
	);

	return (
		<>
			{ blockControls }
			{ inspectorControls }
			<TagName { ...blockProps }>{ placeholder }</TagName>
		</>
	);
}
