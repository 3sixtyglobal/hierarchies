// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Urn } from "@twin.org/core";
import { Bip39 } from "@twin.org/crypto";
import { type IAccreditation, type IProperty, PropertyType } from "@twin.org/hierarchies-models";
import {
	TEST_ADDRESS_1,
	TEST_CLIENT_OPTIONS,
	TEST_COIN_TYPE,
	TEST_EXPLORER_URL,
	TEST_GAS_STATION_AUTH_TOKEN,
	TEST_GAS_STATION_URL,
	TEST_MNEMONIC_NAME,
	TEST_NETWORK,
	TEST_USER_IDENTITY,
	TEST_VAULT_CONNECTOR,
	setupTestEnv
} from "./setupTestEnv.js";
import { IotaHierarchiesConnector } from "../src/iotaHierarchiesConnector.js";

let connector: IotaHierarchiesConnector;

function debugOnChainLocation(id: string): void {
	const urn = Urn.fromValidString(id);
	const objectId = urn.namespaceSpecific(1);
	console.debug("Created", `${TEST_EXPLORER_URL}object/${objectId}?network=${TEST_NETWORK}`);
}

describe("IotaHierarchiesConnector with Gas Station Sponsorship", () => {
	beforeAll(async () => {
		await setupTestEnv();

		connector = new IotaHierarchiesConnector({
			config: {
				clientOptions: {
					...TEST_CLIENT_OPTIONS
				},
				gasStation: {
					gasStationUrl: TEST_GAS_STATION_URL,
					gasStationAuthToken: TEST_GAS_STATION_AUTH_TOKEN
				},
				vaultMnemonicId: TEST_MNEMONIC_NAME,
				network: TEST_NETWORK,
				coinType: TEST_COIN_TYPE,
				enableCostLogging: false
			}
		});
	});

	test("Can create a federation with gas station sponsorship", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		const fed = await connector.federationGet(id);
		const urn = Urn.fromValidString(fed.id);
		expect(urn.namespaceIdentifier()).toEqual("federation");
		expect(urn.namespaceMethod()).toEqual("iota");
	});

	test("Can add authority with gas station sponsorship", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		const authority2Address = "0x6d38355dd61cd3257e8b403f5d81821caa86e21621451215ee35f5063769264a";
		const authorityId = await connector.authorityAdd(TEST_USER_IDENTITY, id, authority2Address);
		const fed = await connector.federationGet(id);
		expect(fed.rootAuthorities.some(ra => ra.id === authorityId)).toBe(true);
	});

	test("Can add a property with gas station sponsorship", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		const property: IProperty = {
			name: "test.gas.property",
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		const fed = await connector.federationGet(id);
		expect(fed.governance?.properties.some(p => p.name === property.name)).toBe(true);
	});

	test("Can add accreditation to attest with gas station sponsorship", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		const property: IProperty = {
			name: "test.gas.attest",
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		const accreditation: Omit<IAccreditation, "permissionId"> = {
			accreditedBy: TEST_ADDRESS_1,
			properties: [
				{ name: "test.gas.attest", allowedValues: [{ type: PropertyType.String, value: "foo" }] }
			]
		};
		const accId = await connector.accreditationToAttestAdd(TEST_USER_IDENTITY, id, accreditation);
		const list = await connector.accreditationsToAttestGet(id, TEST_ADDRESS_1);
		expect(list.some(a => a.permissionId === accId)).toBe(true);
	});

	test("Can add accreditation to accredit with gas station sponsorship", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		const property: IProperty = {
			name: "test.gas.accredit",
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		const accreditation: Omit<IAccreditation, "permissionId"> = {
			accreditedBy: TEST_ADDRESS_1,
			properties: [
				{ name: "test.gas.accredit", allowedValues: [{ type: PropertyType.String, value: "foo" }] }
			]
		};
		const accId = await connector.accreditationToAccreditAdd(TEST_USER_IDENTITY, id, accreditation);
		const list = await connector.accreditationsToAccreditGet(id, TEST_ADDRESS_1);
		expect(list.some(a => a.permissionId === accId)).toBe(true);
	});

	test("Can create a federation for a sender whose wallet holds no coins", async () => {
		const zeroBalanceIdentity = "test-hierarchies-zero-balance";
		await TEST_VAULT_CONNECTOR.setSecret(
			`${zeroBalanceIdentity}/${TEST_MNEMONIC_NAME}`,
			Bip39.randomMnemonic()
		);

		const id = await connector.federationCreate(zeroBalanceIdentity);
		debugOnChainLocation(id);

		const fed = await connector.federationGet(id);
		const urn = Urn.fromValidString(fed.id);
		expect(urn.namespaceIdentifier()).toEqual("federation");
		expect(urn.namespaceMethod()).toEqual("iota");
	});
});
