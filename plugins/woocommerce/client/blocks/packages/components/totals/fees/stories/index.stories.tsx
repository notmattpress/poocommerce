/**
 * External dependencies
 */
import type { StoryFn, Meta } from '@storybook/react';
import {
	currenciesAPIShape,
	currencies,
	currencyControl,
} from '@poocommerce/storybook-controls';

/**
 * Internal dependencies
 */
import Fees, { TotalsFeesProps } from '..';

export default {
	title: 'External Components/Totals/Fees',
	component: Fees,
	argTypes: {
		currency: currencyControl,
	},
	args: {
		total: '',
		cartFees: [
			{
				id: 'my-id',
				key: 'my-id',
				name: 'Storybook fee',
				totals: {
					...currenciesAPIShape.USD,
					total: '1000',
					total_tax: '200',
				},
			},
		],
	},
} as Meta< TotalsFeesProps >;

type StorybookTotalFeesProps = TotalsFeesProps & { total: string };

const Template: StoryFn< StorybookTotalFeesProps > = ( args ) => {
	return (
		<Fees
			{ ...args }
			cartFees={ [
				{
					...args.cartFees[ 0 ],
					totals: {
						...args.cartFees[ 0 ].totals,
						total: args.total,
					},
				},
			] }
		/>
	);
};

export const Default: StoryFn< StorybookTotalFeesProps > = Template.bind( {} );
Default.args = {
	currency: currencies.USD,
	total: '1000',
};

export const AlternativeCurrency: StoryFn< StorybookTotalFeesProps > =
	Template.bind( {} );
AlternativeCurrency.args = {
	currency: currencies.EUR,
	total: '1000',
};
