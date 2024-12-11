/**
 * Internal dependencies
 */
import { renderWrappedComponent } from '../utils';
import { WriteShortDescriptionButtonContainer } from './product-short-description-button-container';

if ( window.JP_CONNECTION_INITIAL_STATE?.connectionStatus?.isActive ) {
	renderWrappedComponent(
		WriteShortDescriptionButtonContainer,
		document.getElementById(
			'poocommerce-ai-app-product-short-description-gpt-button'
		)
	);
}
