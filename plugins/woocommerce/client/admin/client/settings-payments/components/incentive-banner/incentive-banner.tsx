/**
 * External dependencies
 */
import React from 'react';
import { Button, Card, CardBody, CardMedia } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createInterpolateElement, useState } from '@wordpress/element';
import { Link } from '@poocommerce/components';

/**
 * Internal dependencies
 */
import { WC_ASSET_URL } from '~/utils/admin-settings';
import './incentive-banner.scss';
import { StatusBadge } from '~/settings-payments/components/status-badge';

export const IncentiveBanner = () => {
	const [ isSubmitted, setIsSubmitted ] = useState( false );
	const [ isDismissClicked, setIsDismissClicked ] = useState( false );

	const handleSetup = () => {
		setIsSubmitted( true );
	};

	const handleDismiss = () => {
		setIsDismissClicked( true );
	};

	return (
		<Card className="poocommerce-incentive-banner" isRounded={ true }>
			<div className="poocommerce-incentive-banner__content">
				<CardMedia>
					<img
						src={
							WC_ASSET_URL +
							'images/settings-payments/incentives-icon.svg'
						}
						alt={ __( 'Incentive hero image', 'poocommerce' ) }
					/>
				</CardMedia>
				<CardBody className="poocommerce-incentive-banner__body">
					<StatusBadge
						status="has_incentive"
						message={ __( 'Limited time offer', 'poocommerce' ) }
					/>
					<h2>
						{ __(
							'Save 10% on processing fees for your first 3 months when you sign up for WooPayments',
							'poocommerce'
						) }
					</h2>
					<p>
						{ __(
							'Use the native payments solution built and supported by Woo to accept online and in-person payments, track revenue, and handle all payment activity in one place.',
							'poocommerce'
						) }
					</p>
					<p className={ 'poocommerce-incentive-banner__terms' }>
						{ createInterpolateElement(
							__(
								'See <termsLink /> for details.',
								'poocommerce'
							),
							{
								termsLink: (
									<Link
										href="https://poocommerce.com/terms-conditions/woopayments-action-promotion-2023/"
										target="_blank"
										rel="noreferrer"
										type="external"
									>
										{ __(
											'Terms and Conditions',
											'poocommerce'
										) }
									</Link>
								),
							}
						) }
					</p>

					<Button
						variant={ 'primary' }
						isBusy={ isSubmitted }
						disabled={ isSubmitted }
						onClick={ handleSetup }
					>
						{ __( 'Save 10%', 'poocommerce' ) }
					</Button>
					<Button
						variant={ 'tertiary' }
						isBusy={ isDismissClicked }
						disabled={ isDismissClicked }
						onClick={ handleDismiss }
					>
						{ __( 'No thanks', 'poocommerce' ) }
					</Button>
				</CardBody>
			</div>
		</Card>
	);
};
