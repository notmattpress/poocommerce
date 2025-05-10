/**
 * External dependencies
 */
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Pill, TourKit } from '@poocommerce/components';
import { __experimentalUseFeedbackBar as useFeedbackBar } from '@poocommerce/product-editor';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */

import './style.scss';
import BlockEditorGuide from './block-editor-guide';
import { usePublishedProductsCount } from './use-published-products-count';

interface Props {
	shouldTourBeShown: boolean;
	dismissModal: () => void;
}

const BlockEditorTour = ( { shouldTourBeShown, dismissModal }: Props ) => {
	const { isNewUser, loadingPublishedProductsCount } =
		usePublishedProductsCount();

	useEffect( () => {
		if ( shouldTourBeShown ) {
			recordEvent( 'block_product_editor_spotlight_view' );
		}
	}, [ shouldTourBeShown ] );

	const [ isGuideOpen, setIsGuideOpen ] = useState( false );

	const { maybeShowFeedbackBar } = useFeedbackBar();

	const openGuide = () => {
		setIsGuideOpen( true );
	};

	const getTourText = () => {
		return {
			heading: isNewUser
				? __( 'Meet the product editing form', 'poocommerce' )
				: __( 'Welcome to the new product form!', 'poocommerce' ),
			description: isNewUser
				? __(
						"Discover the product form's unique features with a quick overview of what's included.",
						'poocommerce'
				  )
				: __(
						"Discover its new features and improvements with a quick overview of what's included.",
						'poocommerce'
				  ),
		};
	};

	if ( loadingPublishedProductsCount ) {
		return null;
	}

	if ( isGuideOpen ) {
		return (
			<BlockEditorGuide
				isNewUser={ isNewUser }
				onCloseGuide={ ( currentPage, source ) => {
					dismissModal();
					if ( source === 'finish' ) {
						recordEvent(
							'block_product_editor_spotlight_tell_me_more_click'
						);
					} else {
						//  adding 1 to consider the TourKit as page 0
						recordEvent(
							'block_product_editor_spotlight_dismissed',
							{
								current_page: currentPage + 1,
							}
						);
					}
					setIsGuideOpen( false );
					maybeShowFeedbackBar();
				} }
			/>
		);
	} else if ( shouldTourBeShown ) {
		const { heading, description } = getTourText();

		return (
			<TourKit
				config={ {
					steps: [
						{
							meta: {
								name: 'poocommerce-block-editor-tour',
								primaryButton: {
									text: __(
										'View highlights',
										'poocommerce'
									),
								},
								descriptions: {
									desktop: description,
								},
								heading: (
									<>
										<span>{ heading }</span>
										<Pill>
											{ __( 'Beta', 'poocommerce' ) }
										</Pill>
									</>
								),
							},
							referenceElements: {
								desktop: '#adminmenuback',
							},
						},
					],
					closeHandler: ( _steps, _currentStepIndex, source ) => {
						if ( source === 'done-btn' ) {
							recordEvent(
								'block_product_editor_spotlight_view_highlights'
							);
							openGuide();
						} else {
							dismissModal();
							recordEvent(
								'block_product_editor_spotlight_dismissed',
								{
									current_page: 0,
								}
							);
							maybeShowFeedbackBar();
						}
					},
					options: {
						effects: {
							arrowIndicator: false,
							overlay: false,
							liveResize: {
								rootElementSelector: '#adminmenuback',
								resize: true,
							},
						},
						portalParentElement:
							document.getElementById( 'wpbody' ),
						popperModifiers: [
							{
								name: 'bottom-left',
								enabled: true,
								phase: 'beforeWrite',
								requires: [ 'computeStyles' ],
								fn: ( { state } ) => {
									state.styles.popper.top = 'auto';
									state.styles.popper.left = 'auto';
									state.styles.popper.bottom = '10px';
									state.styles.popper.transform =
										'translate3d(10px, 0px, 0px)';
								},
							},
						],
						classNames: 'poocommerce-block-editor-tourkit',
					},
				} }
			/>
		);
	}
	return null;
};

export default BlockEditorTour;
