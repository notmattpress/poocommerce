/**
 * External dependencies
 */
import { useState, useEffect } from '@wordpress/element';

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '@wordpress/components';
import { Spinner } from '@poocommerce/components';
import { Text } from '@poocommerce/experimental';
import { WooHeaderPageTitle } from '@poocommerce/admin-layout';

const NoMatch = () => {
	const [ isDelaying, setIsDelaying ] = useState( true );

	/*
	 * Delay for 3 seconds to wait if there are routing pages added after the
	 * initial routing pages to reduce the chance of flashing the error message
	 * on this page.
	 */
	useEffect( () => {
		const timerId = setTimeout( () => {
			setIsDelaying( false );
		}, 3000 );

		return () => {
			clearTimeout( timerId );
		};
	}, [] );

	if ( isDelaying ) {
		return (
			<>
				<WooHeaderPageTitle>
					{ __( 'Loading…', 'poocommerce' ) }
				</WooHeaderPageTitle>
				<div className="poocommerce-layout__loading">
					<Spinner />
				</div>
			</>
		);
	}

	return (
		<div className="poocommerce-layout__no-match">
			<Card>
				<CardBody>
					<Text>
						{ __(
							'Sorry, you are not allowed to access this page.',
							'poocommerce'
						) }
					</Text>
				</CardBody>
			</Card>
		</div>
	);
};

export { NoMatch };
