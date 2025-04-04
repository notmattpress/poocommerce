/**
 * External dependencies
 */
import { Slot, Fill, MenuItem, MenuGroup } from '@wordpress/components';
import { Children, createElement, Fragment } from '@wordpress/element';
import {
	createOrderedChildren,
	sortFillsByOrder,
} from '@poocommerce/components';

/**
 * Internal dependencies
 */
import { MenuItemProps, VariationQuickUpdateSlotProps } from './types';
import {
	MULTIPLE_UPDATE,
	SINGLE_UPDATE,
	VARIATION_ACTIONS_SLOT_NAME,
} from './constants';

const DEFAULT_ORDER = 20;
const TOP_LEVEL_MENU = 'top-level';

export const getGroupName = (
	group?: string,
	isMultipleSelection?: boolean
) => {
	const nameSuffix = isMultipleSelection
		? `_${ MULTIPLE_UPDATE }`
		: `_${ SINGLE_UPDATE }`;
	return group
		? `${ VARIATION_ACTIONS_SLOT_NAME }_${ group }${ nameSuffix }`
		: VARIATION_ACTIONS_SLOT_NAME;
};

export const VariationQuickUpdateMenuItem = ( {
	children,
	order = DEFAULT_ORDER,
	group = TOP_LEVEL_MENU,
	supportsMultipleSelection,
	onClick = () => {},
	...props
}: MenuItemProps ) => {
	const createFill = ( updateType: string ) => (
		<Fill
			key={ updateType }
			name={ getGroupName( group, updateType === MULTIPLE_UPDATE ) }
		>
			{ ( fillProps ) => {
				return createOrderedChildren(
					<MenuItem
						{ ...props }
						onClick={ () => {
							const { selection, onChange, onClose } = fillProps;
							onClick( {
								selection: Array.isArray( selection )
									? selection
									: [ selection ],
								onChange,
								onClose,
							} );
						} }
					>
						{ children }
					</MenuItem>,
					order,
					fillProps
				);
			} }
		</Fill>
	);

	const fills = supportsMultipleSelection
		? [ MULTIPLE_UPDATE, SINGLE_UPDATE ].map( createFill )
		: createFill( SINGLE_UPDATE );
	return <>{ fills }</>;
};

VariationQuickUpdateMenuItem.Slot = ( {
	fillProps,
	group = TOP_LEVEL_MENU,
	onChange,
	onClose,
	selection,
	supportsMultipleSelection,
}: VariationQuickUpdateSlotProps & {
	fillProps?: React.ComponentProps< typeof Slot >[ 'fillProps' ];
} ) => {
	return (
		<Slot
			name={ getGroupName( group, supportsMultipleSelection ) }
			fillProps={ { ...fillProps, onChange, onClose, selection } }
		>
			{ ( fills ) => {
				if (
					! sortFillsByOrder ||
					( fills && Children.count( fills ) === 0 )
				) {
					return null;
				}

				return <MenuGroup>{ sortFillsByOrder( fills ) }</MenuGroup>;
			} }
		</Slot>
	);
};
