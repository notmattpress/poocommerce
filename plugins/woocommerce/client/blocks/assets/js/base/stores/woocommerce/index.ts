/**
 * Registers the `poocommerce` store.
 *
 * Each file below contributes its members to the store through its own
 * `store( 'poocommerce', … )` call, so loading this module is what assembles
 * the store. These imports are side-effect-only: they survive production
 * tree-shaking only because `package.json` lists
 * `./assets/js/base/stores/poocommerce/**` in `sideEffects`.
 */
import './cart/notices';
import './cart/actions';
import './products';

export type { PooCommerceConfig, SelectedAttributes } from './types';
export type { ProductDataState } from './products';
export type {
	OptimisticCartItem,
	ClientCartItem,
	AddCartItemError,
	AddCartItemOutcome,
	Store,
} from './cart/types';
