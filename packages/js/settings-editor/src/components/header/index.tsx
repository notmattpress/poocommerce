/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import clsx from 'clsx';
import {
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';

export const Header = ( {
	pageTitle = '',
	hasTabs = false,
}: {
	pageTitle?: string;
	hasTabs?: boolean;
} ) => {
	return (
		<VStack
			className={ clsx(
				'poocommerce-settings-header poocommerce-site-page-header',
				{
					'poocommerce-settings-header--has-tabs': hasTabs,
				}
			) }
			as="header"
			spacing={ 0 }
		>
			<HStack className="poocommerce-site-page-header__page-title">
				<Heading
					as="h2"
					level={ 3 }
					weight={ 500 }
					className="poocommerce-site-page-header__title"
					truncate
				>
					{ pageTitle }
				</Heading>
			</HStack>
		</VStack>
	);
};
