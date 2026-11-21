/**
 * External dependencies
 */
import clsx from 'clsx';
import { Fragment } from '@wordpress/element';
import { CardBody, CardMedia, CardDivider } from '@wordpress/components';
import { SetupRequired } from '@poocommerce/onboarding';
import { Pill } from '@poocommerce/components';
import { Text, useSlot } from '@poocommerce/experimental';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Action } from '../Action';
import './List.scss';
import fallbackImage from './fallback.png';

export const Item = ( { isRecommended, markConfigured, paymentGateway } ) => {
	const {
		image_72x72: image72x72,
		content,
		id,
		plugins = [],
		title,
		loading,
		enabled: isEnabled = false,
		installed: isInstalled = false,
		needsSetup = true,
		requiredSettings,
		settingsUrl: manageUrl,
		is_local_partner: isLocalPartner,
		external_link: externalLink,
		transaction_processors: transactionProcessors,
	} = paymentGateway;

	const connectSlot = useSlot(
		`poocommerce_payment_gateway_configure_${ id }`
	);
	const setupSlot = useSlot( `poocommerce_payment_gateway_setup_${ id }` );

	const hasFills =
		Boolean( connectSlot?.fills?.length ) ||
		Boolean( setupSlot?.fills?.length );

	const hasSetup = Boolean(
		plugins.length || requiredSettings.length || hasFills || externalLink
	);
	const showRecommended = isRecommended && needsSetup;

	const classes = clsx(
		'poocommerce-task-payment',
		'poocommerce-task-card',
		needsSetup && 'poocommerce-task-payment-not-configured',
		'poocommerce-task-payment-' + id
	);

	return (
		<Fragment key={ id }>
			<CardBody
				style={ { paddingLeft: 0, marginBottom: 0 } }
				className={ classes }
			>
				<CardMedia isBorderless>
					<img
						src={ image72x72 }
						alt={ title }
						onError={ ( e ) =>
							( e.currentTarget.src = fallbackImage )
						}
					/>
				</CardMedia>
				<div className="poocommerce-task-payment__description">
					<Text as="h3" className="poocommerce-task-payment__title">
						<span>{ title }</span>
						{ showRecommended && (
							<Pill
								className={ ! isLocalPartner && 'pill-green' }
							>
								{ isLocalPartner
									? __( 'Local Partner', 'poocommerce' )
									: __( 'Recommended', 'poocommerce' ) }
							</Pill>
						) }
						{ isInstalled && needsSetup && !! plugins.length && (
							<SetupRequired />
						) }
					</Text>
					<div className="poocommerce-task-payment__content">
						{ content }
					</div>
					{ transactionProcessors && (
						<div className="poocommerce-task-payment__transaction-processors_images">
							{ Object.keys( transactionProcessors ).map(
								( key ) => {
									return (
										<img
											src={ transactionProcessors[ key ] }
											alt={ key }
											key={ key }
										/>
									);
								}
							) }
						</div>
					) }
				</div>
				<div className="poocommerce-task-payment__footer">
					<Action
						manageUrl={ manageUrl }
						id={ id }
						hasSetup={ hasSetup }
						needsSetup={ needsSetup }
						isEnabled={ isEnabled }
						isInstalled={ isInstalled }
						hasPlugins={ Boolean( plugins.length ) }
						isRecommended={ isRecommended }
						isLoading={ loading }
						markConfigured={ markConfigured }
						externalLink={ externalLink }
					/>
				</div>
			</CardBody>
			<CardDivider />
		</Fragment>
	);
};
