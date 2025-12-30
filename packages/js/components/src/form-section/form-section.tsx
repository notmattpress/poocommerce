/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import clsx from 'clsx';

type FormSectionProps = {
	title: JSX.Element | string;
	description: JSX.Element | string;
	className?: string;
};

export const FormSection = ( {
	title,
	description,
	className,
	children,
}: React.PropsWithChildren< FormSectionProps > ) => {
	return (
		<div className={ clsx( 'poocommerce-form-section', className ) }>
			<div className="poocommerce-form-section__header">
				<h3 className="poocommerce-form-section__title">{ title }</h3>
				<div className="poocommerce-form-section__description">
					{ description }
				</div>
			</div>
			<div className="poocommerce-form-section__content">
				{ children }
			</div>
		</div>
	);
};
