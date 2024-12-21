/**
 * External dependencies
 */
/* eslint-disable @poocommerce/dependency-group */
import { createElement } from '@wordpress/element';
import {
	// @ts-expect-error missing types.
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { sanitize } from 'dompurify';
/* eslint-enable @poocommerce/dependency-group */

/**
 * Internal dependencies
 */
import { SettingsItem } from '../settings-item';

const ALLOWED_TAGS = [ 'a', 'b', 'em', 'i', 'strong', 'p', 'br' ];
const ALLOWED_ATTR = [ 'target', 'href', 'rel', 'name', 'download' ];

export const SettingsGroup = ( { group }: { group: SettingsGroup } ) => {
	const sanitizeHTML = ( html: string ) => {
		return {
			__html: sanitize( html, { ALLOWED_TAGS, ALLOWED_ATTR } ),
		};
	};
	return (
		<fieldset className="poocommerce-settings-group">
			<div className="poocommerce-settings-group-title">
				<Heading level={ 4 }>{ group.title }</Heading>
				<legend
					dangerouslySetInnerHTML={ sanitizeHTML( group.desc ) }
				/>
			</div>
			<div className="poocommerce-settings-group-content">
				{ group.settings.map( ( setting ) => {
					const key =
						setting.id +
						'-' +
						( setting.title ?? '' ).replace( /\s+/g, '-' ) +
						'-' +
						setting.type +
						'-group';
					return <SettingsItem key={ key } setting={ setting } />;
				} ) }
			</div>
		</fieldset>
	);
};
