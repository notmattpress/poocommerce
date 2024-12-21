/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';

type PlaceholderProps = {
	className: string;
};

const InboxNotePlaceholder: React.FC< PlaceholderProps > = ( {
	className,
} ) => {
	return (
		<div
			className={ `poocommerce-inbox-message is-placeholder ${ className }` }
			aria-hidden
		>
			<div className="poocommerce-inbox-message__wrapper">
				<div className="poocommerce-inbox-message__content">
					<div className="poocommerce-inbox-message__date">
						<div className="sixth-line" />
					</div>
					<div className="poocommerce-inbox-message__title">
						<div className="line" />
						<div className="line" />
					</div>
					<div className="poocommerce-inbox-message__text">
						<div className="line" />
						<div className="third-line" />
					</div>
				</div>
				<div className="poocommerce-inbox-message__actions">
					<div className="fifth-line" />
					<div className="fifth-line" />
				</div>
			</div>
		</div>
	);
};

export { InboxNotePlaceholder };
