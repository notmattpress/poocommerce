/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Popover } from '@wordpress/components';
import { Link, Pill } from '@poocommerce/components';
import { createInterpolateElement, useRef, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { WC_ASSET_URL } from '~/utils/admin-settings';
import { recordPaymentsEvent } from '~/settings-payments/utils';

interface OfficialBadgeProps {
	/**
	 * The style of the badge.
	 */
	variant: 'expanded' | 'compact';

	/**
	 * The id of the official suggestion.
	 */
	suggestionId: string;
}

/**
 * A component that displays an official badge.
 *
 * The style of the badge can be either "expanded" or "compact".
 *
 * @example
 * // Render an official badge with icon and text.
 * <OfficialBadge variant="expanded" suggestionId="some_id" />
 *
 * @example
 * // Render an official badge with just the icon.
 * <OfficialBadge variant="compact" suggestionId="some_id" />
 */
export const OfficialBadge = ( {
	variant,
	suggestionId,
}: OfficialBadgeProps ) => {
	const [ isPopoverVisible, setPopoverVisible ] = useState( false );
	const buttonRef = useRef< HTMLButtonElement >( null );

	const handleClick = ( event: React.MouseEvent | React.KeyboardEvent ) => {
		const clickedElement = event.target as HTMLElement;
		const parentSpan = clickedElement.closest(
			'.poocommerce-official-extension-badge__container'
		);

		if ( buttonRef.current && parentSpan !== buttonRef.current ) {
			return;
		}

		setPopoverVisible( ( prev ) => ! prev );

		// Record the event when the user clicks on the badge.
		recordPaymentsEvent( 'official_badge_click', {
			suggestion_id: suggestionId,
		} );
	};

	const handleFocusOutside = () => {
		setPopoverVisible( false );
	};

	return (
		<Pill className={ `poocommerce-official-extension-badge` }>
			<span
				className="poocommerce-official-extension-badge__container"
				tabIndex={ 0 }
				role="button"
				ref={ buttonRef }
				onClick={ handleClick }
				onKeyDown={ ( event: React.KeyboardEvent ) => {
					if ( event.key === 'Enter' || event.key === ' ' ) {
						handleClick( event );
					}
				} }
			>
				<img
					src={ WC_ASSET_URL + 'images/icons/official-extension.svg' }
					alt={ __(
						'Official PooCommerce extension badge',
						'poocommerce'
					) }
				/>
				{ variant === 'expanded' && (
					<span>{ __( 'Official', 'poocommerce' ) }</span>
				) }
				{ isPopoverVisible && (
					<Popover
						className="poocommerce-official-extension-badge-popover"
						placement="top-start"
						offset={ 4 }
						variant="unstyled"
						focusOnMount={ true }
						noArrow={ true }
						shift={ true }
						onFocusOutside={ handleFocusOutside }
					>
						<div className="components-popover__content-container">
							<p>
								{ createInterpolateElement(
									__(
										'This is an Official PooCommerce payment extension. <learnMoreLink />',
										'poocommerce'
									),
									{
										learnMoreLink: (
											<Link
												href="https://poocommerce.com/learn-more-about-official-partner-badging/"
												target="_blank"
												rel="noreferrer"
												type="external"
												onClick={ () => {
													// Record the event when the user clicks on the learn more link.
													recordPaymentsEvent(
														'official_badge_learn_more_click',
														{
															suggestion_id:
																suggestionId,
														}
													);
												} }
											>
												{ __(
													'Learn more',
													'poocommerce'
												) }
											</Link>
										),
									}
								) }
							</p>
						</div>
					</Popover>
				) }
			</span>
		</Pill>
	);
};
