/**
 * External dependencies
 */
import { HTTPClientFactory } from '@poocommerce/api';

/**
 * Internal dependencies
 */
import { admin } from '../test-data/data';
import playwrightConfig from '../playwright.config';

export default function apiClient() {
	return HTTPClientFactory.build( playwrightConfig.use.baseURL )
		.withBasicAuth( admin.username, admin.password )
		.withIndexPermalinks()
		.create();
}
