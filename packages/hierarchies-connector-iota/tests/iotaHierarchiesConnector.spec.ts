// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Urn } from "@twin.org/core";

import {
	type IAccreditation,
	type IProperty,
	PropertyConstraintType,
	PropertyType
} from "@twin.org/hierarchies-models";
import {
	TEST_ADDRESS_1,
	TEST_ADDRESS_2,
	TEST_IOTA_CONFIG,
	TEST_EXPLORER_URL,
	TEST_NETWORK,
	TEST_USER_IDENTITY,
	setupTestEnv
} from "./setupTestEnv.js";
import { IotaHierarchiesConnector } from "../src/iotaHierarchiesConnector.js";

let connector: IotaHierarchiesConnector;

function debugOnChainLocation(id: string): void {
	const urn = Urn.fromValidString(id);
	const objectId = urn.namespaceSpecific(1);
	console.debug("Created", `${TEST_EXPLORER_URL}object/${objectId}?network=${TEST_NETWORK}`);
}

describe("IotaHierarchiesConnector", () => {
	beforeAll(async () => {
		await setupTestEnv();
		connector = new IotaHierarchiesConnector({
			config: {
				...TEST_IOTA_CONFIG,
				enableCostLogging: false
			}
		});
	});

	test("Can create the service", async () => {
		expect(connector.className()).toBe("IotaHierarchiesConnector");
	});

	test.skip("Can create a federation", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		const fed = await connector.federationGet(id);
		const urn = Urn.fromValidString(fed.id);
		expect(urn.namespaceIdentifier()).toEqual("federation");
		expect(urn.namespaceMethod()).toEqual("iota");

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

	test.skip("Can add and remove authority", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);

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

	test.skip("Can re-add a removed authority", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		// Add a second authority
		await connector.authorityAdd(TEST_USER_IDENTITY, id, TEST_ADDRESS_2);
		// Remove the authority
		await connector.authorityRemove(TEST_USER_IDENTITY, id, TEST_ADDRESS_2);
		// Re-add the same authority
		await connector.authorityAdd(TEST_USER_IDENTITY, id, TEST_ADDRESS_2);
		// Fetch federation and check authority is present
		const hierarchies = await connector.federationGet(id);
		const unrevoked = hierarchies.rootAuthorities.find(ra => ra.accountId === TEST_ADDRESS_2);
		expect(unrevoked).toBeDefined();
		const revoked = hierarchies.revokedRootAuthorities.find(ra => ra === TEST_ADDRESS_2);
		expect(revoked).toBeUndefined();
	});

	test.skip("Can add and remove a property", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
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

	test.skip("Can add, get, list, and remove accreditation to attest", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		const property: IProperty = {
			name: "test.property",
			allowedValues: [{ type: PropertyType.String, value: "foo" }],
			condition: {
				type: PropertyType.String,
				value: "bar",
				constraint: PropertyConstraintType.Contains
			}
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);

		debugOnChainLocation(id);
		const accreditation: Omit<IAccreditation, "permissionId"> = {
			accreditedBy: TEST_ADDRESS_2,
			properties: [
				{
					name: "test.property",
					allowedValues: [{ type: PropertyType.String, value: "foo" }],
					condition: {
						type: PropertyType.String,
						value: "foo",
						constraint: PropertyConstraintType.Contains
					}
				}
			]
		};
		const accId = await connector.accreditationToAttestAdd(TEST_USER_IDENTITY, id, accreditation);

		const fed = await connector.federationGet(id);
		expect(fed).toEqual({
			id,
			governance: {
				id: expect.any(String),
				accreditationsToAccredit: {
					[TEST_ADDRESS_1]: []
				},
				accreditationsToAttest: {
					[TEST_ADDRESS_1]: [],
					[TEST_ADDRESS_2]: [
						{
							accreditedBy: TEST_ADDRESS_1,
							permissionId: expect.any(String),
							properties: [
								{
									name: "test.property",
									allowedValues: [
										{
											type: "String",
											value: "foo"
										}
									],
									condition: {
										type: PropertyType.String,
										value: "foo",
										constraint: PropertyConstraintType.Contains
									}
								}
							]
						}
					]
				},
				properties: [
					{
						name: "test.property",
						allowedValues: [{ type: PropertyType.String, value: "foo" }],
						condition: {
							type: PropertyType.String,
							value: "bar",
							constraint: PropertyConstraintType.Contains
						}
					}
				]
			},
			revokedRootAuthorities: [],
			rootAuthorities: [{ id: expect.any(String), accountId: TEST_ADDRESS_1 }]
		});

		const fetched = await connector.accreditationToAttestGet(id, TEST_ADDRESS_1, accId);
		expect(fetched).toBeDefined();
		expect(fetched.permissionId).toBe(accId);
		const list = await connector.accreditationsToAttestGet(id, TEST_ADDRESS_1);
		expect(list.some(a => a.permissionId === accId)).toBe(true);
		await connector.accreditationToAttestRemove(TEST_USER_IDENTITY, id, TEST_ADDRESS_1, accId);
		const listAfter = await connector.accreditationsToAttestGet(id, TEST_ADDRESS_1);
		expect(listAfter.some(a => a.permissionId === accId)).toBe(false);
	});

	test.skip("Can add, get, list, and remove accreditation to accredit", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
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

	test.skip("Can validate a property", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
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

	test.skip("Can fail to validate a property", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
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

	test.skip("Can validate properties", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		const property1: IProperty = {
			name: "test.property1",
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property1);
		const property2: IProperty = {
			name: "test.property2",
			allowedValues: [{ type: PropertyType.String, value: "bar" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property2);

		await connector.accreditationToAttestAdd(TEST_USER_IDENTITY, id, {
			accreditedBy: TEST_ADDRESS_1,
			properties: [
				{ name: "test.property1", allowedValues: [{ type: PropertyType.String, value: "foo" }] },
				{ name: "test.property2", allowedValues: [{ type: PropertyType.String, value: "bar" }] }
			]
		});

		const result = await connector.propertiesValidate(id, TEST_ADDRESS_1, {
			"test.property1": { type: PropertyType.String, value: "foo" },
			"test.property2": { type: PropertyType.String, value: "bar" }
		});
		expect(result).toBe(true);
	});

	test.skip("Can fail to validate properties", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		const property1: IProperty = {
			name: "test.property1",
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property1);
		const property2: IProperty = {
			name: "test.property2",
			allowedValues: [{ type: PropertyType.String, value: "bar" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property2);

		await connector.accreditationToAttestAdd(TEST_USER_IDENTITY, id, {
			accreditedBy: TEST_ADDRESS_1,
			properties: [
				{ name: "test.property1", allowedValues: [{ type: PropertyType.String, value: "foo" }] },
				{ name: "test.property2", allowedValues: [{ type: PropertyType.String, value: "bar" }] }
			]
		});

		const result = await connector.propertiesValidate(id, TEST_ADDRESS_1, {
			"test.property1": { type: PropertyType.String, value: "foo" },
			"test.property2": { type: PropertyType.String, value: "barbar" }
		});
		expect(result).toBe(false);
	});

	test.skip("Can add property with only condition", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		const property: IProperty = {
			name: "test.condition",
			condition: {
				constraint: PropertyConstraintType.Contains,
				value: "abc",
				type: PropertyType.String
			}
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		const hierarchies = await connector.federationGet(id);
		expect(hierarchies.governance?.properties.some(p => p.name === property.name)).toBe(true);
	});

	test.skip("Can add property with allowedValues and condition", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		const property: IProperty = {
			name: "test.combined",
			allowedValues: [{ type: PropertyType.String, value: "foo" }],
			condition: {
				constraint: PropertyConstraintType.Contains,
				value: "foo",
				type: PropertyType.String
			}
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		const hierarchies = await connector.federationGet(id);
		expect(hierarchies.governance?.properties.some(p => p.name === property.name)).toBe(true);
	});

	test.skip("Can add property with only timespan", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		const property: IProperty = {
			name: "test.timespan",
			timespan: { validFrom: Date.now().toString(), validTo: (Date.now() + 10000).toString() }
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		const hierarchies = await connector.federationGet(id);
		expect(hierarchies.governance?.properties.some(p => p.name === property.name)).toBe(true);
	});

	test.skip("Removing non-existent property throws propertyRemoveFailed with inner wrongFederation", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		await expect(
			connector.propertyRemove(TEST_USER_IDENTITY, id, "does.not.exist")
		).rejects.toMatchObject({
			message: expect.stringMatching(/propertyRemoveFailed/),
			cause: expect.objectContaining({
				message: expect.stringMatching(/propertyNotFound/)
			})
		});
	});

	test.skip("Adding property with duplicate name overwrites or fails gracefully", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		const property: IProperty = {
			name: "test.duplicate",
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		// Try to add again
		await expect(connector.propertyAdd(TEST_USER_IDENTITY, id, property)).rejects.toThrow();
	});

	test.skip("Adding property with invalid PropertyType throws", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		// purposely using invalid type, cast to IProperty to bypass TS
		const property = {
			name: "test.invalidtype",
			allowedValues: [{ type: "InvalidType", value: "foo" }]
		} as unknown as IProperty;
		await expect(connector.propertyAdd(TEST_USER_IDENTITY, id, property)).rejects.toThrow();
	});

	test.skip("Adding authority with invalid identity throws", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		await expect(connector.authorityAdd("", id, TEST_ADDRESS_2)).rejects.toThrow();
	});

	test.skip("Removing authority with invalid identity throws", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		await expect(connector.authorityRemove("", id, TEST_ADDRESS_2)).rejects.toThrow();
	});

	test.skip("Adding accreditation with unknown property throws", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
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

	test.skip("Validating property for account with no accreditations returns false", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		const property: IProperty = {
			name: "test.noacc",
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		const result = await connector.propertyValidate(id, TEST_ADDRESS_2, "test.noacc", {
			type: PropertyType.String,
			value: "foo"
		});
		expect(result).toBe(false);
	});

	test.skip("Adding property with empty allowedValues array allows any value", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		const property: IProperty = {
			name: "test.emptyallowed",
			allowedValues: []
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		const hierarchies = await connector.federationGet(id);
		expect(hierarchies.governance?.properties.some(p => p.name === property.name)).toBe(true);
	});

	test.skip("Adding property with missing name throws", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		// purposely missing name, cast to IProperty to bypass TS
		const property = {
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		} as unknown as IProperty;
		await expect(connector.propertyAdd(TEST_USER_IDENTITY, id, property)).rejects.toThrow();
	});

	test.skip("Removing authority that does not exist throws", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		debugOnChainLocation(id);
		await expect(
			connector.authorityRemove(
				TEST_USER_IDENTITY,
				id,
				"0x6d38355dd61cd3257e8b403f5d81821caa86e21621451215ee35f5063769264a"
			)
		).rejects.toThrow();
	});
});
