/**
 * External dependencies
 */
import type { RegisteredBlockComponent } from '@poocommerce/types';

const registeredBlockComponents: Record<
	string,
	Record< string, RegisteredBlockComponent >
> = {};

export { registeredBlockComponents };
