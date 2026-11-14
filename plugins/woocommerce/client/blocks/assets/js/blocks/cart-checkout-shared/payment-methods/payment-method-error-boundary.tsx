/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import type { ReactNode } from 'react';
import { CURRENT_USER_IS_ADMIN } from '@poocommerce/settings';
import { StoreNoticesContainer } from '@poocommerce/blocks-components';
import { noticeContexts } from '@poocommerce/base-context';
import { NoticeType } from '@poocommerce/types';
import {
	DerivedStateReturn,
	ReactError,
} from '@poocommerce/base-components/block-error-boundary/types';

interface PaymentMethodErrorBoundaryProps {
	isEditor: boolean;
	children: ReactNode;
	/**
	 * Rendered instead of the default error notice when a child throws. Pass `null` to render nothing.
	 */
	fallback?: ReactNode;
}

class PaymentMethodErrorBoundary extends Component< PaymentMethodErrorBoundaryProps > {
	state = { errorMessage: '', hasError: false };
	static getDerivedStateFromError( error: ReactError ): DerivedStateReturn {
		return {
			errorMessage: error.message,
			hasError: true,
		};
	}

	render() {
		const { hasError, errorMessage } = this.state;
		const { isEditor, fallback } = this.props;

		if ( hasError ) {
			if ( fallback !== undefined ) {
				return fallback;
			}
			let errorText = __(
				'We are experiencing difficulties with this payment method. Please contact us for assistance.',
				'poocommerce'
			);
			if ( isEditor || CURRENT_USER_IS_ADMIN ) {
				if ( errorMessage ) {
					errorText = errorMessage;
				} else {
					errorText = __(
						"There was an error with this payment method. Please verify it's configured correctly.",
						'poocommerce'
					);
				}
			}
			const notices: NoticeType[] = [
				{
					id: '0',
					content: errorText,
					isDismissible: false,
					status: 'error',
				},
			];
			return (
				<StoreNoticesContainer
					additionalNotices={ notices }
					context={ noticeContexts.PAYMENTS }
				/>
			);
		}

		return this.props.children;
	}
}
export default PaymentMethodErrorBoundary;
