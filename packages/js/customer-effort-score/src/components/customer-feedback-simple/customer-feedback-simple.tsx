/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import { Button, Tooltip } from '@wordpress/components';
import { Text } from '@poocommerce/experimental';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';

export type CustomerFeedbackSimpleProps = {
	onSelect: ( score: number ) => void;
	label: string;
	selectedValue?: number | null;
};

/**
 * Provides a modal requesting customer feedback.
 *
 * A label is displayed in the modal asking the customer to score the
 * difficulty completing a task. A group of radio buttons, styled with
 * emoji facial expressions, are used to provide a score between 1 and 5.
 *
 * A low score triggers a comments field to appear.
 *
 * Upon completion, the score and comments is sent to a callback function.
 *
 * @param {Object}      props                 Component props.
 * @param {Function}    props.onSelect        Function to call when the results are sent.
 * @param {string}      props.label           Question to ask the customer.
 * @param {number|null} [props.selectedValue] The default selected value.
 */
export function CustomerFeedbackSimple( {
	onSelect,
	label,
	selectedValue,
}: CustomerFeedbackSimpleProps ) {
	const options = [
		{
			tooltip: __( 'Very difficult', 'poocommerce' ),
			value: 1,
			emoji: '😞',
		},
		{
			tooltip: __( 'Difficult', 'poocommerce' ),
			value: 2,
			emoji: '🙁',
		},
		{
			tooltip: __( 'Neutral', 'poocommerce' ),
			value: 3,
			emoji: '😑',
		},
		{
			tooltip: __( 'Good', 'poocommerce' ),
			value: 4,
			emoji: '🙂',
		},
		{
			tooltip: __( 'Very good', 'poocommerce' ),
			value: 5,
			emoji: '😍',
		},
	];

	return (
		<div className="customer-feedback-simple__container">
			<Text variant="subtitle.small" as="p" size="13" lineHeight="16px">
				{ label }
			</Text>

			<div className="customer-feedback-simple__selection">
				{ options.map( ( option ) => (
					<Tooltip
						text={ option.tooltip }
						key={ option.value }
						position="top center"
					>
						<Button
							onClick={ () => {
								onSelect( option.value );
							} }
							className={ clsx( {
								'is-selected': selectedValue === option.value,
							} ) }
						>
							{ option.emoji }
						</Button>
					</Tooltip>
				) ) }
			</div>
		</div>
	);
}
