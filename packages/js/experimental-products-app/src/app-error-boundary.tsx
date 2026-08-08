/**
 * External dependencies
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { EmptyState, Stack } from '@wordpress/ui';

/**
 * Internal dependencies
 */
import { FEEDBACK_URL, GITHUB_ISSUES_URL } from './constants';

type AppErrorBoundaryProps = {
	children: ReactNode;
};

type AppErrorBoundaryState = {
	error: Error | null;
	hasError: boolean;
};

export class AppErrorBoundary extends Component<
	AppErrorBoundaryProps,
	AppErrorBoundaryState
> {
	state: AppErrorBoundaryState = {
		error: null,
		hasError: false,
	};

	static getDerivedStateFromError(
		error: Error
	): Partial< AppErrorBoundaryState > {
		return {
			error,
			hasError: true,
		};
	}

	componentDidCatch( error: Error, errorInfo: ErrorInfo ) {
		// eslint-disable-next-line no-console
		console.error( error, errorInfo );
	}

	handleReload = () => {
		window.location.reload();
	};

	render() {
		if ( this.state.hasError ) {
			return (
				<EmptyState.Root className="poocommerce-experimental-products-app-error">
					<EmptyState.Title>
						{ __(
							'Oops, the experimental products experience ran into a problem',
							'poocommerce'
						) }
					</EmptyState.Title>
					<EmptyState.Description className="poocommerce-experimental-products-app-error__description">
						{ __(
							'This experience is still experimental. Please report the issue on GitHub or share feedback in the survey so we can improve it.',
							'poocommerce'
						) }
					</EmptyState.Description>
					<EmptyState.Actions>
						<Stack direction="row" gap="xs" justify="center">
							<Button
								href={ GITHUB_ISSUES_URL }
								target="_blank"
								rel="noopener noreferrer"
								variant="primary"
							>
								{ __(
									'Report an issue on GitHub',
									'poocommerce'
								) }
							</Button>
							<Button
								href={ FEEDBACK_URL }
								target="_blank"
								rel="noopener noreferrer"
								variant="secondary"
							>
								{ __(
									'Share feedback in survey',
									'poocommerce'
								) }
							</Button>
							<Button
								onClick={ this.handleReload }
								variant="secondary"
							>
								{ __( 'Reload page', 'poocommerce' ) }
							</Button>
						</Stack>
					</EmptyState.Actions>
				</EmptyState.Root>
			);
		}

		return this.props.children;
	}
}
