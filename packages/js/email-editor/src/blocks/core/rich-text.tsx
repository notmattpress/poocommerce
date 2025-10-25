/**
 * External dependencies
 */
import {
	applyFormat,
	insert,
	create,
	toHTMLString,
} from '@wordpress/rich-text';
import { __ } from '@wordpress/i18n';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { createHigherOrderComponent } from '@wordpress/compose';
import * as React from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	getCursorPosition,
	replacePersonalizationTagsWithHTMLComments,
} from '../../components/personalization-tags/rich-text-utils';
import { PersonalizationTagsModal } from '../../components/personalization-tags/personalization-tags-modal';
import { storeName } from '../../store';
import { PersonalizationTagsPopover } from '../../components/personalization-tags/personalization-tags-popover';
import { PersonalizationTagsLinkPopover } from '../../components/personalization-tags/personalization-tags-link-popover';
import { recordEvent } from '../../events';
import {
	registerFormatForEmail,
	unregisterFormatForEmail,
} from '../../config-tools/formats';
import { addFilterForEmail } from '../../config-tools/filters';

/**
 * Disable Rich text formats we currently cannot support
 * Note: This will remove its support for all blocks in the email editor e.g., p, h1,h2, etc
 */
function disableCertainRichTextFormats() {
	// Format types to disable
	const formatTypesToDisable = [
		'core/image', // remove support for inline image - We can't use it
		'core/code', // remove support for Inline code - Not well formatted
		'core/language', // remove support for Language - Not supported for now
	];

	// Unregister each format type and preserve its definition
	formatTypesToDisable.forEach( ( formatName ) => {
		unregisterFormatForEmail( formatName );
	} );
}

type Props = {
	contentRef: React.RefObject< HTMLElement >;
};

/**
 * A button to the rich text editor to open modal with registered personalization tags.
 *
 * @param root0
 * @param root0.contentRef
 */
function PersonalizationTagsButton( { contentRef }: Props ) {
	const [ isModalOpened, setIsModalOpened ] = useState( false );
	const selectedBlockId = useSelect( ( select ) =>
		select( 'core/block-editor' ).getSelectedBlockClientId()
	);

	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );

	// Get the current block attributes
	const blockAttributes: object = useSelect( ( select ) => {
		const attributes =
			select( 'core/block-editor' ).getBlockAttributes( selectedBlockId );

		return attributes;
	} );

	// Some blocks, such as the Button block, store the content in `text` attribute.
	const blockContentKey = 'text' in blockAttributes ? 'text' : 'content';

	// After first saving the content does not have property originalHTML, so we need to check for content as well
	const blockContent =
		blockAttributes?.[ blockContentKey ]?.originalHTML ||
		blockAttributes?.[ blockContentKey ] ||
		'';

	const handleInsert = useCallback(
		( tag: string, linkText: string | null ) => {
			let { start, end } = getCursorPosition( contentRef, blockContent );

			let updatedContent = '';
			// When we pass linkText, we want to insert the tag as a link
			if ( linkText ) {
				let richTextValue = create( { html: blockContent } );

				// Insert the new text into the current selection or at the cursor
				richTextValue = insert( richTextValue, linkText, start, end );

				end = start + linkText.length;
				// The link is inserted via registered format type to avoid breaking the content
				richTextValue = applyFormat(
					richTextValue,
					{
						type: 'poocommerce-email-editor/link-shortcode',
						// @ts-expect-error attributes property is missing in build type for WPFormat type
						attributes: {
							'data-link-href': tag,
							contenteditable: 'false',
							style: 'text-decoration: underline;',
						},
					},
					start,
					end
				);
				updatedContent = toHTMLString( { value: richTextValue } );
			} else {
				let richTextValue = create( { html: blockContent } );
				richTextValue = insert(
					richTextValue,
					create( { html: `<!--${ tag }-->&nbsp;` } ), // Add a non-breaking space to avoid an issue when WP renderer removes blog containing only a comment
					start,
					end
				);
				updatedContent = toHTMLString( { value: richTextValue } );
			}

			updateBlockAttributes( selectedBlockId, {
				[ blockContentKey ]: updatedContent,
			} );
		},
		[
			blockContent,
			blockContentKey,
			contentRef,
			selectedBlockId,
			updateBlockAttributes,
		]
	);

	return (
		<BlockControls>
			<ToolbarGroup>
				<ToolbarButton
					icon="shortcode"
					title={ __( 'Personalization Tags', 'poocommerce' ) }
					onClick={ () => {
						setIsModalOpened( true );
						recordEvent(
							'block_controls_personalization_tags_button_clicked'
						);
					} }
				/>
				<PersonalizationTagsPopover
					contentRef={ contentRef }
					onUpdate={ ( originalTag, updatedTag ) => {
						// When we update the tag, we need to add brackets to the tag, because the popover removes them
						const updatedContent = blockContent.replace(
							`<!--[${ originalTag }]-->`,
							`<!--[${ updatedTag }]-->`
						);
						updateBlockAttributes( selectedBlockId, {
							[ blockContentKey ]: updatedContent,
						} );
					} }
				/>
				<PersonalizationTagsLinkPopover
					contentRef={ contentRef }
					onUpdate={ ( htmlElement, newTag, newText ) => {
						const oldTag = htmlElement
							.getAttribute( 'data-link-href' )
							.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
						const regex = new RegExp(
							`<a([^>]*?)data-link-href="${ oldTag }"([^>]*?)>${ htmlElement.textContent }</a>`,
							'gi'
						);

						// Replace the matched link with the new link
						const updatedContent = blockContent.replace(
							regex,
							( _, beforeAttrs, afterAttrs ) => {
								// Construct the new <a> tag
								return `<a${ beforeAttrs }data-link-href="${ newTag }"${ afterAttrs }>${ newText }</a>`;
							}
						);
						updateBlockAttributes( selectedBlockId, {
							content: updatedContent,
						} );
					} }
				/>
				<PersonalizationTagsModal
					isOpened={ isModalOpened }
					onInsert={ ( value, linkText ) => {
						handleInsert( value, linkText );
						setIsModalOpened( false );
					} }
					closeCallback={ () => setIsModalOpened( false ) }
					canInsertLink
					openedBy="block-controls"
				/>
			</ToolbarGroup>
		</BlockControls>
	);
}

