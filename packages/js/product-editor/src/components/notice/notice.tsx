/**
 * External dependencies
 */
import { ReactNode } from 'react';
import { createElement } from '@wordpress/element';
import classNames from 'classnames';
import { Button } from '@wordpress/components';
import { closeSmall } from '@wordpress/icons';

export type NoticeProps = {
	title?: string;
	content?: string | ReactNode;
	className?: string;
	type?: 'error-type' | 'success' | 'warning' | 'info';
	children?: ReactNode;
	isDismissible?: boolean;
	handleDismiss?: () => void;
};

export function Notice( {
	title = '',
	content = '',
	className,
	type = 'info',
	children,
	isDismissible = false,
	handleDismiss = () => {},
}: NoticeProps ) {
	return (
		<div
			className={ classNames(
				className,
				type,
				'poocommerce-product-notice',
				{
					'is-dismissible': isDismissible,
				}
			) }
		>
			{ title && (
				<h3 className="poocommerce-product-notice__title">{ title }</h3>
			) }
			{ content && (
				<p className="poocommerce-product-notice__content">
					{ content }
				</p>
			) }
			<div className="poocommerce-product-notice__content">
				{ children }
			</div>
			{ isDismissible && (
				<Button
					className="poocommerce-product-notice__dismiss"
					icon={ closeSmall }
					onClick={ handleDismiss }
				/>
			) }
		</div>
	);
}
