/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import * as React from '@wordpress/element';

/**
 * Internal dependencies
 */
import { mainSidebarDocumentTab, mainSidebarBlockTab } from '../../store';
import { useEditorMode } from '../../hooks';
import { Tabs } from '../../private-apis';

export function HeaderTabs( _, ref ) {
	const [ editorMode ] = useEditorMode();
	return (
		<Tabs.TabList ref={ ref }>
			<Tabs.Tab tabId={ mainSidebarDocumentTab }>
				{ editorMode === 'template'
					? __( 'Template', 'poocommerce' )
					: __( 'Email', 'poocommerce' ) }
			</Tabs.Tab>
			<Tabs.Tab tabId={ mainSidebarBlockTab }>
				{ __( 'Block', 'poocommerce' ) }
			</Tabs.Tab>
		</Tabs.TabList>
	);
}

export const Header = React.forwardRef( HeaderTabs );
