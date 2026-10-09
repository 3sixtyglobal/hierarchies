// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@3sixty/core";
import type { IAccreditation } from "./IAccreditation.js";
import type { IFederation } from "./IFederation.js";
import type { IProperty } from "./IProperty.js";
import type { IPropertyValue } from "./IPropertyValue.js";

/**
 * Interface describing a hierarchies connector.
 */
export interface IHierarchiesConnector extends IComponent {
	/**
	 * Creates a new federation.
	 * @param controllerIdentity The identity of the controller creating the federation.
	 * @param rootAuthorities The root authorities to be included in the federation.
	 * @returns The ID of the created federation.
	 */
	federationCreate(controllerIdentity: string, rootAuthorities?: string[]): Promise<string>;

	/**
	 * Retrieves a federation by its ID.
	 * @param federationId The ID of the federation to retrieve.
	 * @param options Options for retrieving the federation.
	 * @param options.includeRevokedProperties Whether to include revoked properties in the retrieved federation, defaults to false.
	 * @returns The federation with the specified ID.
	 */
	federationGet(
		federationId: string,
		options?: { includeRevokedProperties?: boolean }
	): Promise<IFederation>;

	/**
	 * Adds a new authority to an existing federation.
	 * @param controllerIdentity The identity of the controller adding the authority.
	 * @param federationId The ID of the federation to which the authority will be added.
	 * @param accountId The account ID of the authority to be added.
	 * @returns The id of the authority.
	 */
	authorityAdd(
		controllerIdentity: string,
		federationId: string,
		accountId: string
	): Promise<string>;

	/**
	 * Removes an authority from an existing federation.
	 * @param controllerIdentity The identity of the controller removing the authority.
	 * @param federationId The ID of the federation from which the authority will be removed.
	 * @param accountId The account ID of the authority to be removed.
	 * @returns A promise that resolves when the authority has been removed.
	 */
	authorityRemove(
		controllerIdentity: string,
		federationId: string,
		accountId: string
	): Promise<void>;

	/**
	 * Adds a new property to an existing federation.
	 * @param controllerIdentity The identity of the controller adding the property.
	 * @param federationId The ID of the federation to which the property will be added.
	 * @param property The property to be added.
	 * @returns A promise that resolves when the property has been added.
	 */
	propertyAdd(controllerIdentity: string, federationId: string, property: IProperty): Promise<void>;

	/**
	 * Removes a property from an existing federation.
	 * @param controllerIdentity The identity of the controller removing the property.
	 * @param federationId The ID of the federation from which the property will be removed.
	 * @param propertyName The name of the property to be removed.
	 * @returns A promise that resolves when the property has been removed.
	 */
	propertyRemove(
		controllerIdentity: string,
		federationId: string,
		propertyName: string
	): Promise<void>;

	/**
	 * Gets a property from an existing federation.
	 * @param federationId The ID of the federation from which the property will be retrieved.
	 * @param propertyName The name of the property to be retrieved.
	 * @returns A promise that resolves with the property.
	 */
	propertyGet(federationId: string, propertyName: string): Promise<IProperty>;

	/**
	 * Gets all properties from an existing federation.
	 * @param federationId The ID of the federation from which the properties will be retrieved.
	 * @param options Options for retrieving the properties.
	 * @param options.includeRevokedProperties Whether to include revoked properties in the retrieved properties, defaults to false.
	 * @returns A promise that resolves with the properties.
	 */
	propertiesGet(
		federationId: string,
		options?: { includeRevokedProperties?: boolean }
	): Promise<IProperty[]>;

	/**
	 * Validates property for an existing federation.
	 * @param federationId The ID of the federation for which the property will be validated.
	 * @param accreditedById The ID of the entity that granted the accreditation.
	 * @param propertyName The name of the property to be validated.
	 * @param propertyValue The value of the property to be validated.
	 * @returns A promise that resolves with a boolean indicating whether the property is valid.
	 */
	propertyValidate(
		federationId: string,
		accreditedById: string,
		propertyName: string,
		propertyValue: IPropertyValue
	): Promise<boolean>;

