// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

import { Urn } from "@twin.org/core";
import { PropertyType, type IAccreditation, type IProperty } from "@twin.org/hierarchies-models";
import { TEST_ADDRESS_1, TEST_ADDRESS_2, TEST_USER_IDENTITY } from "./setupTestEnv.js";
import { EntityStorageHierarchiesConnector } from "../src/entityStorageHierarchiesConnector.js";

let connector: EntityStorageHierarchiesConnector;

describe("EntityStorageHierarchiesConnector", () => {
	beforeEach(() => {
		connector = new EntityStorageHierarchiesConnector();
	});

	test("Can create the service", () => {
		expect(connector.className()).toBe("EntityStorageHierarchiesConnector");
	});

	test("Can create a federation", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		const fed = await connector.federationGet(id);
		const urn = Urn.fromValidString(fed.id);
		expect(urn.namespaceIdentifier()).toEqual("federation");
		expect(urn.namespaceMethod()).toEqual("entity-storage");

		expect(fed).toEqual({
			id,
			governance: {
				id: expect.any(String),
				accreditationsToAccredit: {
					[TEST_ADDRESS_1]: []
				},
				accreditationsToAttest: {
					[TEST_ADDRESS_1]: []
				},
				properties: []
			},
			revokedRootAuthorities: [],
			rootAuthorities: [
				{
					accountId: TEST_ADDRESS_1,
					id: expect.any(String)
				}
			]
		});
	});

	test("Can add and remove authority", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);

		const authorityId = await connector.authorityAdd(TEST_USER_IDENTITY, id, TEST_ADDRESS_2);
		const fed = await connector.federationGet(id);

		expect(fed).toEqual({
			id,
			governance: {
				id: expect.any(String),
				accreditationsToAccredit: {
					[TEST_ADDRESS_1]: []
				},
				accreditationsToAttest: {
					[TEST_ADDRESS_1]: []
				},
				properties: []
			},
			revokedRootAuthorities: [],
			rootAuthorities: [
				{ id: expect.any(String), accountId: TEST_ADDRESS_1 },
				{ id: authorityId, accountId: TEST_ADDRESS_2 }
			]
		});

		await connector.authorityRemove(TEST_USER_IDENTITY, id, TEST_ADDRESS_2);

		const fed2 = await connector.federationGet(id);

		expect(fed2).toEqual({
			id,
			governance: {
				id: expect.any(String),
				accreditationsToAccredit: {
					[TEST_ADDRESS_1]: []
				},
				accreditationsToAttest: {
					[TEST_ADDRESS_1]: []
				},
				properties: []
			},
			revokedRootAuthorities: [TEST_ADDRESS_2],
			rootAuthorities: [{ id: expect.any(String), accountId: TEST_ADDRESS_1 }]
		});
	});

	test("Can re-add a removed authority", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		await connector.authorityAdd(TEST_USER_IDENTITY, id, TEST_ADDRESS_2);
		await connector.authorityRemove(TEST_USER_IDENTITY, id, TEST_ADDRESS_2);
		await connector.authorityAdd(TEST_USER_IDENTITY, id, TEST_ADDRESS_2);
		const fed = await connector.federationGet(id);
		const unrevoked = fed.rootAuthorities.find(ra => ra.accountId === TEST_ADDRESS_2);
		expect(unrevoked).toBeDefined();
		const revoked = fed.revokedRootAuthorities.find(ra => ra === TEST_ADDRESS_2);
		expect(revoked).toBeUndefined();
	});

	test("Can add and remove a property", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		const property: IProperty = {
			name: "test.property",
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		const fed = await connector.federationGet(id);
		expect(fed).toEqual({
			id,
			governance: {
				id: expect.any(String),
				accreditationsToAccredit: {
					[TEST_ADDRESS_1]: []
				},
				accreditationsToAttest: {
					[TEST_ADDRESS_1]: []
				},
				properties: [
					{
						name: "test.property",
						allowedValues: [{ type: PropertyType.String, value: "foo" }]
					}
				]
			},
			revokedRootAuthorities: [],
			rootAuthorities: [{ id: expect.any(String), accountId: TEST_ADDRESS_1 }]
		});

		await connector.propertyRemove(TEST_USER_IDENTITY, id, property.name);

		const fed2 = await connector.federationGet(id, { includeRevokedProperties: true });
		expect(fed2).toEqual({
			id,
			governance: {
				id: expect.any(String),
				accreditationsToAccredit: {
					[TEST_ADDRESS_1]: []
				},
				accreditationsToAttest: {
					[TEST_ADDRESS_1]: []
				},
				properties: [
					{
						name: "test.property",
						allowedValues: [{ type: PropertyType.String, value: "foo" }],
						timespan: {
							validTo: expect.any(String)
						}
					}
				]
			},
			revokedRootAuthorities: [],
			rootAuthorities: [{ id: expect.any(String), accountId: TEST_ADDRESS_1 }]
		});
	});

	test("Can add, get, list, and remove accreditation to attest", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		const property: IProperty = {
			name: "test.property",
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		const accreditation: Omit<IAccreditation, "permissionId"> = {
			accreditedBy: TEST_ADDRESS_1,
			properties: [
				{ name: "test.property", allowedValues: [{ type: PropertyType.String, value: "foo" }] }
			]
		};
		const accId = await connector.accreditationToAttestAdd(TEST_USER_IDENTITY, id, accreditation);
		const fetched = await connector.accreditationToAttestGet(id, TEST_ADDRESS_1, accId);
		expect(fetched).toBeDefined();
		expect(fetched.permissionId).toBe(accId);
		const list = await connector.accreditationsToAttestGet(id, TEST_ADDRESS_1);
		expect(list.some(a => a.permissionId === accId)).toBe(true);
		await connector.accreditationToAttestRemove(TEST_USER_IDENTITY, id, TEST_ADDRESS_1, accId);
		const listAfter = await connector.accreditationsToAttestGet(id, TEST_ADDRESS_1);
		expect(listAfter.some(a => a.permissionId === accId)).toBe(false);
	});

	test("Can add, get, list, and remove accreditation to accredit", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		const property: IProperty = {
			name: "test.property",
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		const accreditation: Omit<IAccreditation, "permissionId"> = {
			accreditedBy: TEST_ADDRESS_1,
			properties: [
				{ name: "test.property", allowedValues: [{ type: PropertyType.String, value: "foo" }] }
			]
		};
		const accId = await connector.accreditationToAccreditAdd(TEST_USER_IDENTITY, id, accreditation);
		const fetched = await connector.accreditationToAccreditGet(id, TEST_ADDRESS_1, accId);
		expect(fetched).toBeDefined();
		expect(fetched.permissionId).toBe(accId);
		const list = await connector.accreditationsToAccreditGet(id, TEST_ADDRESS_1);
		expect(list.some(a => a.permissionId === accId)).toBe(true);
		await connector.accreditationToAccreditRemove(TEST_USER_IDENTITY, id, TEST_ADDRESS_1, accId);
		const listAfter = await connector.accreditationsToAccreditGet(id, TEST_ADDRESS_1);
		expect(listAfter.some(a => a.permissionId === accId)).toBe(false);
	});

	test("Can validate a property", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		const property: IProperty = {
			name: "test.property",
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		await connector.accreditationToAttestAdd(TEST_USER_IDENTITY, id, {
			accreditedBy: TEST_ADDRESS_1,
			properties: [
				{ name: "test.property", allowedValues: [{ type: PropertyType.String, value: "foo" }] }
			]
		});
		const result = await connector.propertyValidate(id, TEST_ADDRESS_1, "test.property", {
			type: PropertyType.String,
			value: "foo"
		});
		expect(result).toBe(true);
	});

	test("Can fail to validate a property", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		const property: IProperty = {
			name: "test.property",
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		await connector.accreditationToAttestAdd(TEST_USER_IDENTITY, id, {
			accreditedBy: TEST_ADDRESS_1,
			properties: [
				{ name: "test.property", allowedValues: [{ type: PropertyType.String, value: "foo" }] }
			]
		});
		const result = await connector.propertyValidate(id, TEST_ADDRESS_1, "test.property", {
			type: PropertyType.String,
			value: "bar"
		});
		expect(result).toBe(false);
	});

	test("Adding accreditation with unknown property throws", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		const accreditation: Omit<IAccreditation, "permissionId"> = {
			accreditedBy: TEST_ADDRESS_1,
			properties: [
				{ name: "unknown.property", allowedValues: [{ type: PropertyType.String, value: "foo" }] }
			]
		};
		await expect(
			connector.accreditationToAttestAdd(TEST_USER_IDENTITY, id, accreditation)
		).rejects.toThrow();
	});

	test("Adding property with duplicate name overwrites or fails gracefully", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		const property: IProperty = {
			name: "test.duplicate",
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		await expect(connector.propertyAdd(TEST_USER_IDENTITY, id, property)).rejects.toThrow();
	});

	test("Adding property with invalid PropertyType throws", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		// purposely using invalid type, cast to IProperty to bypass TS
		const property = {
			name: "test.invalidtype",
			allowedValues: [{ type: "InvalidType", value: "foo" }]
		} as unknown as IProperty;
		await expect(connector.propertyAdd(TEST_USER_IDENTITY, id, property)).rejects.toThrow();
	});

	test("Adding authority with invalid identity throws", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		await expect(connector.authorityAdd("", id, TEST_ADDRESS_2)).rejects.toThrow();
	});

	test("Removing authority with invalid identity throws", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		await expect(connector.authorityRemove("", id, TEST_ADDRESS_2)).rejects.toThrow();
	});

	test("Adding property with missing name throws", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		// purposely missing name, cast to IProperty to bypass TS
		const property = {
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		} as unknown as IProperty;
		await expect(connector.propertyAdd(TEST_USER_IDENTITY, id, property)).rejects.toThrow();
	});

	test("Removing authority that does not exist throws", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		await expect(
			connector.authorityRemove(TEST_USER_IDENTITY, id, "nonexistent-authority")
		).rejects.toThrow();
	});
});