/**
 * Extend the rich text formats with a button for personalization tags.
 */
function extendRichTextFormats() {
	registerFormatForEmail( 'poocommerce-email-editor/shortcode', {
		name: 'poocommerce-email-editor/shortcode',
		title: __( 'Personalization Tags', 'poocommerce' ),
		className: 'poocommerce-email-editor-personalization-tags',
		tagName: 'span',
		attributes: {},
		interactive: true,
		edit: PersonalizationTagsButton,
	} );

	// Register format type for using personalization tags as link attributes
	registerFormatForEmail( 'poocommerce-email-editor/link-shortcode', {
		name: 'poocommerce-email-editor/link-shortcode',
		title: __( 'Personalization Tags Link', 'poocommerce' ),
		className: 'poocommerce-email-editor-personalization-tags-link',
		tagName: 'a',
		attributes: {
			'data-link-href': 'data-link-href',
			contenteditable: 'contenteditable',
			style: 'style',
		},
		interactive: true,
		edit: null,
	} );
}

const personalizationTagsLiveContentUpdate = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const { attributes, setAttributes, name } = props;
		const { content } = attributes;

		// Fetch the personalization tags list
		const list = useSelect(
			( select ) => select( storeName ).getPersonalizationTagsList(),
			[]
		);

		// Memoized function to replace content tags
		const updateContent = useCallback( () => {
			if ( ! content ) {
				return '';
			}
			return replacePersonalizationTagsWithHTMLComments( content, list );
		}, [ content, list ] );

		// Handle content updates
		const handleSetAttributes = useCallback(
			( newAttributes ) => {
				if ( newAttributes.content !== undefined ) {
					const replacedContent =
						replacePersonalizationTagsWithHTMLComments(
							newAttributes.content,
							list
						);
					setAttributes( {
						...newAttributes,
						content: replacedContent,
					} );
				} else {
					setAttributes( newAttributes );
				}
			},
			[ list, setAttributes ]
		);

		// Only process supported blocks
		if (
			name === 'core/paragraph' ||
			name === 'core/heading' ||
			name === 'core/list-item'
		) {
			return (
				<BlockEdit
					{ ...props }
					attributes={ {
						...attributes,
						content: updateContent(),
					} }
					setAttributes={ handleSetAttributes }
				/>
			);
		}

		// Return default for unsupported blocks
		return <BlockEdit { ...props } />;
	},
	'personalizationTagsLiveContentUpdate'
);

/**
 * Replace written personalization tags with HTML comments in real-time.
 */
function activatePersonalizationTagsReplacing() {
	addFilterForEmail(
		'editor.BlockEdit',
		'poocommerce-email-editor/with-live-content-update',
		personalizationTagsLiveContentUpdate
	);
}

export {
	disableCertainRichTextFormats,
	extendRichTextFormats,
	activatePersonalizationTagsReplacing,
};
