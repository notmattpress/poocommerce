/* eslint-disable @typescript-eslint/ban-ts-comment */

/**
 * External dependencies
 */
import {
	Button,
	CheckboxControl,
	TextareaControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { trackEvent } from '~/customize-store/tracking';

interface CloseSurveyFunction {
	(): void;
}

interface StarRatingChangeFunction {
	( value: number ): void;
}

const StarRating = ( {
	value,
	onChange,
}: {
	value: number;
	onChange: StarRatingChangeFunction;
} ): JSX.Element => {
	return (
		<div className="poocommerce-survey-star-rating">
			{ [ ...Array( 5 ) ].map( ( star, index ) => {
				index += 1;
				return (
					<button
						type="button"
						key={ index }
						className={
							index <= value
								? 'poocommerce-survey-star-rating__button-on'
								: 'poocommerce-survey-star-rating__button-off'
						}
						onClick={ () => {
							onChange( index );
						} }
					>
						<span className="poocommerce-survey-star-rating__star">
							&#9733;
						</span>
					</button>
				);
			} ) }
		</div>
	);
};

export const SurveyForm = ( {
	onSend,
	closeFunction,
}: {
	onSend: () => void;
	closeFunction: CloseSurveyFunction;
} ): JSX.Element => {
	const [ isStreamlineChecked, setStreamlineChecked ] = useState( false );
	const [ isDislikeThemesChecked, setDislikeChecked ] = useState( false );
	const [ isThemeNoMatchChecked, setThemeNoMatchChecked ] = useState( false );
	const [ isOtherChecked, setOtherChecked ] = useState( false );
	const [ feedbackText, setFeedbackText ] = useState( '' );
	const [ spillBeansText, setSpillBeansText ] = useState( '' );
	const { createSuccessNotice } = useDispatch( 'core/notices' );
	const [ rating, setRating ] = useState( 0 );

	const disableSendButton =
		rating === 0 ||
		( ! isStreamlineChecked &&
			! isDislikeThemesChecked &&
			! isThemeNoMatchChecked &&
			! isOtherChecked );

	const sendData = () => {
		trackEvent( 'ces_feedback', {
			action: 'customize_your_store_on_core_transitional_survey_complete',
			score: rating,
			choose_design_my_own_theme: isStreamlineChecked,
			choose_dislike_themes: isDislikeThemesChecked,
			choose_themes_not_match: isThemeNoMatchChecked,
			choose_other: isOtherChecked,
			comments: feedbackText,
			spill_beans: spillBeansText,
		} );

		onSend();
		createSuccessNotice(
			__(
				"Thanks for the feedback. We'll put it to good use!",
				'poocommerce'
			),
			{
				type: 'snackbar',
			}
		);
	};

	return (
		<>
			<div className="poocommerce-ai-survey-form">
				<div className="content">
					<p className="poocommerce-ai-survey-form__description">
						{ __(
							'Our goal is to make sure you have all the right tools to start customizing your store. We’d love to know if we hit our mark and how we can improve.',
							'poocommerce'
						) }
					</p>

					<h4>
						{ __(
							'On a scale of 1 = difficult to 5 = very easy, how would you rate the overall experience?',
							'poocommerce'
						) }
						<span>*</span>
					</h4>
					<StarRating value={ rating } onChange={ setRating } />

					<hr />

					<h4>
						{ __(
							'What motivated you to choose the "Design your own theme" option?',
							'poocommerce'
						) }
						<span>*</span>
					</h4>
					<CheckboxControl
						label={ __(
							'I wanted to design my own theme.',
							'poocommerce'
						) }
						checked={ isStreamlineChecked }
						onChange={ setStreamlineChecked }
					/>
					<CheckboxControl
						label={ __(
							"I didn't like any of the available themes.",
							'poocommerce'
						) }
						checked={ isDislikeThemesChecked }
						onChange={ setDislikeChecked }
					/>
					<CheckboxControl
						label={ __(
							"I didn't find a theme that matched my needs.",
							'poocommerce'
						) }
						checked={ isThemeNoMatchChecked }
						onChange={ setThemeNoMatchChecked }
					/>
					<CheckboxControl
						label={ __( 'Other.', 'poocommerce' ) }
						checked={ isOtherChecked }
						onChange={ setOtherChecked }
					/>

					<hr />

					<h4>
						{ __(
							'Did you find anything confusing, irrelevant, or not useful?',
							'poocommerce'
						) }
					</h4>
					<TextareaControl
						value={ feedbackText }
						onChange={ setFeedbackText }
					/>

					<hr />

					<h4>
						{ __(
							'Feel free to spill the beans here. All suggestions, feedback, or comments about the "Design your own theme" experience are welcome.',
							'poocommerce'
						) }
					</h4>
					<TextareaControl
						value={ spillBeansText }
						onChange={ setSpillBeansText }
					/>
				</div>

				<div>
					<hr />
					<div className="buttons">
						<Button
							className="is-spinner"
							variant="tertiary"
							onClick={ closeFunction }
						>
							{ __( 'Cancel', 'poocommerce' ) }
						</Button>

						<Button
							variant="primary"
							onClick={ sendData }
							disabled={ disableSendButton }
						>
							{ __( 'Send', 'poocommerce' ) }
						</Button>
					</div>
				</div>
			</div>
		</>
	);
};
