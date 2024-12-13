/**
 * External dependencies
 */
import React from 'react';
import {
	Button,
	Card,
	CardBody,
	CardMedia,
	Modal,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createInterpolateElement, useState } from '@wordpress/element';
import { Link } from '@poocommerce/components';
import { PaymentIncentive } from '@poocommerce/data';

/**
 * Internal dependencies
 */
import './incentive-modal.scss';
import { StatusBadge } from '~/settings-payments/components/status-badge';
import { WC_ASSET_URL } from '~/utils/admin-settings';

interface IncentiveModalProps {
	/**
	 * Incentive data.
	 */
	incentive: PaymentIncentive;
	/**
	 * Callback used when an incentive is accepted.
	 *
	 * @param id   Plugin ID.
	 * @param slug Plugin slug.
	 */
	onAccept: ( id: string, slug: string ) => void;
	/**
	 * Callback to handle dismiss action.
	 *
	 * @param dismissHref Dismiss URL.
	 * @param context     The context in which the incentive is dismissed. (e.g. whether it was in a modal or banner).
	 */
	onDismiss: ( dismissUrl: string, context: string ) => void;
}

export const IncentiveModal = ( {
	incentive,
	onAccept,
	onDismiss,
}: IncentiveModalProps ) => {
	const [ isBusy, setIsBusy ] = useState( false );
	const [ isOpen, setIsOpen ] = useState( true );

	const incentiveContext = 'wc_settings_payments__modal';

	const handleClose = () => {
		setIsOpen( false );
	};

	const isDismissedInContext =
		incentive._dismissals.includes( 'all' ) ||
		incentive._dismissals.includes( incentiveContext );

	if ( isDismissedInContext ) {
		return null;
	}

	return (
		<>
			{ isOpen && (
				<Modal
					title=""
					className="poocommerce-incentive-modal"
					onRequestClose={ () => {
						onDismiss(
							incentive._links.dismiss.href,
							incentiveContext
						);
						handleClose();
					} }
				>
					<Card className={ 'poocommerce-incentive-modal__card' }>
						<div className="poocommerce-incentive-modal__content">
							<CardMedia
								className={
									'poocommerce-incentive-modal__media'
								}
							>
								<img
									src={
										WC_ASSET_URL +
										'images/settings-payments/incentives-illustration.svg'
									}
									alt={ __(
										'Incentive illustration',
										'poocommerce'
									) }
								/>
							</CardMedia>
							<CardBody
								className={
									'poocommerce-incentive-modal__body'
								}
							>
								<div>
									<StatusBadge
										status={ 'has_incentive' }
										message={ __(
											'Limited time offer',
											'poocommerce'
										) }
									/>
								</div>
								<h2>{ incentive.title }</h2>
								<p>{ incentive.description }</p>
								<p
									className={
										'poocommerce-incentive-modal__terms'
									}
								>
									{ createInterpolateElement(
										__(
											'See <termsLink /> for details.',
											'poocommerce'
										),
										{
											termsLink: (
												<Link
													href={ incentive.tc_url }
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
								<div className="poocommerce-incentive-model__actions">
									<Button
										variant={ 'primary' }
										isBusy={ isBusy }
										disabled={ isBusy }
										onClick={ () => {
											setIsBusy( true );
											// TODO: Temporary for testing, update to use plugin ID and slug.
											onAccept(
												'woopayments',
												'poocommerce-payments'
											);
											setIsBusy( false );
											handleClose();
										} }
									>
										{ incentive.cta_label }
									</Button>
								</div>
							</CardBody>
						</div>
					</Card>
				</Modal>
			) }
		</>
	);
};