	/**
	 * Validates properties for an existing federation.
	 * @param federationId The ID of the federation for which the properties will be validated.
	 * @param accreditedById The ID of the entity that granted the accreditations.
	 * @param propertiesToValidate The properties to be validated.
	 * @returns A promise that resolves with a boolean indicating whether the properties are valid.
	 */
	propertiesValidate(
		federationId: string,
		accreditedById: string,
		propertiesToValidate: { [propertyName: string]: IPropertyValue }
	): Promise<boolean>;

	/**
	 * Adds a new accreditation to attest to an existing federation.
	 * @param controllerIdentity The identity of the controller adding the accreditation.
	 * @param federationId The ID of the federation to which the accreditation will be added.
	 * @param accreditation The accreditation to be added.
	 * @returns The ID of the added accreditation.
	 */
	accreditationToAttestAdd(
		controllerIdentity: string,
		federationId: string,
		accreditation: Omit<IAccreditation, "permissionId">
	): Promise<string>;

	/**
	 * Removes an accreditation to attest from an existing federation.
	 * @param controllerIdentity The identity of the controller removing the accreditation.
	 * @param federationId The ID of the federation from which the accreditation will be removed.
	 * @param accreditedById The ID of the entity that granted the accreditation to be removed.
	 * @param permissionId The ID of the accreditation to be removed.
	 * @returns A promise that resolves when the accreditation has been removed.
	 */
	accreditationToAttestRemove(
		controllerIdentity: string,
		federationId: string,
		accreditedById: string,
		permissionId: string
	): Promise<void>;

	/**
	 * Get accreditation to attest to an existing federation.
	 * @param federationId The ID of the federation for which to get the accreditation.
	 * @param accreditedById The ID of the entity that granted the accreditation.
	 * @param permissionId The ID of the accreditation to be retrieved.
	 * @returns A promise that resolves with the accreditation.
	 */
	accreditationToAttestGet(
		federationId: string,
		accreditedById: string,
		permissionId: string
	): Promise<IAccreditation>;

	/**
	 * Gets accreditations to attest to an existing federation.
	 * @param federationId The ID of the federation for which to get the accreditations.
	 * @param accreditedById The ID of the entity that granted the accreditations.
	 * @returns A promise that resolves with the accreditations.
	 */
	accreditationsToAttestGet(
		federationId: string,
		accreditedById: string
	): Promise<IAccreditation[]>;

	/**
	 * Adds a new accreditation to accredit to an existing federation.
	 * @param controllerIdentity The identity of the controller adding the accreditation.
	 * @param federationId The ID of the federation to which the accreditation will be added.
	 * @param accreditation The accreditation to be added.
	 * @returns The ID of the added accreditation.
	 */
	accreditationToAccreditAdd(
		controllerIdentity: string,
		federationId: string,
		accreditation: Omit<IAccreditation, "permissionId">
	): Promise<string>;

	/**
	 * Removes an accreditation to accredit from an existing federation.
	 * @param controllerIdentity The identity of the controller removing the accreditation.
	 * @param federationId The ID of the federation from which the accreditation will be removed.
	 * @param accreditedById The ID of the entity that granted the accreditation to be removed.
	 * @param permissionId The ID of the accreditation to be removed.
	 * @returns A promise that resolves when the accreditation has been removed.
	 */
	accreditationToAccreditRemove(
		controllerIdentity: string,
		federationId: string,
		accreditedById: string,
		permissionId: string
	): Promise<void>;

	/**
	 * Get accreditation to accredit to an existing federation.
	 * @param federationId The ID of the federation for which to get the accreditation.
	 * @param accreditedById The ID of the entity that granted the accreditation.
	 * @param permissionId The ID of the accreditation to be retrieved.
	 * @returns A promise that resolves with the accreditation.
	 */
	accreditationToAccreditGet(
		federationId: string,
		accreditedById: string,
		permissionId: string
	): Promise<IAccreditation>;

	/**
	 * Gets accreditations to accredit to an existing federation.
	 * @param federationId The ID of the federation for which to get the accreditations.
	 * @param accreditedById The ID of the entity that granted the accreditations.
	 * @returns A promise that resolves with the accreditations.
	 */
	accreditationsToAccreditGet(
		federationId: string,
		accreditedById: string
	): Promise<IAccreditation[]>;
}
