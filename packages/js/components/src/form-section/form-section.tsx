/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import classnames from 'classnames';

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
		<div className={ classnames( 'poocommerce-form-section', className ) }>
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
