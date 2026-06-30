// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GuardError } from "@twin.org/core";
import type {
	IAccreditation,
	IFederation,
	IProperty,
	IPropertyValue
} from "@twin.org/hierarchies-models";
import { PropertyType } from "@twin.org/hierarchies-models";
import { HttpMethod } from "@twin.org/web";
import { HierarchiesRestClient } from "../src/hierarchiesRestClient.js";
import {
	createdResponse,
	jsonResponse,
	noContentResponse,
	setupFetchMock,
	teardownFetchMock
} from "./helpers/restClientTestHelpers.js";

// OpenAPI spec: ../../hierarchies-service/docs/open-api/spec.json
const ENDPOINT = "http://localhost:8080";
const PREFIX = "hierarchies";

const FEDERATION_URN = "urn:fed:federation001";
const ACCREDITED_BY_URN = "urn:fed:accreditedBy001";
const PERMISSION_ID = "perm001";
const ACCOUNT_ID = "account001";
const PROPERTY_NAME = "propertyA";

const LOCATION_FEDERATION = `${ENDPOINT}/${PREFIX}/new-federation-id`;
const LOCATION_AUTHORITY = `${ENDPOINT}/${PREFIX}/new-authority-id`;
const LOCATION_ACCREDITATION = `${ENDPOINT}/${PREFIX}/new-accreditation-id`;

const TEST_PROPERTY_VALUE: IPropertyValue = {
	type: PropertyType.String,
	value: "testValue"
};

const TEST_PROPERTY: IProperty = {
	name: PROPERTY_NAME,
	allowedValues: [TEST_PROPERTY_VALUE]
};

const TEST_ACCREDITATION: IAccreditation = {
	permissionId: PERMISSION_ID,
	accreditedBy: ACCREDITED_BY_URN,
	properties: [TEST_PROPERTY]
};

const TEST_ACCREDITATION_CREATE: Omit<IAccreditation, "permissionId"> = {
	accreditedBy: ACCREDITED_BY_URN,
	properties: [TEST_PROPERTY]
};

const TEST_FEDERATION: IFederation = {
	id: FEDERATION_URN,
	rootAuthorities: [{ id: "urn:fed:ra001", accountId: "ra-account-001" }],
	revokedRootAuthorities: [],
	governance: {
		id: "urn:fed:gov001",
		accreditationsToAccredit: {},
		accreditationsToAttest: {},
		properties: [TEST_PROPERTY]
	}
};

const fetchMock = vi.fn();

