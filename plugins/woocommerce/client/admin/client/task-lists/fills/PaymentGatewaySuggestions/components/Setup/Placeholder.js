/**
 * External dependencies
 */
import clsx from 'clsx';
import { Card, CardBody } from '@wordpress/components';
import { Stepper } from '@poocommerce/components';

export const Placeholder = () => {
	const classes = clsx(
		'is-loading',
		'poocommerce-task-payment-method',
		'poocommerce-task-card'
	);

	return (
		<Card aria-hidden="true" className={ classes }>
			<CardBody>
				<Stepper
					isVertical
					currentStep={ 'none' }
					steps={ [
						{
							key: 'first',
							label: '',
						},
						{
							key: 'second',
							label: '',
						},
					] }
				/>
			</CardBody>
		</Card>
	);
};
