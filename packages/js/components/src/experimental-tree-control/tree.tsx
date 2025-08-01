/**
 * External dependencies
 */
import { Button, Icon } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import { createElement, forwardRef, Fragment, useRef } from 'react';
import { plus } from '@wordpress/icons';
import { useMergeRefs } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { useTree } from './hooks/use-tree';
import { TreeItem } from './tree-item';
import { TreeProps } from './types';
import { countNumberOfNodes } from './linked-tree-utils';

export const Tree = forwardRef( function ForwardedTree(
	props: TreeProps,
	forwardedRef: React.ForwardedRef< HTMLOListElement >
) {
	const rootListRef = useRef< HTMLOListElement >( null );
	const ref = useMergeRefs( [ rootListRef, forwardedRef ] );

	const { level, items, treeProps, treeItemProps } = useTree( {
		...props,
		ref,
	} );

	const numberOfItems = countNumberOfNodes( items );

	const isCreateButtonVisible =
		props.shouldShowCreateButton &&
		props.shouldShowCreateButton( props.createValue );

	return (
		<>
			{ items.length || isCreateButtonVisible ? (
				<ol
					{ ...treeProps }
					className={ clsx(
						treeProps.className,
						'experimental-poocommerce-tree',
						`experimental-poocommerce-tree--level-${ level }`
					) }
				>
					{ items.map( ( child, index ) => (
						<TreeItem
							{ ...treeItemProps }
							isHighlighted={
								props.highlightedIndex === child.index
							}
							onExpand={ props.onExpand }
							highlightedIndex={ props.highlightedIndex }
							isExpanded={ child.data.isExpanded }
							key={ child.data.value }
							item={ child }
							index={ index }
							// Button ref is not working, so need to use CSS directly
							onLastItemLoop={ () => {
								(
									rootListRef.current
										?.closest( 'ol[role="listbox"]' )
										?.parentElement?.querySelector(
											'.experimental-poocommerce-tree__button'
										) as HTMLButtonElement
								 )?.focus();
							} }
							onFirstItemLoop={ props.onFirstItemLoop }
							onEscape={ props.onEscape }
						/>
					) ) }
				</ol>
			) : null }
			{ isCreateButtonVisible && (
				<Button
					id={
						'poocommerce-experimental-tree-control__menu-item-' +
						numberOfItems
					}
					className={ clsx( 'experimental-poocommerce-tree__button', {
						'experimental-poocommerce-tree__button--highlighted':
							props.highlightedIndex === numberOfItems,
					} ) }
					onClick={ () => {
						if ( props.onCreateNew ) {
							props.onCreateNew();
						}
						if ( props.onTreeBlur ) {
							props.onTreeBlur();
						}
					} }
					// Component's event type definition is not working
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					onKeyDown={ ( event: any ) => {
						if (
							event.key === 'ArrowUp' ||
							event.key === 'ArrowDown'
						) {
							event.preventDefault();
							if ( event.key === 'ArrowUp' ) {
								const allHeadings =
									event.nativeEvent.srcElement.previousSibling.querySelectorAll(
										'.experimental-poocommerce-tree-item > .experimental-poocommerce-tree-item__heading'
									);

								allHeadings[ allHeadings.length - 1 ]
									?.querySelector(
										'.experimental-poocommerce-tree-item__label'
									)
									?.focus();
							}
						} else if ( event.key === 'Escape' && props.onEscape ) {
							event.preventDefault();
							props.onEscape();
						}
					} }
				>
					<Icon icon={ plus } size={ 20 } />
					{ props.createValue
						? sprintf(
								/* translators: %s: create value */
								__( 'Create "%s"', 'poocommerce' ),
								props.createValue
						  )
						: __( 'Create new', 'poocommerce' ) }
				</Button>
			) }
		</>
	);
} );
