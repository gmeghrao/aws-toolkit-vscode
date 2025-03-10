/*!
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert'
import * as AWS from 'aws-sdk'
import { AwsContextCredentials } from '../../shared/awsContext'
import { regionSettingKey } from '../../shared/constants'
import { DefaultAwsContext } from '../../shared/awsContext'
import { FakeExtensionContext, FakeMementoStorage } from '../fakeExtensionContext'

describe('DefaultAwsContext', function () {
    const testRegion1Value: string = 're-gion-1'
    const testRegion2Value: string = 're-gion-2'
    const testRegion3Value: string = 're-gion-3'
    const testAccountIdValue: string = '123456789012'

    it('instantiates with no credentials', async function () {
        const testContext = new DefaultAwsContext(await FakeExtensionContext.create())

        assert.strictEqual(testContext.getCredentialProfileName(), undefined)
        assert.strictEqual(testContext.getCredentialAccountId(), undefined)
        assert.strictEqual(await testContext.getCredentials(), undefined)
    })

    it('sets credentials and gets credentialsId', async function () {
        const awsCredentials = makeSampleAwsContextCredentials()

        const testContext = new DefaultAwsContext(await FakeExtensionContext.create())

        await testContext.setCredentials(awsCredentials)
        assert.strictEqual(testContext.getCredentialProfileName(), awsCredentials.credentialsId)
    })

    it('sets undefined credentials and gets credentialsId', async function () {
        const testContext = new DefaultAwsContext(await FakeExtensionContext.create())

        await testContext.setCredentials(undefined)
        assert.strictEqual(testContext.getCredentialProfileName(), undefined)
    })

    it('sets credentials and gets accountId', async function () {
        const awsCredentials = makeSampleAwsContextCredentials()

        const testContext = new DefaultAwsContext(await FakeExtensionContext.create())

        await testContext.setCredentials(awsCredentials)
        assert.strictEqual(testContext.getCredentialAccountId(), awsCredentials.accountId)
    })

    it('sets undefined credentials and gets accountId', async function () {
        const testContext = new DefaultAwsContext(await FakeExtensionContext.create())

        await testContext.setCredentials(undefined)
        assert.strictEqual(testContext.getCredentialAccountId(), undefined)
    })

    it('sets credentials and gets credentials', async function () {
        const awsCredentials = makeSampleAwsContextCredentials()

        const testContext = new DefaultAwsContext(await FakeExtensionContext.create())

        await testContext.setCredentials(awsCredentials)
        assert.strictEqual(await testContext.getCredentials(), awsCredentials.credentials)
    })

    it('sets undefined credentials and gets credentials', async function () {
        const testContext = new DefaultAwsContext(await FakeExtensionContext.create())

        await testContext.setCredentials(undefined)
        assert.strictEqual(await testContext.getCredentials(), undefined)
    })

    it('gets single region from config on startup', async function () {
        const fakeMementoStorage: FakeMementoStorage = {}
        fakeMementoStorage[regionSettingKey] = [testRegion1Value]

        const fakeExtensionContext = await FakeExtensionContext.create({
            globalState: fakeMementoStorage,
        })

        const testContext = new DefaultAwsContext(fakeExtensionContext)
        const regions = await testContext.getExplorerRegions()
        assert.strictEqual(regions.length, 1)
        assert.strictEqual(regions[0], testRegion1Value)
    })

    it('gets multiple regions from config on startup', async function () {
        const fakeMementoStorage: FakeMementoStorage = {}
        fakeMementoStorage[regionSettingKey] = [testRegion1Value, testRegion2Value]

        const fakeExtensionContext = await FakeExtensionContext.create({
            globalState: fakeMementoStorage,
        })

        const testContext = new DefaultAwsContext(fakeExtensionContext)
        const regions = await testContext.getExplorerRegions()
        assert.strictEqual(regions.length, 2)
        assert.strictEqual(regions[0], testRegion1Value)
        assert.strictEqual(regions[1], testRegion2Value)
    })

    it('updates globalState on single region change', async function () {
        const extensionContext = await FakeExtensionContext.create()
        const testContext = new DefaultAwsContext(extensionContext)
        await testContext.addExplorerRegion(testRegion1Value)

        const persistedRegions = extensionContext.globalState.get<string[]>(regionSettingKey)
        assert.ok(persistedRegions, 'Expected region data to be stored in globalState')
        assert.strictEqual(persistedRegions!.length, 1)
        assert.strictEqual(persistedRegions![0], testRegion1Value)
    })

    it('updates globalState on multiple region change', async function () {
        const extensionContext = await FakeExtensionContext.create()
        const testContext = new DefaultAwsContext(extensionContext)
        await testContext.addExplorerRegion(testRegion1Value, testRegion2Value)

        const persistedRegions = extensionContext.globalState.get<string[]>(regionSettingKey)
        assert.ok(persistedRegions, 'Expected region data to be stored in globalState')
        assert.strictEqual(persistedRegions!.length, 2)
        assert.strictEqual(persistedRegions![0], testRegion1Value)
        assert.strictEqual(persistedRegions![1], testRegion2Value)
    })

    it('updates globalState on region removal', async function () {
        const extensionContext = await FakeExtensionContext.create()
        const testContext = new DefaultAwsContext(extensionContext)
        await testContext.addExplorerRegion(testRegion1Value, testRegion2Value, testRegion3Value)
        await testContext.removeExplorerRegion(testRegion2Value)

        const persistedRegions = extensionContext.globalState.get<string[]>(regionSettingKey)
        assert.ok(persistedRegions, 'Expected region data to be stored in globalState')
        assert.strictEqual(persistedRegions!.length, 2)
        assert.strictEqual(persistedRegions![0], testRegion1Value)
        assert.strictEqual(persistedRegions![1], testRegion3Value)
    })

    it('fires event on credentials change', async function () {
        const testContext = new DefaultAwsContext(await FakeExtensionContext.create())

        const awsCredentials = makeSampleAwsContextCredentials()

        await new Promise<void>(async resolve => {
            testContext.onDidChangeContext(awsContextChangedEvent => {
                assert.strictEqual(awsContextChangedEvent.profileName, awsCredentials.credentialsId)
                assert.strictEqual(awsContextChangedEvent.accountId, awsCredentials.accountId)
                resolve()
            })

            await testContext.setCredentials(awsCredentials)
        })
    })

    function makeSampleAwsContextCredentials(): AwsContextCredentials {
        return {
            credentials: {} as any as AWS.Credentials,
            credentialsId: 'qwerty',
            accountId: testAccountIdValue,
        }
    }
})
