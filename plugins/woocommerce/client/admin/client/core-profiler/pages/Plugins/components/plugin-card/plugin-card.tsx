/**
 * External dependencies
 */
import { CheckboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { Extension } from '@poocommerce/data';
import { Link } from '@poocommerce/components';
import React from 'react';

/**
 * Internal dependencies
 */
import sanitizeHTML from '~/lib/sanitize-html';
import './plugin-card.scss';

export const PluginCard = ( {
	plugin: {
		is_activated: installed = false,
		image_url: imageUrl,
		key: pluginKey,
		label: title,
		description,
		learn_more_link: learnMoreLinkUrl,
	},
	onChange = () => {},
	disabled = false,
	checked = false,
	children,
}: {
	plugin: Pick<
		Extension,
		| 'is_activated'
		| 'image_url'
		| 'key'
		| 'label'
		| 'description'
		| 'learn_more_link'
	>;
	installed?: boolean;
	onChange?: ( arg0: unknown ) => void;
	disabled?: boolean;
	checked?: boolean;
	children?: React.ReactNode;
} ) => {
	let learnMoreLink = null;
	const slug = pluginKey.replace( ':alt', '' );
	React.Children.forEach( children, ( child ) => {
		if (
			React.isValidElement( child ) &&
			child.type === PluginCard.LearnMoreLink
		) {
			learnMoreLink = React.cloneElement( child, {
				// @ts-expect-error -- @types/react is deficient here
				learnMoreLink: learnMoreLinkUrl,
			} );
		}
	} );
	return (
		<div
			className={ clsx( 'poocommerce-profiler-plugins-plugin-card', {
				'is-installed': installed,
				disabled,
			} ) }
			data-slug={ slug }
		>
			<label htmlFor={ `${ pluginKey }-checkbox` }>
				{ /* this label element acts as the catchment area for the checkbox */ }
				<div className="poocommerce-profiler-plugin-card-top">
					{ ! installed && (
						<CheckboxControl
							id={ `${ pluginKey }-checkbox` }
							className="core-profiler__checkbox"
							disabled={ disabled }
							checked={ checked }
							onChange={ ( event ) => {
								if ( ! disabled ) {
									onChange( event );
								}
							} }
						/>
					) }
					{ imageUrl ? (
						<img src={ imageUrl } alt={ pluginKey } />
					) : null }
					<div
						className={ clsx(
							'poocommerce-profiler-plugins-plugin-card-text-header',
							{
								installed,
							}
						) }
					>
						<h3>{ title }</h3>
						{ installed && (
							<span>{ __( 'Installed', 'poocommerce' ) }</span>
						) }
					</div>
				</div>

				<div
					className={ clsx(
						'poocommerce-profiler-plugins-plugin-card-text',
						{ 'smaller-margin-left': installed }
					) }
				>
					<p
						dangerouslySetInnerHTML={ sanitizeHTML( description ) }
					/>
					{ learnMoreLink }
				</div>
			</label>
		</div>
	);
};

PluginCard.LearnMoreLink = ( {
	learnMoreLink,
	onClick,
}: {
	learnMoreLink?: Extension[ 'learn_more_link' ];
	onClick?: React.MouseEventHandler< HTMLAnchorElement >;
} ) => (
	<Link
		onClick={ ( event ) => {
			if ( typeof onClick === 'function' ) {
				onClick( event );
			}
		} }
		href={ learnMoreLink ?? '' }
		target="_blank"
		type="external"
	>
		{ __( 'Learn More', 'poocommerce' ) }
	</Link>
);
