/**
 * External dependencies
 */
import { Button, CheckboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';
import classNames from 'classnames';
import { createElement, forwardRef } from 'react';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies
 */
import { useTreeItem } from './hooks/use-tree-item';
import { Tree } from './tree';
import { TreeItemProps } from './types';

export const TreeItem = forwardRef( function ForwardedTreeItem(
	props: TreeItemProps,
	ref: React.ForwardedRef< HTMLLIElement >
) {
	const {
		item,
		treeItemProps,
		headingProps,
		treeProps,
		selection,
		getLabel,
	} = useTreeItem( {
		...props,
		ref,
	} );

	function handleKeyDown( event: React.KeyboardEvent< HTMLElement > ) {
		if ( event.key === 'Escape' && props.onEscape ) {
			event.preventDefault();
			props.onEscape();
		} else if ( event.key === 'ArrowLeft' ) {
			if ( item.index !== undefined ) {
				props.onExpand?.( item.index, false );
			}
		} else if ( event.key === 'ArrowRight' ) {
			if ( item.index !== undefined ) {
				props.onExpand?.( item.index, true );
			}
		}
	}

	return (
		<li
			{ ...treeItemProps }
			className={ classNames(
				treeItemProps.className,
				'experimental-poocommerce-tree-item',
				{
					'experimental-poocommerce-tree-item--highlighted':
						props.isHighlighted,
				}
			) }
		>
			<div
				{ ...headingProps }
				className="experimental-poocommerce-tree-item__heading"
			>
				{ /* eslint-disable-next-line jsx-a11y/label-has-for, jsx-a11y/label-has-associated-control */ }
				<label className="experimental-poocommerce-tree-item__label">
					{ selection.multiple ? (
						<CheckboxControl
							indeterminate={
								selection.checkedStatus === 'indeterminate'
							}
							checked={ selection.checkedStatus === 'checked' }
							onChange={ selection.onSelectChild }
							onKeyDown={ handleKeyDown }
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore __nextHasNoMarginBottom is a valid prop
							__nextHasNoMarginBottom={ true }
						/>
					) : (
						<input
							type="checkbox"
							className="experimental-poocommerce-tree-item__checkbox"
							checked={ selection.checkedStatus === 'checked' }
							onChange={ ( event ) =>
								selection.onSelectChild( event.target.checked )
							}
							onKeyDown={ handleKeyDown }
						/>
					) }

					{ typeof getLabel === 'function' ? (
						getLabel( item )
					) : (
						<span>{ decodeEntities( item.data.label ) }</span>
					) }
				</label>

				{ Boolean( item.children?.length ) && (
					<div className="experimental-poocommerce-tree-item__expander">
						<Button
							icon={
								item.data.isExpanded ? chevronUp : chevronDown
							}
							onClick={ () => {
								if ( item.index !== undefined ) {
									props.onExpand?.(
										item.index,
										! item.data.isExpanded
									);
								}
							} }
							onKeyDown={ handleKeyDown }
							className="experimental-poocommerce-tree-item__expander"
							aria-label={
								item.data.isExpanded
									? __( 'Collapse', 'poocommerce' )
									: __( 'Expand', 'poocommerce' )
							}
						/>
					</div>
				) }
			</div>

			{ Boolean( item.children.length ) && item.data.isExpanded && (
				<Tree
					{ ...treeProps }
					highlightedIndex={ props.highlightedIndex }
					onExpand={ props.onExpand }
					onEscape={ props.onEscape }
				/>
			) }
		</li>
	);
} );
