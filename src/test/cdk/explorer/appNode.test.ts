/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert'
import * as path from 'path'
import * as sinon from 'sinon'
import * as vscode from 'vscode'
import * as app from '../../../cdk/explorer/cdkProject'
import * as appNode from '../../../cdk/explorer/nodes/appNode'
import { ConstructNode } from '../../../cdk/explorer/nodes/constructNode'
import { getTestWorkspaceFolder } from '../../../integrationTest/integrationTestsUtilities'
import * as treeUtils from '../treeTestUtils'

describe('AppNode', function () {
    afterEach(function () {
        sinon.restore()
    })

    const workspaceFolderPath = getTestWorkspaceFolder()
    const workspaceFolderName = 'cdk-test-folder'
    const cdkJsonPath = path.join(getTestWorkspaceFolder(), workspaceFolderName, 'cdk.json')
    const treePath = path.join(cdkJsonPath, '..', 'cdk.out', 'tree.json')

    it('uses the `cdk.json` uri as its id', async function () {
        const testNode = getTestNode()

        assert.strictEqual(testNode.id, vscode.Uri.file(cdkJsonPath).toString())
    })

    it('initializes label and tooltip', async function () {
        const testNode = getTestNode()

        assert.strictEqual(testNode.treeItem.label, path.relative(workspaceFolderPath, path.dirname(cdkJsonPath)))
        assert.strictEqual(testNode.treeItem.tooltip, vscode.Uri.file(cdkJsonPath).path)
    })

    it('returns placeholder node when app contains no stacks', async function () {
        const testNode = getTestNode()
        sinon.stub(app, 'getApp').resolves({
            constructTree: treeUtils.getTreeWithNoStack(),
            location: testNode.resource,
        })

        const childNodes = await testNode.getChildren()

        assert.strictEqual(childNodes.length, 1)
        assert.ok(childNodes[0].treeItem.label?.includes('No stacks'))
    })

    it('returns construct node when app has stacks', async function () {
        const testNode = getTestNode()
        sinon.stub(app, 'getApp').resolves({
            constructTree: treeUtils.getTree(),
            location: testNode.resource,
        })

        const childNodes = await testNode.getChildren()

        assert.strictEqual(childNodes.length, 1)
        assert.strictEqual(childNodes[0] instanceof ConstructNode, true)
    })

    it('returns placeholder node when tree.json cannot be loaded', async function () {
        const testNode = getTestNode()
        sinon.stub(app, 'getApp').throws()

        const childNodes = await testNode.getChildren()

        assert.strictEqual(childNodes.length, 1)
        assert.ok(childNodes[0].treeItem.label?.includes('Unable to load construct tree'))
    })

    function getTestNode(): appNode.AppNode {
        const appLocation: app.CdkAppLocation = {
            cdkJsonUri: vscode.Uri.file(cdkJsonPath),
            treeUri: vscode.Uri.file(treePath),
        }

        return new appNode.AppNode(appLocation)
    }
})
