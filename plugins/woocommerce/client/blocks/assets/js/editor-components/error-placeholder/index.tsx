/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Icon, warning } from '@wordpress/icons';
import clsx from 'clsx';
import { Button, Placeholder, Spinner } from '@wordpress/components';

/**
 * Internal dependencies
 */
import ErrorMessage from './error-message';
import './editor.scss';

export interface ErrorObject {
	/**
	 * Error code for more specific identification of the error.
	 */
	code?: string;
	/**
	 * Human-readable error message to display.
	 */
	message: string;
	/**
	 * Context in which the error was triggered. That will determine how the error is displayed to the user.
	 */
	type: 'api' | 'general' | string;
}

export interface ErrorPlaceholderProps {
	/**
	 * Classname to add to placeholder in addition to the defaults.
	 */
	className?: string;
	/**
	 * The error object.
	 */
	error: ErrorObject;
	/**
	 * Whether there is a request running, so the 'Retry' button is hidden and
	 * a spinner is shown instead.
	 */
	isLoading: boolean;
	/**
	 * Callback to retry an action.
	 */
	onRetry?: ( () => void ) | undefined;
}

const ErrorPlaceholder = ( {
	className = '',
	error,
	isLoading = false,
	onRetry,
}: ErrorPlaceholderProps ): JSX.Element => (
	<Placeholder
		icon={ <Icon icon={ warning } /> }
		label={ __( 'Sorry, an error occurred', 'poocommerce' ) }
		className={ clsx( 'wc-block-api-error', className ) }
	>
		<ErrorMessage error={ error } />
		{ onRetry && (
			<>
				{ isLoading ? (
					<Spinner />
				) : (
					<Button variant="secondary" onClick={ onRetry }>
						{ __( 'Retry', 'poocommerce' ) }
					</Button>
				) }
			</>
		) }
	</Placeholder>
);

export default ErrorPlaceholder;