describe("HierarchiesRestClient", () => {
	let client: HierarchiesRestClient;

	beforeEach(() => {
		setupFetchMock(fetchMock);
		client = new HierarchiesRestClient({ endpoint: ENDPOINT });
	});

	afterEach(() => {
		teardownFetchMock(fetchMock);
	});

	describe("federationCreate", () => {
		test("sends POST to /{prefix}", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION_FEDERATION));

			await client.federationCreate(["urn:ra:root001"]);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}`);
			expect(options.method).toBe(HttpMethod.POST);
		});

		test("sends rootAuthorities and namespace in the request body", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION_FEDERATION));

			await client.federationCreate(["urn:ra:root001"], "my-namespace");

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body.rootAuthorities).toEqual(["urn:ra:root001"]);
			expect(body.namespace).toBe("my-namespace");
		});

		test("returns the Location header value as the new federation id", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION_FEDERATION));

			const id = await client.federationCreate();

			expect(id).toBe("new-federation-id");
		});
	});

	describe("federationGet", () => {
		test("throws when federationId is not a URN", async () => {
			await expect(client.federationGet("not-a-urn")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("sends GET to /{prefix}/:federationId", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_FEDERATION));

			await client.federationGet(FEDERATION_URN);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toContain(`${ENDPOINT}/${PREFIX}/${FEDERATION_URN}`);
			expect(options.method).toBe(HttpMethod.GET);
		});

		test("includes includeRevokedProperties as a query parameter when true", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_FEDERATION));

			await client.federationGet(FEDERATION_URN, { includeRevokedProperties: true });

			const [url] = fetchMock.mock.calls[0];
			expect(url).toContain("includeRevokedProperties=true");
		});

		test("returns the federation from the response body", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_FEDERATION));

			const result = await client.federationGet(FEDERATION_URN);

			expect(result).toEqual(TEST_FEDERATION);
		});
	});

	describe("authorityAdd", () => {
		test("throws when federationId is not a URN", async () => {
			await expect(client.authorityAdd("not-a-urn", ACCOUNT_ID)).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("throws when accountId is empty", async () => {
			await expect(client.authorityAdd(FEDERATION_URN, "")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends POST to /{prefix}/:federationId/authorities", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION_AUTHORITY));

			await client.authorityAdd(FEDERATION_URN, ACCOUNT_ID);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/${FEDERATION_URN}/authorities`);
			expect(options.method).toBe(HttpMethod.POST);
		});

		test("sends accountId in the request body", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION_AUTHORITY));

			await client.authorityAdd(FEDERATION_URN, ACCOUNT_ID);

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body.accountId).toBe(ACCOUNT_ID);
		});

		test("returns the Location header value as the new authority id", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION_AUTHORITY));

			const id = await client.authorityAdd(FEDERATION_URN, ACCOUNT_ID);

			expect(id).toBe("new-authority-id");
		});
	});

	describe("authorityRemove", () => {
		test("throws when federationId is not a URN", async () => {
			await expect(client.authorityRemove("not-a-urn", ACCOUNT_ID)).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("throws when accountId is empty", async () => {
			await expect(client.authorityRemove(FEDERATION_URN, "")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends DELETE to /{prefix}/:federationId/authorities/:accountId", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await client.authorityRemove(FEDERATION_URN, ACCOUNT_ID);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/${FEDERATION_URN}/authorities/${ACCOUNT_ID}`);
			expect(options.method).toBe(HttpMethod.DELETE);
		});

		test("resolves without a return value", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await expect(client.authorityRemove(FEDERATION_URN, ACCOUNT_ID)).resolves.toBeUndefined();
		});
	});

	describe("propertyAdd", () => {
		test("throws when federationId is not a URN", async () => {
			await expect(client.propertyAdd("not-a-urn", TEST_PROPERTY)).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("sends POST to /{prefix}/:federationId/properties", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await client.propertyAdd(FEDERATION_URN, TEST_PROPERTY);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/${FEDERATION_URN}/properties`);
			expect(options.method).toBe(HttpMethod.POST);
		});

		test("sends the property as the request body", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await client.propertyAdd(FEDERATION_URN, TEST_PROPERTY);

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body.name).toBe(PROPERTY_NAME);
		});

		test("resolves without a return value", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await expect(client.propertyAdd(FEDERATION_URN, TEST_PROPERTY)).resolves.toBeUndefined();
		});
	});

	describe("propertyRemove", () => {
		test("throws when federationId is not a URN", async () => {
			await expect(client.propertyRemove("not-a-urn", PROPERTY_NAME)).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("throws when propertyName is empty", async () => {
			await expect(client.propertyRemove(FEDERATION_URN, "")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends DELETE to /{prefix}/:federationId/properties/:propertyName", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await client.propertyRemove(FEDERATION_URN, PROPERTY_NAME);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/${FEDERATION_URN}/properties/${PROPERTY_NAME}`);
			expect(options.method).toBe(HttpMethod.DELETE);
		});

		test("resolves without a return value", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await expect(client.propertyRemove(FEDERATION_URN, PROPERTY_NAME)).resolves.toBeUndefined();
		});
	});

	describe("propertyGet", () => {
		test("throws when federationId is not a URN", async () => {
			await expect(client.propertyGet("not-a-urn", PROPERTY_NAME)).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("throws when propertyName is empty", async () => {
			await expect(client.propertyGet(FEDERATION_URN, "")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends GET to /{prefix}/:federationId/properties/:propertyName", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_PROPERTY));

			await client.propertyGet(FEDERATION_URN, PROPERTY_NAME);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/${FEDERATION_URN}/properties/${PROPERTY_NAME}`);
			expect(options.method).toBe(HttpMethod.GET);
		});

		test("returns the property from the response body", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_PROPERTY));

			const result = await client.propertyGet(FEDERATION_URN, PROPERTY_NAME);

			expect(result).toEqual(TEST_PROPERTY);
		});
	});

	describe("propertiesGet", () => {
		test("throws when federationId is not a URN", async () => {
			await expect(client.propertiesGet("not-a-urn")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("sends GET to /{prefix}/:federationId/properties", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse([TEST_PROPERTY]));

			await client.propertiesGet(FEDERATION_URN);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toContain(`${ENDPOINT}/${PREFIX}/${FEDERATION_URN}/properties`);
			expect(options.method).toBe(HttpMethod.GET);
		});

		test("includes includeRevokedProperties as a query parameter when true", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse([TEST_PROPERTY]));

			await client.propertiesGet(FEDERATION_URN, { includeRevokedProperties: true });

			const [url] = fetchMock.mock.calls[0];
			expect(url).toContain("includeRevokedProperties=true");
		});

		test("returns the array of properties from the response body", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse([TEST_PROPERTY]));

			const result = await client.propertiesGet(FEDERATION_URN);

			expect(result).toEqual([TEST_PROPERTY]);
		});
	});

	describe("propertyValidate", () => {
		test("throws when federationId is not a URN", async () => {
			await expect(
				client.propertyValidate("not-a-urn", ACCREDITED_BY_URN, PROPERTY_NAME, TEST_PROPERTY_VALUE)
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("throws when accreditedById is empty", async () => {
			await expect(
				client.propertyValidate(FEDERATION_URN, "", PROPERTY_NAME, TEST_PROPERTY_VALUE)
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("throws when propertyName is empty", async () => {
			await expect(
				client.propertyValidate(FEDERATION_URN, ACCREDITED_BY_URN, "", TEST_PROPERTY_VALUE)
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends POST to /{prefix}/:federationId/properties/validate", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse({ valid: true }));

			await client.propertyValidate(
				FEDERATION_URN,
				ACCREDITED_BY_URN,
				PROPERTY_NAME,
				TEST_PROPERTY_VALUE
			);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/${FEDERATION_URN}/properties/validate`);
			expect(options.method).toBe(HttpMethod.POST);
		});

		test("sends accreditedById, propertyName and propertyValue in the request body", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse({ valid: true }));

			await client.propertyValidate(
				FEDERATION_URN,
				ACCREDITED_BY_URN,
				PROPERTY_NAME,
				TEST_PROPERTY_VALUE
			);

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body.accreditedById).toBe(ACCREDITED_BY_URN);
			expect(body.propertyName).toBe(PROPERTY_NAME);
			expect(body.propertyValue).toEqual(TEST_PROPERTY_VALUE);
		});

		test("returns true when the response body indicates valid", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse({ valid: true }));

			const result = await client.propertyValidate(
				FEDERATION_URN,
				ACCREDITED_BY_URN,
				PROPERTY_NAME,
				TEST_PROPERTY_VALUE
			);

			expect(result).toBe(true);
		});

		test("returns false when the response body indicates invalid", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse({ valid: false }));

			const result = await client.propertyValidate(
				FEDERATION_URN,
				ACCREDITED_BY_URN,
				PROPERTY_NAME,
				TEST_PROPERTY_VALUE
			);

			expect(result).toBe(false);
		});
	});

	describe("propertiesValidate", () => {
		test("throws when federationId is not a URN", async () => {
			await expect(
				client.propertiesValidate("not-a-urn", ACCREDITED_BY_URN, {
					[PROPERTY_NAME]: TEST_PROPERTY_VALUE
				})
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("throws when accreditedById is empty", async () => {
			await expect(
				client.propertiesValidate(FEDERATION_URN, "", {
					[PROPERTY_NAME]: TEST_PROPERTY_VALUE
				})
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends POST to /{prefix}/:federationId/properties/validate/batch", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse({ valid: true }));

			await client.propertiesValidate(FEDERATION_URN, ACCREDITED_BY_URN, {
				[PROPERTY_NAME]: TEST_PROPERTY_VALUE
			});

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/${FEDERATION_URN}/properties/validate/batch`);
			expect(options.method).toBe(HttpMethod.POST);
		});

		test("sends accreditedById and propertiesToValidate in the request body", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse({ valid: true }));

			await client.propertiesValidate(FEDERATION_URN, ACCREDITED_BY_URN, {
				[PROPERTY_NAME]: TEST_PROPERTY_VALUE
			});

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body.accreditedById).toBe(ACCREDITED_BY_URN);
			expect(body.propertiesToValidate).toEqual({ [PROPERTY_NAME]: TEST_PROPERTY_VALUE });
		});

		test("returns true when the response body indicates valid", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse({ valid: true }));

			const result = await client.propertiesValidate(FEDERATION_URN, ACCREDITED_BY_URN, {
				[PROPERTY_NAME]: TEST_PROPERTY_VALUE
			});

			expect(result).toBe(true);
		});
	});

	describe("accreditationToAttestAdd", () => {
		test("throws when federationId is not a URN", async () => {
			await expect(
				client.accreditationToAttestAdd("not-a-urn", TEST_ACCREDITATION_CREATE)
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("sends POST to /{prefix}/:federationId/accreditations/attest", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION_ACCREDITATION));

			await client.accreditationToAttestAdd(FEDERATION_URN, TEST_ACCREDITATION_CREATE);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/${FEDERATION_URN}/accreditations/attest`);
			expect(options.method).toBe(HttpMethod.POST);
		});

		test("sends the accreditation as the request body", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION_ACCREDITATION));

			await client.accreditationToAttestAdd(FEDERATION_URN, TEST_ACCREDITATION_CREATE);

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body.accreditedBy).toBe(ACCREDITED_BY_URN);
			expect(body.properties).toEqual([TEST_PROPERTY]);
		});

		test("returns the Location header value as the new accreditation id", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION_ACCREDITATION));

			const id = await client.accreditationToAttestAdd(FEDERATION_URN, TEST_ACCREDITATION_CREATE);

			expect(id).toBe("new-accreditation-id");
		});
	});

	describe("accreditationToAttestRemove", () => {
		test("throws when federationId is not a URN", async () => {
			await expect(
				client.accreditationToAttestRemove("not-a-urn", ACCREDITED_BY_URN, PERMISSION_ID)
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("throws when accreditedById is empty", async () => {
			await expect(
				client.accreditationToAttestRemove(FEDERATION_URN, "", PERMISSION_ID)
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("throws when permissionId is empty", async () => {
			await expect(
				client.accreditationToAttestRemove(FEDERATION_URN, ACCREDITED_BY_URN, "")
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends DELETE to /{prefix}/:federationId/accreditations/attest/:accreditedById/:permissionId", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await client.accreditationToAttestRemove(FEDERATION_URN, ACCREDITED_BY_URN, PERMISSION_ID);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(
				`${ENDPOINT}/${PREFIX}/${FEDERATION_URN}/accreditations/attest/${ACCREDITED_BY_URN}/${PERMISSION_ID}`
			);
			expect(options.method).toBe(HttpMethod.DELETE);
		});

		test("resolves without a return value", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await expect(
				client.accreditationToAttestRemove(FEDERATION_URN, ACCREDITED_BY_URN, PERMISSION_ID)
			).resolves.toBeUndefined();
		});
	});

	describe("accreditationToAttestGet", () => {
		test("throws when federationId is not a URN", async () => {
			await expect(
				client.accreditationToAttestGet("not-a-urn", ACCREDITED_BY_URN, PERMISSION_ID)
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("throws when accreditedById is empty", async () => {
			await expect(
				client.accreditationToAttestGet(FEDERATION_URN, "", PERMISSION_ID)
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("throws when permissionId is empty", async () => {
			await expect(
				client.accreditationToAttestGet(FEDERATION_URN, ACCREDITED_BY_URN, "")
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends GET to /{prefix}/:federationId/accreditations/attest/:accreditedById/:permissionId", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_ACCREDITATION));

			await client.accreditationToAttestGet(FEDERATION_URN, ACCREDITED_BY_URN, PERMISSION_ID);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(
				`${ENDPOINT}/${PREFIX}/${FEDERATION_URN}/accreditations/attest/${ACCREDITED_BY_URN}/${PERMISSION_ID}`
			);
			expect(options.method).toBe(HttpMethod.GET);
		});

		test("returns the accreditation from the response body", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_ACCREDITATION));

			const result = await client.accreditationToAttestGet(
				FEDERATION_URN,
				ACCREDITED_BY_URN,
				PERMISSION_ID
			);

			expect(result).toEqual(TEST_ACCREDITATION);
		});
	});

	describe("accreditationsToAttestGet", () => {
		test("throws when federationId is not a URN", async () => {
			await expect(
				client.accreditationsToAttestGet("not-a-urn", ACCREDITED_BY_URN)
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("throws when accreditedById is empty", async () => {
			await expect(client.accreditationsToAttestGet(FEDERATION_URN, "")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends GET to /{prefix}/:federationId/accreditations/attest/:accreditedById", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse([TEST_ACCREDITATION]));

			await client.accreditationsToAttestGet(FEDERATION_URN, ACCREDITED_BY_URN);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(
				`${ENDPOINT}/${PREFIX}/${FEDERATION_URN}/accreditations/attest/${ACCREDITED_BY_URN}`
			);
			expect(options.method).toBe(HttpMethod.GET);
		});

		test("returns the array of accreditations from the response body", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse([TEST_ACCREDITATION]));

			const result = await client.accreditationsToAttestGet(FEDERATION_URN, ACCREDITED_BY_URN);

			expect(result).toEqual([TEST_ACCREDITATION]);
		});
	});

	describe("accreditationToAccreditAdd", () => {
		test("throws when federationId is not a URN", async () => {
			await expect(
				client.accreditationToAccreditAdd("not-a-urn", TEST_ACCREDITATION_CREATE)
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("sends POST to /{prefix}/:federationId/accreditations/accredit", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION_ACCREDITATION));

			await client.accreditationToAccreditAdd(FEDERATION_URN, TEST_ACCREDITATION_CREATE);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/${FEDERATION_URN}/accreditations/accredit`);
			expect(options.method).toBe(HttpMethod.POST);
		});

		test("sends the accreditation as the request body", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION_ACCREDITATION));

			await client.accreditationToAccreditAdd(FEDERATION_URN, TEST_ACCREDITATION_CREATE);

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body.accreditedBy).toBe(ACCREDITED_BY_URN);
			expect(body.properties).toEqual([TEST_PROPERTY]);
		});

		test("returns the Location header value as the new accreditation id", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION_ACCREDITATION));

			const id = await client.accreditationToAccreditAdd(FEDERATION_URN, TEST_ACCREDITATION_CREATE);

			expect(id).toBe("new-accreditation-id");
		});
	});

	describe("accreditationToAccreditRemove", () => {
		test("throws when federationId is not a URN", async () => {
			await expect(
				client.accreditationToAccreditRemove("not-a-urn", ACCREDITED_BY_URN, PERMISSION_ID)
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("throws when accreditedById is empty", async () => {
			await expect(
				client.accreditationToAccreditRemove(FEDERATION_URN, "", PERMISSION_ID)
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("throws when permissionId is empty", async () => {
			await expect(
				client.accreditationToAccreditRemove(FEDERATION_URN, ACCREDITED_BY_URN, "")
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends DELETE to /{prefix}/:federationId/accreditations/accredit/:accreditedById/:permissionId", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await client.accreditationToAccreditRemove(FEDERATION_URN, ACCREDITED_BY_URN, PERMISSION_ID);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(
				`${ENDPOINT}/${PREFIX}/${FEDERATION_URN}/accreditations/accredit/${ACCREDITED_BY_URN}/${PERMISSION_ID}`
			);
			expect(options.method).toBe(HttpMethod.DELETE);
		});

		test("resolves without a return value", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await expect(
				client.accreditationToAccreditRemove(FEDERATION_URN, ACCREDITED_BY_URN, PERMISSION_ID)
			).resolves.toBeUndefined();
		});
	});

	describe("accreditationToAccreditGet", () => {
		test("throws when federationId is not a URN", async () => {
			await expect(
				client.accreditationToAccreditGet("not-a-urn", ACCREDITED_BY_URN, PERMISSION_ID)
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("throws when accreditedById is empty", async () => {
			await expect(
				client.accreditationToAccreditGet(FEDERATION_URN, "", PERMISSION_ID)
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("throws when permissionId is empty", async () => {
			await expect(
				client.accreditationToAccreditGet(FEDERATION_URN, ACCREDITED_BY_URN, "")
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends GET to /{prefix}/:federationId/accreditations/accredit/:accreditedById/:permissionId", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_ACCREDITATION));

			await client.accreditationToAccreditGet(FEDERATION_URN, ACCREDITED_BY_URN, PERMISSION_ID);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(
				`${ENDPOINT}/${PREFIX}/${FEDERATION_URN}/accreditations/accredit/${ACCREDITED_BY_URN}/${PERMISSION_ID}`
			);
			expect(options.method).toBe(HttpMethod.GET);
		});

		test("returns the accreditation from the response body", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_ACCREDITATION));

			const result = await client.accreditationToAccreditGet(
				FEDERATION_URN,
				ACCREDITED_BY_URN,
				PERMISSION_ID
			);

			expect(result).toEqual(TEST_ACCREDITATION);
		});
	});

	describe("accreditationsToAccreditGet", () => {
		test("throws when federationId is not a URN", async () => {
			await expect(
				client.accreditationsToAccreditGet("not-a-urn", ACCREDITED_BY_URN)
			).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("throws when accreditedById is empty", async () => {
			await expect(client.accreditationsToAccreditGet(FEDERATION_URN, "")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends GET to /{prefix}/:federationId/accreditations/accredit/:accreditedById", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse([TEST_ACCREDITATION]));

			await client.accreditationsToAccreditGet(FEDERATION_URN, ACCREDITED_BY_URN);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(
				`${ENDPOINT}/${PREFIX}/${FEDERATION_URN}/accreditations/accredit/${ACCREDITED_BY_URN}`
			);
			expect(options.method).toBe(HttpMethod.GET);
		});

		test("returns the array of accreditations from the response body", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse([TEST_ACCREDITATION]));

			const result = await client.accreditationsToAccreditGet(FEDERATION_URN, ACCREDITED_BY_URN);

			expect(result).toEqual([TEST_ACCREDITATION]);
		});
	});
});
