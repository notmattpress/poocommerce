/**
 * External dependencies
 */
import { applyFilters } from '@wordpress/hooks';
import { useEffect } from '@wordpress/element';
import { triggerExitPageCesSurvey } from '@poocommerce/customer-effort-score';
import {
	LayoutContextProvider,
	getLayoutContextValue,
} from '@poocommerce/admin-layout';
import QueryString, { parse } from 'qs';

/**
 * Internal dependencies
 */
import { PaymentRecommendations } from '../payments';
import { ShippingRecommendations } from '../shipping';
import { EmbeddedBodyProps } from './embedded-body-props';
import { StoreAddressTour } from '../guided-tours/store-address-tour';
import './style.scss';

type QueryParams = EmbeddedBodyProps;

function isWPPage(
	params: QueryParams | QueryString.ParsedQs
): params is QueryParams {
	return ( params as QueryParams ).page !== undefined;
}

const EMBEDDED_BODY_COMPONENT_LIST: React.ElementType[] = [
	PaymentRecommendations,
	ShippingRecommendations,
	StoreAddressTour,
];

/**
 * This component is appended to the bottom of the PooCommerce non-react pages (like settings).
 * You can add a component by writing a Fill component from slot-fill with the `embedded-body-layout` name.
 *
 * Each Fill component receives QueryParams, consisting of a page, tab, and section string.
 */
export const EmbeddedBodyLayout = () => {
	useEffect( () => {
		triggerExitPageCesSurvey();
	}, [] );

	const query = parse( location.search.substring( 1 ) );
	let queryParams: QueryParams = { page: '', tab: '' };
	if ( isWPPage( query ) ) {
		queryParams = query;
	}
	/**
	 * Filter an array of body components for PooCommerce non-react pages.
	 *
	 * @filter poocommerce_admin_embedded_layout_components
	 * @param {Array.<Node>} embeddedBodyComponentList Array of body components.
	 * @param {Object}       query                     url query parameters.
	 */
	const componentList = applyFilters(
		'poocommerce_admin_embedded_layout_components',
		EMBEDDED_BODY_COMPONENT_LIST,
		queryParams
	) as React.ElementType< EmbeddedBodyProps >[];

	return (
		<LayoutContextProvider value={ getLayoutContextValue( [ 'page' ] ) }>
			<div
				className="poocommerce-embedded-layout__primary"
				id="poocommerce-embedded-layout__primary"
			>
				{ componentList.map( ( Comp, index ) => {
					return <Comp key={ index } { ...queryParams } />;
				} ) }
			</div>
		</LayoutContextProvider>
	);
};
