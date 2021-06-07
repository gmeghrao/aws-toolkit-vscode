/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'
import * as nls from 'vscode-nls'
import { ext } from '../extensionGlobals'
import { WizardControl, WIZARD_BACK } from '../wizards/wizard'

const localize = nls.loadMessageBundle()
const HELP_TOOLTIP = localize('AWS.command.help', 'View Toolkit Documentation')

// Light wrapper around QuickInputButtons
export interface QuickInputButton<T> extends vscode.QuickInputButton {
    onClick: (resolve: (result: T) => void, reject: any) => void
}

/**
 * Creates a QuickInputButton with a predefined help button (dark and light theme compatible)
 * Images are only loaded after extension.ts loads; this should happen on any user-facing extension usage.
 * button will exist regardless of image loading (UI tests will still see this)
 * 
 * @param uri Opens the URI upon clicking
 * @param tooltip Optional tooltip for button
 */
export function createHelpButton(uri: string | vscode.Uri, tooltip: string = HELP_TOOLTIP): QuickInputButton<void> {
    return {
        iconPath: {
            light: vscode.Uri.file(ext.iconPaths.light.help),
            dark: vscode.Uri.file(ext.iconPaths.dark.help),
        },
        tooltip,
        onClick: () => vscode.env.openExternal(typeof uri === 'string' ? vscode.Uri.parse(uri) : uri)
    }
}

const BACK_FUNCTION = (resolve: (result: WizardControl) => void) => resolve(WIZARD_BACK)

// Extensions might actually share the back button. If so, this should not be done.
export function createBackButton(): QuickInputButton<WizardControl> {
    const descriptor = Object.getOwnPropertyDescriptor(vscode.QuickInputButtons.Back, 'onClick')
    if (descriptor === undefined) {
        Object.defineProperty(vscode.QuickInputButtons.Back, 'onClick', { value: BACK_FUNCTION, configurable: false })
    } else if (descriptor.value !== BACK_FUNCTION) {
        throw new Error('The property "onClick" has already been defined for the Back button')
    }
    return vscode.QuickInputButtons.Back as QuickInputButton<WizardControl>
}
