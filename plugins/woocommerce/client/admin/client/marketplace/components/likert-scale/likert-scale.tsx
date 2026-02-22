/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import './likert-scale.scss';

export interface LikertScaleProps {
	title: string;
	fieldName: string;
	onValueChange: ( value: number ) => void;
	validationFailed?: boolean;
}

export interface LikertChangeEvent {
	target: {
		value: number;
	};
}

export default function LikertScale( props: LikertScaleProps ): JSX.Element {
	const { title, fieldName, onValueChange, validationFailed } = props;
	const scaleOptions = [
		{
			value: 1,
			emoji: '😔',
			label: __( 'Strongly disagree', 'poocommerce' ),
		},
		{
			value: 2,
			emoji: '🙁',
			label: __( 'Disagree', 'poocommerce' ),
		},
		{
			value: 3,
			emoji: '😐',
			label: __( 'Neutral', 'poocommerce' ),
		},
		{
			value: 4,
			emoji: '🙂',
			label: __( 'Agree', 'poocommerce' ),
		},
		{
			value: 5,
			emoji: '😍',
			label: __( 'Strongly agree', 'poocommerce' ),
		},
	];

	const classes = clsx( 'poocommerce-marketplace__likert-scale', {
		'validation-failed': validationFailed,
	} );

	function valueChanged( e: React.ChangeEvent< HTMLInputElement > ) {
		onValueChange( parseInt( e.target.value, 10 ) );
	}

	return (
		<>
			<h2>{ title }</h2>
			<ol className={ classes }>
				{ scaleOptions.map( ( option ) => {
					const key = `${ fieldName }_${ option.value }`;
					return (
						<li
							key={ key }
							className="poocommerce-marketplace__likert-scale-item"
						>
							<input
								type="radio"
								name={ fieldName }
								value={ option.value }
								id={ key }
								onChange={ valueChanged }
								className="screen-reader-text"
							/>
							<label htmlFor={ key }>
								<div className="poocommerce-marketplace__likert-scale-icon">
									{ option.emoji }
								</div>
								<div className="poocommerce-marketplace__likert-scale-text">
									{ option.label }
								</div>
							</label>
						</li>
					);
				} ) }
			</ol>
		</>
	);
}
