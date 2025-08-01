/**
 * External dependencies
 */
import { getSetting } from '@poocommerce/settings';

/**
 * Internal dependencies
 */
import { WcBlocksConfig } from './constants';

/**
 * Checks if experimental blocks are enabled. Do not use to conditionally register blocks,
 * use BlockTypesController to conditionally register blocks.
 *
 * @return {boolean} True if this experimental blocks are enabled.
 */
export const isExperimentalBlocksEnabled = (): boolean => {
	const { experimentalBlocksEnabled } = getSetting( 'wcBlocksConfig', {
		experimentalBlocksEnabled: false,
	} ) as WcBlocksConfig;

	return experimentalBlocksEnabled;
};

export const isExperimentalWcRestApiEnabled = (): boolean => {
	const { experimentalWcRestApi } = getSetting( 'wcBlocksConfig', {
		experimentalWcRestApi: false,
	} ) as WcBlocksConfig;

	return experimentalWcRestApi;
};
