/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { TabPanel } from './tab-panel';

export function HelpTabPanel( { isSelected }: { isSelected: boolean } ) {
	return (
		<TabPanel isSelected={ isSelected }>
			<div className="poocommerce-product-editor-dev-tools-help">
				<p>
					{ __(
						'For help with PooCommerce product editor development, the following resources are available.',
						'poocommerce'
					) }
				</p>
				<ul>
					<li>
						<a
							href="https://github.com/poocommerce/poocommerce/tree/trunk/docs/product-editor-development"
							target="_blank"
							rel="noreferrer"
						>
							{ __(
								'Product Editor Development Handbook',
								'poocommerce'
							) }
						</a>
					</li>
					<li>
						<a
							href="https://github.com/poocommerce/poocommerce/discussions/categories/poocommerce-product-block-editor"
							target="_blank"
							rel="noreferrer"
						>
							{ __(
								'Product Editor Discussion on GitHub',
								'poocommerce'
							) }
						</a>
					</li>
					<li>
						<a
							href="https://poocommerce.com/community-slack/"
							target="_blank"
							rel="noreferrer"
						>
							{ __(
								'PooCommerce Community Slack, in the #developers channel',
								'poocommerce'
							) }
						</a>
					</li>
				</ul>
			</div>
		</TabPanel>
	);
}
