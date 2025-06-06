/**
 * External dependencies
 */
import { useState, createContext, useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { SubscriptionsContextType, NoticeStatus } from './types';
import { Subscription } from '../components/my-subscriptions/types';
import {
	addNotice,
	fetchSubscriptions,
	refreshSubscriptions as fetchSubscriptionsFromWooCom,
} from '../utils/functions';

const defaultContext: SubscriptionsContextType = {
	subscriptions: [],
	setSubscriptions: () => {},
	loadSubscriptions: () => Promise.resolve(),
	refreshSubscriptions: () => Promise.resolve(),
	isLoading: true,
	setIsLoading: () => {},
};

export const SubscriptionsContext =
	createContext< SubscriptionsContextType >( defaultContext );

export function SubscriptionsContextProvider( props: {
	children: JSX.Element;
} ): JSX.Element {
	const [ subscriptions, setSubscriptions ] = useState<
		Array< Subscription >
	>( [] );
	const [ isLoading, setIsLoading ] = useState( true );

	const loadSubscriptions = ( toggleLoading?: boolean ) => {
		if ( toggleLoading === true ) {
			setIsLoading( true );
		}

		return fetchSubscriptions()
			.then( ( subscriptionResponse ) => {
				setSubscriptions( subscriptionResponse );
			} )
			.finally( () => {
				if ( toggleLoading ) {
					setIsLoading( false );
				}
			} );
	};

	const refreshSubscriptions = ( toggleLoading?: boolean ) => {
		if ( toggleLoading ) {
			setIsLoading( true );
		}

		return fetchSubscriptionsFromWooCom()
			.then( ( subscriptionResponse ) => {
				setSubscriptions( subscriptionResponse );
			} )
			.catch( ( error ) => {
				throw error;
			} )
			.finally( () => {
				if ( toggleLoading ) {
					setIsLoading( false );
				}
			} );
	};

	useEffect( () => {
		/**
		 * Check if we have &install=PRODUCT_KEY in the URL. This means we have just
		 * installed a new product and nwe need to refresh the list.
		 */
		const urlParams = new URLSearchParams( window.location.search );
		const installKey = urlParams.get( 'install' );

		if ( installKey ) {
			refreshSubscriptions( true ).catch( ( error ) => {
				addNotice(
					'poocommerce-marketplace-refresh-subscriptions',
					sprintf(
						// translators: %s is the error message.
						__(
							'Error refreshing subscriptions: %s',
							'poocommerce'
						),
						error.message
					),
					NoticeStatus.Error
				);
			} );

			return;
		}

		loadSubscriptions( true ).catch( ( error ) => {
			addNotice(
				'poocommerce-marketplace-load-subscriptions',
				sprintf(
					// translators: %s is the error message.
					__( 'Error loading subscriptions: %s', 'poocommerce' ),
					error.message
				),
				NoticeStatus.Error
			);
		} );
	}, [] );

	const contextValue = {
		subscriptions,
		setSubscriptions,
		loadSubscriptions,
		refreshSubscriptions,
		isLoading,
		setIsLoading,
	};

	return (
		<SubscriptionsContext.Provider value={ contextValue }>
			{ props.children }
		</SubscriptionsContext.Provider>
	);
}
