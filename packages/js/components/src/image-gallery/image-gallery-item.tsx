/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { createElement, Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Pill from '../pill';
import { SortableHandle, NonSortableItem } from '../sortable';
import { ConditionalWrapper } from '../conditional-wrapper';

export type ImageGalleryItemProps = {
	id?: string;
	alt: string;
	isCover?: boolean;
	isDraggable?: boolean;
	src: string;
	displayToolbar?: boolean;
	className?: string;
	onClick?: () => void;
	children?: JSX.Element;
} & React.HTMLAttributes< HTMLDivElement >;

export const ImageGalleryItem = ( {
	id,
	alt,
	isCover = false,
	isDraggable = true,
	src,
	className = '',
	onClick = () => null,
	onBlur = () => null,
	children,
}: ImageGalleryItemProps ) => (
	<ConditionalWrapper
		condition={ ! isDraggable }
		wrapper={ ( wrappedChildren ) => (
			<NonSortableItem>{ wrappedChildren }</NonSortableItem>
		) }
	>
		<div
			className={ `poocommerce-image-gallery__item ${ className }` }
			onKeyPress={ () => {} }
			tabIndex={ 0 }
			role="button"
			onClick={ ( event ) => onClick( event ) }
			onBlur={ ( event ) => onBlur( event ) }
		>
			{ children }

			{ isDraggable ? (
				<SortableHandle>
					<img alt={ alt } src={ src } id={ id } />
				</SortableHandle>
			) : (
				<>
					{ isCover && <Pill>{ __( 'Cover', 'poocommerce' ) }</Pill> }
					<img alt={ alt } src={ src } id={ id } />
				</>
			) }
		</div>
	</ConditionalWrapper>
);
