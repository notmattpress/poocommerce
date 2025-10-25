/**
 * External dependencies
 */
import clsx from 'clsx';
import { isValidElement } from '@wordpress/element';
import type { ReactElement, ReactNode } from 'react';
import type { Currency } from '@poocommerce/types';
import { Skeleton } from '@poocommerce/base-components/skeleton';
import { DelayedContentWithSkeleton } from '@poocommerce/base-components/delayed-content-with-skeleton';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import FormattedMonetaryAmount from '../../formatted-monetary-amount';
import './style.scss';

export interface TotalsItemProps {
	className?: string | undefined;
	currency?: Currency | undefined;
	label: string;
	// Value may be a number, or react node. Numbers are passed to FormattedMonetaryAmount.
	value: number | ReactNode;
	description?: ReactNode;
	showSkeleton?: boolean;
	skeleton?: ReactElement;
}

const TotalsItemValue = ( {
	value,
	currency,
}: Partial< TotalsItemProps > ): ReactElement | null => {
	if ( isValidElement( value ) ) {
		return (
			<div className="wc-block-components-totals-item__value">
				{ value }
			</div>
		);
	}

	return Number.isFinite( value ) ? (
		<FormattedMonetaryAmount
			className="wc-block-components-totals-item__value"
			currency={ currency || undefined }
			value={ value as number }
		/>
	) : null;
};

const TotalsItem = ( {
	className,
	currency,
	label,
	value,
	description,
	showSkeleton = false,
}: TotalsItemProps ): ReactElement => {
	return (
		<div className={ clsx( 'wc-block-components-totals-item', className ) }>
			<span className="wc-block-components-totals-item__label">
				{ label }
			</span>
			<DelayedContentWithSkeleton
				isLoading={ showSkeleton }
				skeleton={
					<>
						<Skeleton
							width="45px"
							height="1em"
							ariaMessage={ __(
								'Loading price… ',
								'poocommerce'
							) }
						/>
					</>
				}
			>
				<TotalsItemValue value={ value } currency={ currency } />
			</DelayedContentWithSkeleton>

			<div className="wc-block-components-totals-item__description">
				{ description }
			</div>
		</div>
	);
};

export default TotalsItem;
