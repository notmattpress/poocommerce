/**
 * External dependencies
 */
import { productsStore } from '@poocommerce/data';
import { DataForm, isItemValid } from '@wordpress/dataviews';
import type { Form } from '@wordpress/dataviews';
import { createElement, useState, useMemo } from '@wordpress/element';
import { FormEvent } from 'react';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import clsx from 'clsx';
import {
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	FlexItem,
	Button,
} from '@wordpress/components';
// @ts-expect-error missing types.
// eslint-disable-next-line @poocommerce/dependency-group
import { privateApis as editorPrivateApis } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import { productFields } from '../product-list/fields';

const { NavigableRegion } = unlock( editorPrivateApis );

const form: Form = {
	type: 'panel',
	fields: [ 'name', 'status' ],
};

type ProductEditProps = {
	subTitle?: string;
	className?: string;
	hideTitleFromUI?: boolean;
	actions?: React.JSX.Element;
	postType: string;
	postId: string;
};

export default function ProductEdit( {
	subTitle,
	actions,
	className,
	hideTitleFromUI = true,
	postType,
	postId = '',
}: ProductEditProps ) {
	const classes = clsx( 'edit-product-page', className, {
		'is-empty': ! postId,
	} );
	const ids = useMemo( () => postId.split( ',' ), [ postId ] );
	const { initialEdits } = useSelect(
		( select ) => {
			return {
				initialEdits:
					ids.length === 1
						? select( productsStore ).getProduct(
								Number.parseInt( ids[ 0 ], 10 )
						  )
						: null,
			};
		},
		[ postType, ids ]
	);
	const [ edits, setEdits ] = useState( {} );
	const itemWithEdits = useMemo( () => {
		return {
			...initialEdits,
			...edits,
		};
	}, [ initialEdits, edits ] );
	const isUpdateDisabled = ! isItemValid(
		itemWithEdits,
		// @ts-expect-error productFields is not typed correctly.
		productFields,
		form
	);

	const onSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		// @ts-expect-error productFields is not typed correctly.
		if ( ! isItemValid( itemWithEdits, productFields, form ) ) {
			return;
		}
		// Empty save.

		setEdits( {} );
	};

	return (
		<NavigableRegion
			className={ classes }
			ariaLabel={ __( 'Product Edit', 'poocommerce' ) }
		>
			<div className="edit-product-content">
				{ ! hideTitleFromUI && (
					<VStack
						className="edit-site-page-header"
						as="header"
						spacing={ 0 }
					>
						<HStack className="edit-site-page-header__page-title">
							<Heading
								as="h2"
								level={ 3 }
								weight={ 500 }
								className="edit-site-page-header__title"
								truncate
							>
								{ __( 'Product Edit', 'poocommerce' ) }
							</Heading>
							<FlexItem className="edit-site-page-header__actions">
								{ actions }
							</FlexItem>
						</HStack>
						{ subTitle && (
							<Text
								variant="muted"
								as="p"
								className="edit-site-page-header__sub-title"
							>
								{ subTitle }
							</Text>
						) }
					</VStack>
				) }
				{ ! postId && (
					<p>{ __( 'Select a product to edit', 'poocommerce' ) }</p>
				) }
				{ postId && (
					<VStack spacing={ 4 } as="form" onSubmit={ onSubmit }>
						<DataForm
							data={ itemWithEdits }
							// @ts-expect-error productFields is not typed correctly.
							fields={ productFields }
							form={ form }
							onChange={ setEdits }
						/>
						<FlexItem>
							<Button
								variant="primary"
								type="submit"
								// @ts-expect-error missing type.
								accessibleWhenDisabled
								disabled={ isUpdateDisabled }
								__next40pxDefaultSize
							>
								{ __( 'Update', 'poocommerce' ) }
							</Button>
						</FlexItem>
					</VStack>
				) }
			</div>
		</NavigableRegion>
	);
}
