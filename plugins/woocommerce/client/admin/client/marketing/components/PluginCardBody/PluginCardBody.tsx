/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import { CardBody } from '~/marketing/components';
import './PluginCardBody.scss';

type PluginCardBodyProps = {
	className?: string;
	icon: JSX.Element;
	name: string;

	/**
	 * PooCommerce's Pill component to be rendered beside the name.
	 */
	pills?: Array< JSX.Element >;

	description: React.ReactNode;
	button?: JSX.Element;
};

/**
 * Renders a CardBody layout component to display plugin info and button.
 */
export const PluginCardBody: React.FC< PluginCardBodyProps > = ( {
	className,
	icon,
	name,
	pills,
	description,
	button,
} ) => {
	return (
		<CardBody
			className={ clsx(
				'poocommerce_marketing_plugin_card_body',
				className
			) }
		>
			<div className="poocommerce_marketing_plugin_card_body__icon">
				{ icon }
			</div>
			<div className="poocommerce_marketing_plugin_card_body__details">
				<div className="poocommerce_marketing_plugin_card_body__details-name">
					{ name }
					{ pills }
				</div>
				<div className="poocommerce_marketing_plugin_card_body__details-description">
					{ description }
				</div>
			</div>
			{ button }
		</CardBody>
	);
};
