// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseRestClient } from "@twin.org/api-core";
import {
	HttpHeaderHelper,
	type IBaseRestClientConfig,
	type ICreatedResponse,
	type INoContentResponse
} from "@twin.org/api-models";
import { Coerce, Guards, Urn } from "@twin.org/core";
import type {
	IAccreditation,
	IFederation,
	IHierarchiesAccreditationAddRequest,
	IHierarchiesAccreditationGetRequest,
	IHierarchiesAccreditationGetResponse,
	IHierarchiesAccreditationRemoveRequest,
	IHierarchiesAccreditationsGetRequest,
	IHierarchiesAccreditationsGetResponse,
	IHierarchiesAuthorityAddRequest,
	IHierarchiesAuthorityRemoveRequest,
	IHierarchiesComponent,
	IHierarchiesFederationCreateRequest,
	IHierarchiesFederationGetRequest,
	IHierarchiesFederationGetResponse,
	IHierarchiesPropertiesGetRequest,
	IHierarchiesPropertiesGetResponse,
	IHierarchiesPropertiesValidateRequest,
	IHierarchiesPropertiesValidateResponse,
	IHierarchiesPropertyAddRequest,
	IHierarchiesPropertyGetRequest,
	IHierarchiesPropertyGetResponse,
	IHierarchiesPropertyRemoveRequest,
	IHierarchiesPropertyValidateRequest,
	IHierarchiesPropertyValidateResponse,
	IProperty,
	IPropertyValue
} from "@twin.org/hierarchies-models";
import { nameof } from "@twin.org/nameof";
import { HttpMethod } from "@twin.org/web";

/**
 * Client for performing hierarchies operations through to REST endpoints.
 */
