/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { SortSelect } from '@poocommerce/blocks-components';
import type { ChangeEventHandler } from 'react';

/**
 * Internal dependencies
 */
import './style.scss';

interface ReviewSortSelectProps {
	onChange: ChangeEventHandler;
	readOnly?: boolean;
	value: 'most-recent' | 'highest-rating' | 'lowest-rating';
}

const ReviewSortSelect = ( {
	onChange,
	readOnly,
	value,
}: ReviewSortSelectProps ): JSX.Element => {
	return (
		<SortSelect
			className="wc-block-review-sort-select wc-block-components-review-sort-select"
			label={ __( 'Order by', 'poocommerce' ) }
			onChange={ onChange }
			options={ [
				{
					key: 'most-recent',
					label: __( 'Most recent', 'poocommerce' ),
				},
				{
					key: 'highest-rating',
					label: __( 'Highest rating', 'poocommerce' ),
				},
				{
					key: 'lowest-rating',
					label: __( 'Lowest rating', 'poocommerce' ),
				},
			] }
			readOnly={ readOnly }
			screenReaderLabel={ __( 'Order reviews by', 'poocommerce' ) }
			value={ value }
		/>
	);
};

export default ReviewSortSelect;
