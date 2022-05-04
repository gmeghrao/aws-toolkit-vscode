/*!
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert'
import * as sinon from 'sinon'
import * as vscode from 'vscode'
import { Disposable } from 'vscode-languageclient'
import { AslVisualization } from '../../../../src/stepFunctions/commands/visualizeStateMachine/aslVisualization'
import { AslVisualizationManager } from '../../../../src/stepFunctions/commands/visualizeStateMachine/aslVisualizationManager'

import { StateMachineGraphCache } from '../../../stepFunctions/utils'

import { YAML_ASL, JSON_ASL } from '../../../../src/stepFunctions/constants/aslFormats'
import { FakeExtensionContext } from '../../fakeExtensionContext'

// Top level defintions
let aslVisualizationManager: AslVisualizationManager

const mockGlobalStorage: vscode.Memento = {
    update: sinon.spy(),
    get: sinon.stub().returns(undefined),
}

const mockUriOne = vscode.Uri.file('uri1')

const mockTextDocumentOne: vscode.TextDocument = {
    eol: 1,
    fileName: 'MockFileNameOne',
    isClosed: false,
    isDirty: false,
    isUntitled: false,
    languageId: 'MockLanguageIdOne',
    lineCount: 0,
    uri: mockUriOne,
    version: 0,
    getText: () => {
        return 'MockDocumentTextOne'
    },
    getWordRangeAtPosition: sinon.spy(),
    lineAt: sinon.spy(),
    offsetAt: sinon.spy(),
    positionAt: sinon.spy(),
    save: sinon.spy(),
    validatePosition: sinon.spy(),
    validateRange: sinon.spy(),
}

const mockUriTwo = vscode.Uri.file('uri2')

const mockTextDocumentTwo: vscode.TextDocument = {
    eol: 1,
    fileName: 'MockFileNameTwo',
    isClosed: false,
    isDirty: false,
    isUntitled: false,
    languageId: 'MockLanguageIdTwo',
    lineCount: 0,
    uri: mockUriTwo,
    version: 0,
    getText: () => {
        return 'MockDocumentTextTwo'
    },
    getWordRangeAtPosition: sinon.spy(),
    lineAt: sinon.spy(),
    offsetAt: sinon.spy(),
    positionAt: sinon.spy(),
    save: sinon.spy(),
    validatePosition: sinon.spy(),
    validateRange: sinon.spy(),
}

const mockUriThree = vscode.Uri.file('uri3')
const mockDataJson =
    '{"Comment":"A Hello World example of the Amazon States Language using Pass states","StartAt":"Hello","States":{"Hello":{"Type":"Pass","Result":"Hello","Next":"World"},"World":{"Type":"Pass","Result":"${Text}","End":true}}}'

const mockDataYaml = `
Comment: "A Hello World example of the Amazon States Language using Pass states"
StartAt: Hello
States:
  Hello:
    Type: Pass
    Result: Hello
    Next: World
  World:
    Type: Pass
    Result: \$\{Text\}
    End: true
`

const mockTextDocumentYaml: vscode.TextDocument = {
    eol: 1,
    fileName: 'MockFileNameYaml',
    isClosed: false,
    isDirty: false,
    isUntitled: false,
    languageId: YAML_ASL,
    lineCount: 0,
    uri: mockUriThree,
    version: 0,
    getText: () => {
        return mockDataYaml
    },
    getWordRangeAtPosition: sinon.spy(),
    lineAt: sinon.spy(),
    offsetAt: sinon.spy(),
    positionAt: sinon.spy(),
    save: sinon.spy(),
    validatePosition: sinon.spy(),
    validateRange: sinon.spy(),
}

const mockTextDocumentJson: vscode.TextDocument = {
    eol: 1,
    fileName: 'MockFileNameJson',
    isClosed: false,
    isDirty: false,
    isUntitled: false,
    languageId: JSON_ASL,
    lineCount: 0,
    uri: mockUriThree,
    version: 0,
    getText: () => {
        return mockDataJson
    },
    getWordRangeAtPosition: sinon.spy(),
    lineAt: sinon.spy(),
    offsetAt: sinon.spy(),
    positionAt: sinon.spy(),
    save: sinon.spy(),
    validatePosition: sinon.spy(),
    validateRange: sinon.spy(),
}

const mockPosition: vscode.Position = {
    line: 0,
    character: 0,
    isBefore: sinon.spy(),
    isBeforeOrEqual: sinon.spy(),
    isAfter: sinon.spy(),
    isAfterOrEqual: sinon.spy(),
    isEqual: sinon.spy(),
    translate: sinon.spy(),
    with: sinon.spy(),
    compareTo: sinon.spy(),
}

const mockSelection: vscode.Selection = {
    anchor: mockPosition,
    active: mockPosition,
    end: mockPosition,
    isEmpty: false,
    isReversed: false,
    isSingleLine: false,
    start: mockPosition,
    contains: sinon.spy(),
    intersection: sinon.spy(),
    isEqual: sinon.spy(),
    union: sinon.spy(),
    with: sinon.spy(),
}

const mockRange: vscode.Range = {
    start: mockPosition,
    end: mockPosition,
    isEmpty: false,
    isSingleLine: false,
    contains: sinon.spy(),
    intersection: sinon.spy(),
    isEqual: sinon.spy(),
    union: sinon.spy(),
    with: sinon.spy(),
}

describe('StepFunctions VisualizeStateMachine', async function () {
    let mockVsCode: MockVSCode

    before(function () {
        mockVsCode = new MockVSCode()
        sinon.stub(StateMachineGraphCache.prototype, 'updateCachedFile').resolves()
    })

    beforeEach(async function () {
        const fakeExtCtx = await FakeExtensionContext.create()
        fakeExtCtx.globalState = mockGlobalStorage
        fakeExtCtx.workspaceState = mockGlobalStorage
        fakeExtCtx.asAbsolutePath = sinon.spy()
        aslVisualizationManager = new AslVisualizationManager(fakeExtCtx)
    })

    afterEach(function () {
        mockVsCode.closeAll()
    })

    after(function () {
        sinon.restore()
    })

    it('Test AslVisualization on setup all properties are correct', function () {
        const vis = new MockAslVisualization(mockTextDocumentOne)

        assert.deepStrictEqual(vis.documentUri, mockTextDocumentOne.uri)
        assert.strictEqual(vis.getIsPanelDisposed(), false)
        assert.strictEqual(vis.getDisposables().length, 5)

        let panel = vis.getPanel()
        assert.ok(panel)
        panel = panel as vscode.WebviewPanel
        assert.ok(panel.title.length > 0)
        assert.strictEqual(panel.viewType, 'stateMachineVisualization')

        let webview = vis.getWebview()
        assert.ok(webview)
        webview = webview as vscode.Webview
        assert.ok(webview.html)
    })

    it('Test AslVisualizationManager on setup managedVisualizations set is empty', function () {
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 0)
    })

    it('Test AslVisualizationManager managedVisualizations set still empty if no active text editor', async function () {
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 0)

        // Preview with no active text editor
        await assert.rejects(
            aslVisualizationManager.visualizeStateMachine(mockGlobalStorage, undefined),
            new Error('Could not get active text editor for state machine render.'),
            'Expected an error to be thrown'
        )

        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 0)
    })

    it('Test AslVisualizationManager managedVisualizations set has one AslVis on first preview', async function () {
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 0)

        // Preview Doc1
        mockVsCode.showTextDocument(mockTextDocumentOne)
        await aslVisualizationManager.visualizeStateMachine(mockGlobalStorage, vscode.window.activeTextEditor)
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 1)

        const managedVisualizations = aslVisualizationManager.getManagedVisualizations()
        assert.ok(managedVisualizations.get(mockTextDocumentOne.uri.fsPath))
    })

    it('Test AslVisualizationManager managedVisualizations set does not add second Vis on duplicate preview', async function () {
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 0)

        // Preview Doc1
        mockVsCode.showTextDocument(mockTextDocumentOne)
        await aslVisualizationManager.visualizeStateMachine(mockGlobalStorage, vscode.window.activeTextEditor)
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 1)

        // Preview Doc1 Again
        await aslVisualizationManager.visualizeStateMachine(mockGlobalStorage, vscode.window.activeTextEditor)
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 1)

        const managedVisualizations = aslVisualizationManager.getManagedVisualizations()
        assert.ok(managedVisualizations.get(mockTextDocumentOne.uri.fsPath))
    })

    it('Test AslVisualizationManager managedVisualizations set adds second Vis on different preview', async function () {
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 0)

        // Preview Doc1
        mockVsCode.showTextDocument(mockTextDocumentOne)
        await aslVisualizationManager.visualizeStateMachine(mockGlobalStorage, vscode.window.activeTextEditor)
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 1)

        // Preview Doc2
        mockVsCode.showTextDocument(mockTextDocumentTwo)
        await aslVisualizationManager.visualizeStateMachine(mockGlobalStorage, vscode.window.activeTextEditor)
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 2)

        const managedVisualizations = aslVisualizationManager.getManagedVisualizations()
        assert.ok(managedVisualizations.get(mockTextDocumentOne.uri.fsPath))
        assert.ok(managedVisualizations.get(mockTextDocumentTwo.uri.fsPath))
    })

    it('Test AslVisualizationManager managedVisualizations set does not add duplicate renders when multiple Vis active', async function () {
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 0)

        // Preview Doc1
        mockVsCode.showTextDocument(mockTextDocumentOne)
        await aslVisualizationManager.visualizeStateMachine(mockGlobalStorage, vscode.window.activeTextEditor)
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 1)

        // Preview Doc2
        mockVsCode.showTextDocument(mockTextDocumentTwo)
        await aslVisualizationManager.visualizeStateMachine(mockGlobalStorage, vscode.window.activeTextEditor)
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 2)

        // Preview Doc1 Again
        mockVsCode.showTextDocument(mockTextDocumentOne)
        await aslVisualizationManager.visualizeStateMachine(mockGlobalStorage, vscode.window.activeTextEditor)
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 2)

        // Preview Doc2 Again
        mockVsCode.showTextDocument(mockTextDocumentTwo)
        await aslVisualizationManager.visualizeStateMachine(mockGlobalStorage, vscode.window.activeTextEditor)
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 2)

        const managedVisualizations = aslVisualizationManager.getManagedVisualizations()
        assert.ok(managedVisualizations.get(mockTextDocumentOne.uri.fsPath))
        assert.ok(managedVisualizations.get(mockTextDocumentTwo.uri.fsPath))
    })

    it('Test AslVisualizationManager managedVisualizations set removes visualization on visualization dispose, single vis', async function () {
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 0)

        // Preview Doc1
        mockVsCode.showTextDocument(mockTextDocumentOne)
        let panel = await aslVisualizationManager.visualizeStateMachine(
            mockGlobalStorage,
            vscode.window.activeTextEditor
        )
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 1)

        // Dispose of visualization panel
        assert.ok(panel, 'Panel was not successfully generated')
        panel = panel as vscode.WebviewPanel
        panel.dispose()

        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 0)
    })

    it('Test AslVisualizationManager managedVisualizations set removes correct visualization on visualization dispose, multiple vis', async function () {
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 0)

        // Preview Doc1
        mockVsCode.showTextDocument(mockTextDocumentOne)
        let panel = await aslVisualizationManager.visualizeStateMachine(
            mockGlobalStorage,
            vscode.window.activeTextEditor
        )
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 1)

        // Preview Doc2
        mockVsCode.showTextDocument(mockTextDocumentTwo)
        await aslVisualizationManager.visualizeStateMachine(mockGlobalStorage, vscode.window.activeTextEditor)
        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 2)

        // Dispose of first visualization panel
        assert.ok(panel, 'Panel was not successfully generated')
        panel = panel as vscode.WebviewPanel
        panel.dispose()

        assert.strictEqual(aslVisualizationManager.getManagedVisualizations().size, 1)
    })

    it('Test AslVisualisation sendUpdateMessage posts a correct update message for YAML files', async function () {
        const postMessage = sinon.spy()
        class MockAslVisualizationYaml extends AslVisualization {
            public getWebview(): vscode.Webview | undefined {
                return { postMessage } as unknown as vscode.Webview
            }
        }

        const visualisation = new MockAslVisualizationYaml(mockTextDocumentYaml)

        await visualisation.sendUpdateMessage(mockTextDocumentYaml)

        const message = {
            command: 'update',
            stateMachineData: mockDataJson,
            isValid: true,
            errors: [],
        }

        assert.ok(postMessage.calledOnce)
        assert.deepEqual(postMessage.firstCall.args, [message])
    })

    it('Test AslVisualisation sendUpdateMessage posts a correct update message for ASL files', async function () {
        const postMessage = sinon.spy()
        class MockAslVisualizationJson extends AslVisualization {
            public getWebview(): vscode.Webview | undefined {
                return { postMessage } as unknown as vscode.Webview
            }
        }

        const visualisation = new MockAslVisualizationJson(mockTextDocumentJson)

        await visualisation.sendUpdateMessage(mockTextDocumentJson)

        const message = {
            command: 'update',
            stateMachineData: mockDataJson,
            isValid: true,
            errors: [],
        }

        assert.ok(postMessage.calledOnce)
        assert.deepEqual(postMessage.firstCall.args, [message])
    })
})

class MockAslVisualization extends AslVisualization {
    public getIsPanelDisposed(): boolean {
        return this.isPanelDisposed
    }

    public getDisposables(): Disposable[] {
        return this.disposables
    }
}

class MockEditor implements vscode.TextEditor {
    public readonly options = {}
    public readonly selection = mockSelection
    public readonly selections = []
    public readonly visibleRanges = [mockRange]
    public readonly edit = sinon.spy()
    public readonly insertSnippet = sinon.spy()
    public readonly setDecorations = sinon.spy()
    public readonly hide = sinon.spy()
    public readonly revealRange = sinon.spy()
    public readonly show = sinon.spy()
    public document: vscode.TextDocument

    public constructor(document: vscode.TextDocument) {
        this.document = document
    }

    public setDocument(document: vscode.TextDocument): void {
        this.document = document
    }
}

class MockVSCode {
    public activeEditor: MockEditor | undefined = undefined
    private documents: Set<vscode.TextDocument> = new Set<vscode.TextDocument>()

    public showTextDocument(documentToShow: vscode.TextDocument): void {
        let doc = this.getDocument(documentToShow)
        if (!doc) {
            this.documents.add(documentToShow)
            doc = documentToShow
        }
        this.updateActiveEditor(doc)

        // Update the return value for the stub with each call to showTextDocument
        sinon.stub(vscode.window, 'activeTextEditor').value(this.activeEditor)
    }

    public closeAll(): void {
        this.activeEditor = undefined
        this.documents = new Set<vscode.TextDocument>()
    }

    private getDocument(documentToFind: vscode.TextDocument): vscode.TextDocument | undefined {
        for (const doc of this.documents) {
            if (doc.uri.fsPath === documentToFind.uri.fsPath) {
                return doc
            }
        }

        return
    }

    private updateActiveEditor(document: vscode.TextDocument): void {
        if (this.activeEditor) {
            this.activeEditor.setDocument(document)
        } else {
            this.activeEditor = new MockEditor(document)
        }
    }
}
