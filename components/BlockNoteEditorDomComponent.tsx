'use dom'

import '@/global.css';
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView, lightDefaultTheme, Theme } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { blockTypeSelectItems, FormattingToolbar, FormattingToolbarController, GridSuggestionMenuController, useCreateBlockNote, useEditorChange } from "@blocknote/react";
import { DOMProps } from "expo/dom";
import { Platform } from 'react-native';
import './a.css';

interface BlockNoteEditorDomComponentProps {
    colors: Record<string, string>;
    platform: typeof Platform.OS;
    onChange?: (text: string) => void;
    initialContent?: any[];
    dom?: DOMProps;
}
const BlockNoteEditorDomComponent = ({ colors, platform, onChange, initialContent, dom }: BlockNoteEditorDomComponentProps) => {
    // Creates a new editor instance.
    const editor = useCreateBlockNote({
        initialContent,
        uploadFile: (file) => {
            console.log(file);
            return new Promise((resolve) => {
                console.log(file);

                resolve(file);
            });
        }
    });

    useEditorChange(editor => {
        onChange?.(JSON.stringify(editor.document));
    }, editor);


    // Renders the editor instance using a React component.

    const lightRedTheme = {
        colors: {
            editor: {
                text: colors["base-content"],
                background: colors["base-100"],
            },
            menu: {
                text: colors["base-content"],
                background: colors['base-300'],
            },
            tooltip: {
                text: colors["neutral-content"],
                background: colors['neutral'],
            },
            hovered: {
                text: colors["base-content"],
                background: colors['base-100'],
            },
            selected: {
                text: colors["base-content"],
                background: colors['base-200'],
            },
            disabled: {
                text: colors["base-content"],
                background: colors['base-200'],
            },
            shadow: colors['base-100'],
            border: colors['base-300'],
            sideMenu: colors['base-content'],
            highlights: lightDefaultTheme.colors!.highlights,
        },
        borderRadius: 4,
        fontFamily: "Helvetica Neue, sans-serif",
    } satisfies Theme;

    return (
        <div style={{
            flex: 1
        }}>

            <BlockNoteView
                style={{
                    flex: 1,
                }}
                editor={editor}
                theme={lightRedTheme}
                emojiPicker={false}
                filePanel={true}
                formattingToolbar={false}
            >
                {/* TODO: Add custom formatting toolbar top of keyboard with keyboard height... */}
                <FormattingToolbarController
                    floatingOptions={{
                        placement: platform !== 'ios' ? 'bottom' : 'top',
                    }}
                    formattingToolbar={() => (
                        <FormattingToolbar
                            // Sets the items in the Block Type Select.
                            blockTypeSelectItems={[
                                // Gets the default Block Type Select items.
                                ...blockTypeSelectItems(editor.dictionary),
                                // Adds an item for the Alert block.
                                // {
                                //     name: "Alert",
                                //     type: "alert",
                                //     icon: RiAlertFill,
                                //     isSelected: (block) => block.type === "alert",
                                // } satisfies BlockTypeSelectItem,
                            ]}
                        />
                    )}
                />
                <GridSuggestionMenuController
                    triggerCharacter={":"}
                    // Changes the Emoji Picker to only have 5 columns.
                    columns={7}
                    minQueryLength={1}
                />
            </BlockNoteView>
        </div>
    );
}

export default BlockNoteEditorDomComponent;
