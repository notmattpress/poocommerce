/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { Children } from '@wordpress/element';
import clsx from 'clsx';
import { getAdminLink } from '@poocommerce/settings';

/**
 * Internal dependencies
 */
import { TaxChildProps } from '../utils';
import { TrackedLink } from '~/components/tracked-link/tracked-link';
import './partners.scss';

export const Partners = ( {
	children,
	isPending,
	onManual,
	onDisable,
}: TaxChildProps ) => {
	const classes = clsx(
		'poocommerce-task-card',
		'poocommerce-tax-partners',
		`poocommerce-tax-partners__partners-count-${ Children.count(
			children
		) }`
	);
	return (
		<>
			<Card className={ classes }>
				<CardHeader>
					{ __( 'Choose a tax partner', 'poocommerce' ) }
				</CardHeader>
				<CardBody>
					<div className="poocommerce-tax-partners__partners">
						{ children }
					</div>
					<ul className="poocommerce-tax-partners__other-actions">
						<li>
							<Button
								isTertiary
								disabled={ isPending }
								isBusy={ isPending }
								onClick={ () => {
									onManual();
								} }
							>
								{ __( 'Set up taxes manually', 'poocommerce' ) }
							</Button>
						</li>
						<li>
							<Button
								isTertiary
								disabled={ isPending }
								isBusy={ isPending }
								onClick={ () => {
									onDisable();
								} }
							>
								{ __(
									'I don’t charge sales tax',
									'poocommerce'
								) }
							</Button>
						</li>
					</ul>
				</CardBody>
			</Card>
			<TrackedLink
				textProps={ {
					as: 'div',
					className:
						'poocommerce-task-dashboard__container poocommerce-task-marketplace-link',
				} }
				message={ __(
					// translators: {{Link}} is a placeholder for a html element.
					'Visit {{Link}}the PooCommerce Marketplace{{/Link}} to find more tax solutions.',
					'poocommerce'
				) }
				eventName="tasklist_tax_visit_marketplace_click"
				targetUrl={ getAdminLink(
					'admin.php?page=wc-admin&tab=extensions&path=/extensions&category=operations'
				) }
				linkType="wc-admin"
			/>
		</>
	);
};
