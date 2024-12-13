/**
 * External dependencies
 */
import { Component, ReactNode, ErrorInfo } from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { captureException } from '@poocommerce/remote-logging';
import { bumpStat } from '@poocommerce/tracks';
/**
 * Internal dependencies
 */
import './style.scss';

type ErrorBoundaryProps = {
	children: ReactNode;
};

type ErrorBoundaryState = {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
};

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor( props: ErrorBoundaryProps ) {
		super( props );
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(
		error: Error
	): Partial< ErrorBoundaryState > {
		return { hasError: true, error };
	}

	componentDidCatch( error: Error, errorInfo: ErrorInfo ) {
		this.setState( { errorInfo } );

		bumpStat( 'error', 'unhandled-js-error-during-render' );

		// Limit the component stack to 10 calls so we don't send too much data.
		const componentStack = errorInfo.componentStack
			.trim()
			.split( '\n' )
			.slice( 0, 10 )
			.map( ( line ) => line.trim() );

		captureException( error, {
			severity: 'critical',
			extra: {
				componentStack,
			},
		} );
	}

	handleRefresh = () => {
		window.location.reload();
	};

	handleOpenSupport = () => {
		window.open(
			'https://wordpress.org/support/plugin/poocommerce/',
			'_blank'
		);
	};

	render() {
		if ( this.state.hasError ) {
			return (
				<div className="poocommerce-global-error-boundary">
					<h1 className="poocommerce-global-error-boundary__heading">
						{ __( 'Oops, something went wrong', 'poocommerce' ) }
					</h1>
					<p className="poocommerce-global-error-boundary__subheading">
						{ __(
							'We’re sorry for the inconvenience. Please try reloading the page, or you can get support from the community forums.',
							'poocommerce'
						) }
					</p>
					<div className="poocommerce-global-error-boundary__actions">
						<Button
							variant="secondary"
							onClick={ this.handleOpenSupport }
						>
							{ __( 'Get Support', 'poocommerce' ) }
						</Button>
						<Button
							variant="primary"
							onClick={ this.handleRefresh }
						>
							{ __( 'Reload Page', 'poocommerce' ) }
						</Button>
					</div>
					<details className="poocommerce-global-error-boundary__details">
						<summary>
							{ __( 'Click for error details', 'poocommerce' ) }
						</summary>
						<div className="poocommerce-global-error-boundary__details-content">
							<strong className="poocommerce-global-error-boundary__error">
								{ this.state.error &&
									this.state.error.toString() }
							</strong>
							<p>
								{ this.state.errorInfo &&
									this.state.errorInfo.componentStack }
							</p>
						</div>
					</details>
				</div>
			);
		}

		return this.props.children;
	}
}
