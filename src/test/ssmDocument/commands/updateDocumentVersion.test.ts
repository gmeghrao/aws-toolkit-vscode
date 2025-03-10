/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { SSM } from 'aws-sdk'
import * as sinon from 'sinon'
import * as assert from 'assert'

import { updateDocumentVersion } from '../../../ssmDocument/commands/updateDocumentVersion'
import { DocumentItemNodeWriteable } from '../../../ssmDocument/explorer/documentItemNodeWriteable'

import * as picker from '../../../shared/ui/picker'
import { FakeAwsContext } from '../../utilities/fakeAwsContext'
import { mock } from '../../utilities/mockito'
import { SsmDocumentClient } from '../../../shared/clients/ssmDocumentClient'

describe('openDocumentItem', async function () {
    afterEach(function () {
        sinon.restore()
    })

    const fakeDoc: SSM.Types.DocumentIdentifier = {
        Name: 'testDocument',
        DocumentFormat: 'json',
        DocumentType: 'Command',
        Owner: 'Amazon',
    }

    const fakeAwsContext = new FakeAwsContext()

    const fakeRegion = 'us-east-1'

    const fakeSchemaList: SSM.DocumentVersionInfo[] = [
        {
            Name: 'testDocument',
            DocumentVersion: '1',
        },
        {
            Name: 'testDocument',
            DocumentVersion: '2',
        },
    ]

    const fakeVersionSelectionResult = {
        label: '2',
        description: 'default',
    }

    it('updateDocumentVersion with correct name and version', async function () {
        sinon.stub(picker, 'promptUser').onFirstCall().returns(Promise.resolve(undefined))
        sinon.stub(picker, 'verifySinglePickerOutput').onFirstCall().returns(fakeVersionSelectionResult)
        sinon.stub(fakeAwsContext, 'getCredentialAccountId').returns('Amazon')
        const ssmClient = {} as unknown as SsmDocumentClient
        const documentNode = new DocumentItemNodeWriteable(fakeDoc, ssmClient, fakeRegion, mock())
        sinon.stub(documentNode, 'listSchemaVersion').returns(Promise.resolve(fakeSchemaList))
        const updateVersionStub = sinon.stub(documentNode, 'updateDocumentVersion')
        await updateDocumentVersion(documentNode, fakeAwsContext)
        assert.strictEqual(updateVersionStub.getCall(0).args[0], '2')
    })
})