export class HierarchiesRestClient extends BaseRestClient implements IHierarchiesComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<HierarchiesRestClient>();

	/**
	 * Create a new instance of HierarchiesRestClient.
	 * @param config The configuration for the client.
	 */
	constructor(config: IBaseRestClientConfig) {
		super(nameof<HierarchiesRestClient>(), config, "hierarchies");
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return HierarchiesRestClient.CLASS_NAME;
	}

	/**
	 * Create a new federation.
	 * @param rootAuthorities The root authorities to be included in the federation.
	 * @param namespace The namespace of the connector to use for the federation, defaults to component configured namespace.
	 * @returns The ID of the created federation.
	 */
	public async federationCreate(rootAuthorities?: string[], namespace?: string): Promise<string> {
		const response = await this.fetch<IHierarchiesFederationCreateRequest, ICreatedResponse>(
			"/",
			HttpMethod.POST,
			{
				body: {
					rootAuthorities,
					namespace
				}
			}
		);
		return HttpHeaderHelper.extractId(response.headers);
	}

	/**
	 * Get a federation by its ID.
	 * @param federationId The ID of the federation to retrieve.
	 * @param options Options for retrieving the federation.
	 * @param options.includeRevokedProperties Whether to include revoked properties in the retrieved federation, defaults to false.
	 * @returns The federation object.
	 */
	public async federationGet(
		federationId: string,
		options?: { includeRevokedProperties?: boolean }
	): Promise<IFederation> {
		Urn.guard(HierarchiesRestClient.CLASS_NAME, nameof(federationId), federationId);
		const response = await this.fetch<
			IHierarchiesFederationGetRequest,
			IHierarchiesFederationGetResponse
		>("/:federationId", HttpMethod.GET, {
			pathParams: { federationId },
			query: { includeRevokedProperties: Coerce.string(options?.includeRevokedProperties) }
		});
		return response.body;
	}

	/**
	 * Add a new authority to a federation.
	 * @param federationId The ID of the federation.
	 * @param accountId The account ID of the authority to add.
	 * @returns The ID of the added authority.
	 */
	public async authorityAdd(federationId: string, accountId: string): Promise<string> {
		Urn.guard(HierarchiesRestClient.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(HierarchiesRestClient.CLASS_NAME, nameof(accountId), accountId);
		const response = await this.fetch<IHierarchiesAuthorityAddRequest, ICreatedResponse>(
			"/:federationId/authorities",
			HttpMethod.POST,
			{
				pathParams: { federationId },
				body: { accountId }
			}
		);
		return HttpHeaderHelper.extractId(response.headers);
	}

	/**
	 * Remove an authority from a federation.
	 * @param federationId The ID of the federation.
	 * @param accountId The account ID of the authority to remove.
	 * @returns A promise that resolves when the authority has been removed.
	 */
	public async authorityRemove(federationId: string, accountId: string): Promise<void> {
		Urn.guard(HierarchiesRestClient.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(HierarchiesRestClient.CLASS_NAME, nameof(accountId), accountId);
		await this.fetch<IHierarchiesAuthorityRemoveRequest, INoContentResponse>(
			"/:federationId/authorities/:accountId",
			HttpMethod.DELETE,
			{
				pathParams: { federationId, accountId }
			}
		);
	}

	/**
	 * Add a property to a federation.
	 * @param federationId The ID of the federation.
	 * @param property The property to add.
	 * @returns A promise that resolves when the property has been added.
	 */
	public async propertyAdd(federationId: string, property: IProperty): Promise<void> {
		Urn.guard(HierarchiesRestClient.CLASS_NAME, nameof(federationId), federationId);
		Guards.object(HierarchiesRestClient.CLASS_NAME, nameof(property), property);

		await this.fetch<IHierarchiesPropertyAddRequest, INoContentResponse>(
			"/:federationId/properties",
			HttpMethod.POST,
			{
				pathParams: { federationId },
				body: property
			}
		);
	}

	/**
	 * Remove a property from a federation.
	 * @param federationId The ID of the federation.
	 * @param propertyName The name of the property to remove.
	 * @returns A promise that resolves when the property has been removed.
	 */
	public async propertyRemove(federationId: string, propertyName: string): Promise<void> {
		Urn.guard(HierarchiesRestClient.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(HierarchiesRestClient.CLASS_NAME, nameof(propertyName), propertyName);
		await this.fetch<IHierarchiesPropertyRemoveRequest, INoContentResponse>(
			"/:federationId/properties/:propertyName",
			HttpMethod.DELETE,
			{
				pathParams: { federationId, propertyName }
			}
		);
	}

	/**
	 * Get a property from a federation.
	 * @param federationId The ID of the federation.
	 * @param propertyName The name of the property to get.
	 * @returns The property object.
	 */
	public async propertyGet(federationId: string, propertyName: string): Promise<IProperty> {
		Urn.guard(HierarchiesRestClient.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(HierarchiesRestClient.CLASS_NAME, nameof(propertyName), propertyName);
		const response = await this.fetch<
			IHierarchiesPropertyGetRequest,
			IHierarchiesPropertyGetResponse
		>("/:federationId/properties/:propertyName", HttpMethod.GET, {
			pathParams: { federationId, propertyName }
		});
		return response.body;
	}

	/**
	 * Get all properties from a federation.
	 * @param federationId The ID of the federation.
	 * @param options Optional parameters for the request.
	 * @param options.includeRevokedProperties Whether to include revoked properties in the retrieved properties, defaults to false.
	 * @returns The array of properties.
	 */
	public async propertiesGet(
		federationId: string,
		options?: { includeRevokedProperties?: boolean }
	): Promise<IProperty[]> {
		Urn.guard(HierarchiesRestClient.CLASS_NAME, nameof(federationId), federationId);
		const response = await this.fetch<
			IHierarchiesPropertiesGetRequest,
			IHierarchiesPropertiesGetResponse
		>("/:federationId/properties", HttpMethod.GET, {
			pathParams: { federationId },
			query: { includeRevokedProperties: Coerce.string(options?.includeRevokedProperties) }
		});
		return response.body;
	}

	/**
	 * Validate a property for a federation.
	 * @param federationId The ID of the federation.
	 * @param accreditedById The ID of the entity that granted the accreditation.
	 * @param propertyName The name of the property to validate.
	 * @param propertyValue The value of the property to validate.
	 * @returns True if valid, false otherwise.
	 */
	public async propertyValidate(
		federationId: string,
		accreditedById: string,
		propertyName: string,
		propertyValue: IPropertyValue
	): Promise<boolean> {
		Urn.guard(HierarchiesRestClient.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(HierarchiesRestClient.CLASS_NAME, nameof(accreditedById), accreditedById);
		Guards.stringValue(HierarchiesRestClient.CLASS_NAME, nameof(propertyName), propertyName);
		Guards.object(HierarchiesRestClient.CLASS_NAME, nameof(propertyValue), propertyValue);
		const response = await this.fetch<
			IHierarchiesPropertyValidateRequest,
			IHierarchiesPropertyValidateResponse
		>("/:federationId/properties/validate", HttpMethod.POST, {
			pathParams: { federationId },
			body: { accreditedById, propertyName, propertyValue }
		});
		return response.body.valid;
	}

	/**
	 * Validate multiple properties for a federation.
	 * @param federationId The ID of the federation.
	 * @param accreditedById The ID of the entity that granted the accreditations.
	 * @param propertiesToValidate The properties to validate.
	 * @returns True if all are valid, false otherwise.
	 */
	public async propertiesValidate(
		federationId: string,
		accreditedById: string,
		propertiesToValidate: { [propertyName: string]: IPropertyValue }
	): Promise<boolean> {
		Urn.guard(HierarchiesRestClient.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(HierarchiesRestClient.CLASS_NAME, nameof(accreditedById), accreditedById);
		Guards.object(
			HierarchiesRestClient.CLASS_NAME,
			nameof(propertiesToValidate),
			propertiesToValidate
		);
		const response = await this.fetch<
			IHierarchiesPropertiesValidateRequest,
			IHierarchiesPropertiesValidateResponse
		>("/:federationId/properties/validate/batch", HttpMethod.POST, {
			pathParams: { federationId },
			body: { accreditedById, propertiesToValidate }
		});
		return response.body.valid;
	}

	/**
	 * Add an accreditation to attest to a federation.
	 * @param federationId The ID of the federation.
	 * @param accreditation The accreditation to add.
	 * @returns The ID of the added accreditation.
	 */
	public async accreditationToAttestAdd(
		federationId: string,
		accreditation: Omit<IAccreditation, "permissionId">
	): Promise<string> {
		Urn.guard(HierarchiesRestClient.CLASS_NAME, nameof(federationId), federationId);
		Guards.object(HierarchiesRestClient.CLASS_NAME, nameof(accreditation), accreditation);
		const response = await this.fetch<IHierarchiesAccreditationAddRequest, ICreatedResponse>(
			"/:federationId/accreditations/attest",
			HttpMethod.POST,
			{
				pathParams: { federationId },
				body: accreditation
			}
		);
		return HttpHeaderHelper.extractId(response.headers);
	}

	/**
	 * Remove an accreditation to attest from a federation.
	 * @param federationId The ID of the federation.
	 * @param accreditedById The ID of the entity that granted the accreditation.
	 * @param permissionId The ID of the accreditation to remove.
	 * @returns A promise that resolves when the accreditation has been removed.
	 */
	public async accreditationToAttestRemove(
		federationId: string,
		accreditedById: string,
		permissionId: string
	): Promise<void> {
		Urn.guard(HierarchiesRestClient.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(HierarchiesRestClient.CLASS_NAME, "accreditedById", accreditedById);
		Guards.stringValue(HierarchiesRestClient.CLASS_NAME, nameof(permissionId), permissionId);
		await this.fetch<IHierarchiesAccreditationRemoveRequest, INoContentResponse>(
			"/:federationId/accreditations/attest/:accreditedById/:permissionId",
			HttpMethod.DELETE,
			{
				pathParams: { federationId, accreditedById, permissionId }
			}
		);
	}

	/**
	 * Get an accreditation to attest from a federation.
	 * @param federationId The ID of the federation.
	 * @param accreditedById The ID of the entity that granted the accreditation.
	 * @param permissionId The ID of the accreditation to get.
	 * @returns The accreditation object.
	 */
	public async accreditationToAttestGet(
		federationId: string,
		accreditedById: string,
		permissionId: string
	): Promise<IAccreditation> {
		Urn.guard(HierarchiesRestClient.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(HierarchiesRestClient.CLASS_NAME, "accreditedById", accreditedById);
		Guards.stringValue(HierarchiesRestClient.CLASS_NAME, "permissionId", permissionId);
		const response = await this.fetch<
			IHierarchiesAccreditationGetRequest,
			IHierarchiesAccreditationGetResponse
		>("/:federationId/accreditations/attest/:accreditedById/:permissionId", HttpMethod.GET, {
			pathParams: { federationId, accreditedById, permissionId }
		});
		return response.body;
	}

	/**
	 * Get all accreditations to attest from a federation.
	 * @param federationId The ID of the federation.
	 * @param accreditedById The ID of the entity that granted the accreditations.
	 * @returns The array of accreditations.
	 */
	public async accreditationsToAttestGet(
		federationId: string,
		accreditedById: string
	): Promise<IAccreditation[]> {
		Urn.guard(HierarchiesRestClient.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(HierarchiesRestClient.CLASS_NAME, "accreditedById", accreditedById);
		const response = await this.fetch<
			IHierarchiesAccreditationsGetRequest,
			IHierarchiesAccreditationsGetResponse
		>("/:federationId/accreditations/attest/:accreditedById", HttpMethod.GET, {
			pathParams: { federationId, accreditedById }
		});
		return response.body;
	}

	/**
	 * Add an accreditation to accredit to a federation.
	 * @param federationId The ID of the federation.
	 * @param accreditation The accreditation to add.
	 * @returns The ID of the added accreditation.
	 */
	public async accreditationToAccreditAdd(
		federationId: string,
		accreditation: Omit<IAccreditation, "permissionId">
	): Promise<string> {
		Urn.guard(HierarchiesRestClient.CLASS_NAME, nameof(federationId), federationId);
		Guards.object(HierarchiesRestClient.CLASS_NAME, "accreditation", accreditation);
		const response = await this.fetch<IHierarchiesAccreditationAddRequest, ICreatedResponse>(
			"/:federationId/accreditations/accredit",
			HttpMethod.POST,
			{
				pathParams: { federationId },
				body: accreditation
			}
		);
		return HttpHeaderHelper.extractId(response.headers);
	}

	/**
	 * Remove an accreditation to accredit from a federation.
	 * @param federationId The ID of the federation.
	 * @param accreditedById The ID of the entity that granted the accreditation.
	 * @param permissionId The ID of the accreditation to remove.
	 * @returns A promise that resolves when the accreditation has been removed.
	 */
	public async accreditationToAccreditRemove(
		federationId: string,
		accreditedById: string,
		permissionId: string
	): Promise<void> {
		Urn.guard(HierarchiesRestClient.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(HierarchiesRestClient.CLASS_NAME, "accreditedById", accreditedById);
		Guards.stringValue(HierarchiesRestClient.CLASS_NAME, "permissionId", permissionId);
		await this.fetch<IHierarchiesAccreditationRemoveRequest, INoContentResponse>(
			"/:federationId/accreditations/accredit/:accreditedById/:permissionId",
			HttpMethod.DELETE,
			{
				pathParams: { federationId, accreditedById, permissionId }
			}
		);
	}

	/**
	 * Get an accreditation to accredit from a federation.
	 * @param federationId The ID of the federation.
	 * @param accreditedById The ID of the entity that granted the accreditation.
	 * @param permissionId The ID of the accreditation to get.
	 * @returns The accreditation object.
	 */
	public async accreditationToAccreditGet(
		federationId: string,
		accreditedById: string,
		permissionId: string
	): Promise<IAccreditation> {
		Urn.guard(HierarchiesRestClient.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(HierarchiesRestClient.CLASS_NAME, "accreditedById", accreditedById);
		Guards.stringValue(HierarchiesRestClient.CLASS_NAME, "permissionId", permissionId);
		const response = await this.fetch<
			IHierarchiesAccreditationGetRequest,
			IHierarchiesAccreditationGetResponse
		>("/:federationId/accreditations/accredit/:accreditedById/:permissionId", HttpMethod.GET, {
			pathParams: { federationId, accreditedById, permissionId }
		});
		return response.body;
	}

	/**
	 * Get all accreditations to accredit from a federation.
	 * @param federationId The ID of the federation.
	 * @param accreditedById The ID of the entity that granted the accreditations.
	 * @returns The array of accreditations.
	 */
	public async accreditationsToAccreditGet(
		federationId: string,
		accreditedById: string
	): Promise<IAccreditation[]> {
		Urn.guard(HierarchiesRestClient.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(HierarchiesRestClient.CLASS_NAME, "accreditedById", accreditedById);
		const response = await this.fetch<
			IHierarchiesAccreditationsGetRequest,
			IHierarchiesAccreditationsGetResponse
		>("/:federationId/accreditations/accredit/:accreditedById", HttpMethod.GET, {
			pathParams: { federationId, accreditedById }
		});
		return response.body;
	}
}
