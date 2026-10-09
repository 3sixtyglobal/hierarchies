// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Urn } from "@3sixty/core";
import {
	PropertyConstraintType,
	PropertyType,
	type IAccreditation,
	type IProperty
} from "@3sixty/hierarchies-models";
import { TEST_ADDRESS_1, TEST_ADDRESS_2, TEST_USER_IDENTITY } from "./setupTestEnv.js";
import { EntityStorageHierarchiesConnector } from "../src/entityStorageHierarchiesConnector.js";

let connector: EntityStorageHierarchiesConnector;

function logCreatedFederationLocation(id: string): void {
	console.debug(`Created federation with id: ${id}`);
}

describe("EntityStorageHierarchiesConnector", () => {
	beforeEach(() => {
		connector = new EntityStorageHierarchiesConnector();
	});

	test("Can create the service", () => {
		expect(connector.className()).toBe("EntityStorageHierarchiesConnector");
	});

	test("Can create a federation", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
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
		logCreatedFederationLocation(id);

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
		logCreatedFederationLocation(id);
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
		logCreatedFederationLocation(id);
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

	test("Removing non-existent property is handled gracefully", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
		let errorThrown = false;
		try {
			await connector.propertyRemove(TEST_USER_IDENTITY, id, "does.not.exist");
		} catch {
			errorThrown = true;
		}

		if (!errorThrown) {
			const federation = await connector.federationGet(id);
			expect(federation.governance.properties.some(p => p.name === "does.not.exist")).toBe(false);
		}
	});

	test("Can add, get, list, and remove accreditation to attest", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
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
		logCreatedFederationLocation(id);
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
		logCreatedFederationLocation(id);
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
		logCreatedFederationLocation(id);
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
		logCreatedFederationLocation(id);
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
		logCreatedFederationLocation(id);
		const property: IProperty = {
			name: "test.duplicate",
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		await expect(connector.propertyAdd(TEST_USER_IDENTITY, id, property)).rejects.toThrow();
	});

	test("Adding property with invalid PropertyType throws", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
		// purposely using invalid type, cast to IProperty to bypass TS
		const property = {
			name: "test.invalidtype",
			allowedValues: [{ type: "InvalidType", value: "foo" }]
		} as unknown as IProperty;
		await expect(connector.propertyAdd(TEST_USER_IDENTITY, id, property)).rejects.toThrow();
	});

	test("Adding authority with invalid identity throws", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
		await expect(connector.authorityAdd("", id, TEST_ADDRESS_2)).rejects.toThrow();
	});

	test("Removing authority with invalid identity throws", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
		await expect(connector.authorityRemove("", id, TEST_ADDRESS_2)).rejects.toThrow();
	});

	test("Adding property with missing name throws", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
		// purposely missing name, cast to IProperty to bypass TS
		const property = {
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		} as unknown as IProperty;
		await expect(connector.propertyAdd(TEST_USER_IDENTITY, id, property)).rejects.toThrow();
	});

	test("Removing authority that does not exist throws", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
		await expect(
			connector.authorityRemove(TEST_USER_IDENTITY, id, "nonexistent-authority")
		).rejects.toThrow();
	});

	test("Can get a property", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
		const property: IProperty = {
			name: "test.property",
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		const fetched = await connector.propertyGet(id, property.name);
		expect(fetched).toBeDefined();
		expect(fetched.name).toBe(property.name);
		expect(fetched.allowedValues).toEqual(property.allowedValues);
	});

	test("Can get all properties", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
		const property1: IProperty = {
			name: "test.property1",
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		};
		const property2: IProperty = {
			name: "test.property2",
			allowedValues: [{ type: PropertyType.String, value: "bar" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property1);
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property2);
		const properties = await connector.propertiesGet(id);
		expect(properties.length).toBe(2);
		expect(properties.some(p => p.name === "test.property1")).toBe(true);
		expect(properties.some(p => p.name === "test.property2")).toBe(true);
	});

	test("Can get all properties including revoked", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
		const property: IProperty = {
			name: "test.revoked",
			allowedValues: [{ type: PropertyType.String, value: "foo" }]
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		await connector.propertyRemove(TEST_USER_IDENTITY, id, property.name);

		const withoutRevoked = await connector.propertiesGet(id);
		expect(withoutRevoked.length).toBe(0);

		const withRevoked = await connector.propertiesGet(id, { includeRevokedProperties: true });
		expect(withRevoked.length).toBe(1);
		expect(withRevoked[0].name).toBe(property.name);
	});

	test("Can validate properties", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
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

	test("Can fail to validate properties", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
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

	test("Can add property with only condition", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
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

	test("Can add property with allowedValues and condition", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
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

	test("Can add property with only timespan", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
		const property: IProperty = {
			name: "test.timespan",
			timespan: {
				validFrom: (Date.now() - 10000).toString(),
				validTo: (Date.now() + 10000).toString()
			}
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		const hierarchies = await connector.federationGet(id);
		expect(hierarchies.governance?.properties.some(p => p.name === property.name)).toBe(true);
	});

	test("Adding property with empty allowedValues allows any value", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
		const property: IProperty = {
			name: "test.emptyallowed",
			allowedValues: []
		};
		await connector.propertyAdd(TEST_USER_IDENTITY, id, property);
		const hierarchies = await connector.federationGet(id);
		expect(hierarchies.governance?.properties.some(p => p.name === property.name)).toBe(true);
	});

	test("Validating property for account with no accreditations returns false", async () => {
		const id = await connector.federationCreate(TEST_USER_IDENTITY);
		logCreatedFederationLocation(id);
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
});
