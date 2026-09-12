/**
 * External dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import { Disabled } from '@wordpress/components';
import { __, _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';

const Edit = (): JSX.Element => {
	const blockProps = useBlockProps( {
		className: 'wc-block-order-confirmation-downloads',
	} );

	const {
		borderBottomColor,
		borderLeftColor,
		borderRightColor,
		borderTopColor,
		borderWidth,
	} = blockProps.style;

	const borderStyles = {
		borderBottomColor,
		borderLeftColor,
		borderRightColor,
		borderTopColor,
		borderWidth,
	} as React.CSSProperties;

	return (
		<div { ...blockProps }>
			<Disabled>
				<table
					style={ borderStyles }
					cellSpacing="0"
					className="wc-block-order-confirmation-downloads__table"
				>
					<thead>
						<tr>
							<th className="download-product">
								<span className="nobr">
									{ __( 'Product', 'poocommerce' ) }
								</span>
							</th>
							<th className="download-remaining">
								<span className="nobr">
									{ __(
										'Downloads remaining',
										'poocommerce'
									) }
								</span>
							</th>
							<th className="download-expires">
								<span className="nobr">
									{ __( 'Expires', 'poocommerce' ) }
								</span>
							</th>
							<th className="download-file">
								<span className="nobr">
									{ __( 'Download', 'poocommerce' ) }
								</span>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td
								className="download-product"
								data-title="Product"
							>
								<a href="https://example.com">
									{ _x(
										'Test Product',
										'sample product name',
										'poocommerce'
									) }
								</a>
							</td>
							<td
								className="download-remaining"
								data-title="Downloads remaining"
							>
								{ _x(
									'∞',
									'infinite downloads remaining',
									'poocommerce'
								) }
							</td>
							<td
								className="download-expires"
								data-title="Expires"
							>
								{ _x(
									'Never',
									'download expires',
									'poocommerce'
								) }
							</td>
							<td className="download-file" data-title="Download">
								<a
									href="https://example.com"
									className="poocommerce-MyAccount-downloads-file button alt"
								>
									{ _x(
										'Test Download',
										'sample download name',
										'poocommerce'
									) }
								</a>
							</td>
						</tr>
					</tbody>
				</table>
			</Disabled>
		</div>
	);
};

export default Edit;
