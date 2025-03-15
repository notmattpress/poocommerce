/**
 * External dependencies
 */
import { Card, CardBody, CardHeader, CardFooter } from '@wordpress/components';
import { Text } from '@poocommerce/experimental';
import { createElement } from '@wordpress/element';
import { Link } from '@poocommerce/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { WCPayAcceptedMethods } from '../WCPayAcceptedMethods';
import WCPayLogo from '../../images/wcpay-logo';

type WCPayCardHeaderProps = {
	logoWidth?: number;
	logoHeight?: number;
	children?: React.ReactNode;
};

export const WCPayCardHeader: React.FC< WCPayCardHeaderProps > = ( {
	logoWidth = 196,
	logoHeight = 41,
	children,
} ) => (
	<CardHeader as="h2">
		<WCPayLogo width={ logoWidth } height={ logoHeight } />
		{ children }
	</CardHeader>
);

type WCPayCardBodyProps = {
	description: string;
	heading: string;
	onLinkClick?: () => void;
};

export const WCPayCardBody: React.VFC< WCPayCardBodyProps > = ( {
	description,
	heading,
	onLinkClick = () => {},
} ) => (
	<CardBody>
		{ heading && <Text as="h2">{ heading }</Text> }

		<Text
			className="poocommerce-task-payment-wcpay__description"
			as="p"
			lineHeight="1.5em"
		>
			{ description }
			<br />
			<Link
				target="_blank"
				type="external"
				rel="noreferrer"
				href="https://poocommerce.com/payments/?utm_medium=product"
				onClick={ onLinkClick }
			>
				{ __( 'Learn more', 'poocommerce' ) }
			</Link>
		</Text>

		<WCPayAcceptedMethods />
	</CardBody>
);

export const WCPayCardFooter: React.FC< { children?: React.ReactNode } > = ( {
	children,
} ) => <CardFooter>{ children }</CardFooter>;

export const WCPayCard: React.FC< { children?: React.ReactNode } > = ( {
	children,
} ) => {
	return <Card className="poocommerce-task-payment-wcpay">{ children }</Card>;
};
