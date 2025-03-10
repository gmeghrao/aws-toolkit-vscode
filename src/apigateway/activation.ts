/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'
import { RestApiNode } from './explorer/apiNodes'
import { invokeRemoteRestApi } from './vue/invokeRemoteRestApi'
import { copyUrlCommand } from './commands/copyUrl'
import { ExtContext } from '../shared/extensions'

/**
 * Activate API Gateway functionality for the extension.
 */
export async function activate(activateArguments: {
    extContext: ExtContext
    outputChannel: vscode.OutputChannel
}): Promise<void> {
    const extensionContext = activateArguments.extContext.extensionContext
    const regionProvider = activateArguments.extContext.regionProvider
    extensionContext.subscriptions.push(
        vscode.commands.registerCommand(
            'aws.apig.copyUrl',
            async (node: RestApiNode) => await copyUrlCommand(node, regionProvider)
        )
    )

    extensionContext.subscriptions.push(
        vscode.commands.registerCommand(
            'aws.apig.invokeRemoteRestApi',
            async (node: RestApiNode) =>
                await invokeRemoteRestApi(activateArguments.extContext, {
                    apiNode: node,
                    outputChannel: activateArguments.outputChannel,
                })
        )
    )
}
