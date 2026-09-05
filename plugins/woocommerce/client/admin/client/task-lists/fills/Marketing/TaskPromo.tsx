/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { Text } from '@poocommerce/experimental';
import { useEffect } from '@wordpress/element';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import './TaskPromo.scss';
import { WC_ASSET_URL } from '~/utils/admin-settings';

export type TaskPromoProps = {
	title?: string;
	iconSrc?: string;
	iconAlt?: string;
	name?: string;
	text?: string;
	buttonHref?: string;
	buttonText?: string;
	onButtonClick?: () => void;
};

export const TaskPromo = ( {
	title = '',
	iconSrc = `${ WC_ASSET_URL }images/woo-app-icon.svg`,
	iconAlt = __( 'Woo icon', 'poocommerce' ),
	name = __( 'PooCommerce Marketplace', 'poocommerce' ),
	text = '',
	buttonHref = '',
	buttonText = '',
	onButtonClick,
}: TaskPromoProps ) => {
	useEffect( () => {
		recordEvent( 'task_marketing_marketplace_promo_shown', {
			task: 'marketing',
		} );
	}, [] );

	return (
		<Card className="poocommerce-task-card poocommerce-task-promo">
			{ title && (
				<CardHeader>
					<Text
						variant="title.small"
						as="h2"
						className="poocommerce-task-card__title"
					>
						{ title }
					</Text>
				</CardHeader>
			) }
			<CardBody>
				{ iconSrc && iconAlt && (
					<div className="poocommerce-plugin-list__plugin-logo">
						<img src={ iconSrc } alt={ iconAlt } />
					</div>
				) }
				<div className="poocommerce-plugin-list__plugin-text">
					<Text variant="subtitle.small" as="h4">
						{ name }
					</Text>
					<Text variant="subtitle.small">{ text }</Text>
				</div>
				<div className="poocommerce-plugin-list__plugin-action">
					<Button
						isSecondary
						href={ buttonHref }
						onClick={ onButtonClick }
					>
						{ buttonText }
					</Button>
				</div>
			</CardBody>
		</Card>
	);
};
