// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError, Guards, Urn } from "@3sixty/core";
import {
	HierarchiesConnectorFactory,
	type IAccreditation,
	type IFederation,
	type IHierarchiesComponent,
	type IHierarchiesConnector,
	type IProperty,
	type IPropertyValue
} from "@3sixty/hierarchies-models";
import { nameof } from "@3sixty/nameof";
import type { IHierarchiesServiceConstructorOptions } from "./models/IHierarchiesServiceConstructorOptions.js";

/**
 * Service for hierarchies operations.
 */
export class HierarchiesService implements IHierarchiesComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<HierarchiesService>();

	/**
	 * The namespace supported by the hierarchies service.
	 * @internal
	 */
	private static readonly _NAMESPACE: string = "hierarchies";

	/**
	 * The default namespace for the connector to use.
	 * @internal
	 */
	private readonly _defaultNamespace: string;

	/**
	 * Create a new instance of HierarchiesService.
	 * @param options The constructor options.
	 * @throws GeneralError If no connectors are registered.
	 */
	constructor(options?: IHierarchiesServiceConstructorOptions) {
		const names = HierarchiesConnectorFactory.names();
		if (names.length === 0) {
			throw new GeneralError(HierarchiesService.CLASS_NAME, "noConnectors");
		}
		this._defaultNamespace = options?.config?.defaultNamespace ?? names[0];
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return HierarchiesService.CLASS_NAME;
	}

	/**
	 * Creates a new federation.
	 * @param rootAuthorities The root authorities to be included in the federation.
	 * @param namespace The namespace of the connector to use for the federation, defaults to component configured namespace.
	 * @param controllerIdentity The identity of the controller creating the federation.
	 * @returns The ID of the created federation.
	 */
	public async federationCreate(
		rootAuthorities?: string[],
		namespace?: string,
		controllerIdentity?: string
	): Promise<string> {
		if (namespace !== undefined) {
			Guards.stringValue(HierarchiesService.CLASS_NAME, "namespace", namespace);
		}
		Guards.stringValue(HierarchiesService.CLASS_NAME, "controllerIdentity", controllerIdentity);
		try {
			const connectorNamespace = namespace ?? this._defaultNamespace;
			const connector = HierarchiesConnectorFactory.get<IHierarchiesConnector>(connectorNamespace);
			return await connector.federationCreate(controllerIdentity, rootAuthorities);
		} catch (error) {
			throw new GeneralError(
				HierarchiesService.CLASS_NAME,
				"federationCreateFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Retrieves a federation by its ID.
	 * @param federationId The ID of the federation to retrieve.
	 * @param options Options for retrieving the federation.
	 * @param options.includeRevokedProperties Whether to include revoked properties in the retrieved federation, defaults to false.
	 * @returns The federation with the specified ID.
	 */
	public async federationGet(
		federationId: string,
		options?: { includeRevokedProperties?: boolean }
	): Promise<IFederation> {
		Urn.guard(HierarchiesService.CLASS_NAME, "federationId", federationId);
		try {
			const connector = this.getConnector(federationId);
			return await connector.federationGet(federationId, options);
		} catch (error) {
			throw new GeneralError(
				HierarchiesService.CLASS_NAME,
				"federationGetFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Adds a new authority to an existing federation.
	 * @param federationId The ID of the federation to which the authority will be added.
	 * @param accountId The account ID of the authority to be added.
	 * @param controllerIdentity The identity of the controller adding the authority.
	 * @returns The id of the authority.
	 */
	public async authorityAdd(
		federationId: string,
		accountId: string,
		controllerIdentity?: string
	): Promise<string> {
		Urn.guard(HierarchiesService.CLASS_NAME, "federationId", federationId);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "accountId", accountId);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "controllerIdentity", controllerIdentity);
		try {
			const connector = this.getConnector(federationId);
			return await connector.authorityAdd(federationId, accountId, controllerIdentity);
		} catch (error) {
			throw new GeneralError(HierarchiesService.CLASS_NAME, "authorityAddFailed", undefined, error);
		}
	}

	/**
	 * Removes an authority from an existing federation.
	 * @param federationId The ID of the federation from which the authority will be removed.
	 * @param accountId The account ID of the authority to be removed.
	 * @param controllerIdentity The identity of the controller removing the authority.
	 * @returns A promise that resolves when the authority has been removed.
	 */
	public async authorityRemove(
		federationId: string,
		accountId: string,
		controllerIdentity?: string
	): Promise<void> {
		Urn.guard(HierarchiesService.CLASS_NAME, "federationId", federationId);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "accountId", accountId);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "controllerIdentity", controllerIdentity);
		try {
			const connector = this.getConnector(federationId);
			await connector.authorityRemove(federationId, accountId, controllerIdentity);
		} catch (error) {
			throw new GeneralError(
				HierarchiesService.CLASS_NAME,
				"authorityRemoveFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Adds a new property to an existing federation.
	 * @param federationId The ID of the federation to which the property will be added.
	 * @param property The property to be added.
	 * @param controllerIdentity The identity of the controller adding the property.
	 * @returns A promise that resolves when the property has been added.
	 */
	public async propertyAdd(
		federationId: string,
		property: IProperty,
		controllerIdentity?: string
	): Promise<void> {
		Urn.guard(HierarchiesService.CLASS_NAME, "federationId", federationId);
		Guards.object(HierarchiesService.CLASS_NAME, "property", property);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "controllerIdentity", controllerIdentity);
		try {
			const connector = this.getConnector(federationId);
			await connector.propertyAdd(controllerIdentity, federationId, property);
		} catch (error) {
			throw new GeneralError(HierarchiesService.CLASS_NAME, "propertyAddFailed", undefined, error);
		}
	}

	/**
	 * Removes a property from an existing federation.
	 * @param federationId The ID of the federation from which the property will be removed.
	 * @param propertyName The name of the property to be removed.
	 * @param controllerIdentity The identity of the controller removing the property.
	 * @returns A promise that resolves when the property has been removed.
	 */
	public async propertyRemove(
		federationId: string,
		propertyName: string,
		controllerIdentity?: string
	): Promise<void> {
		Urn.guard(HierarchiesService.CLASS_NAME, "federationId", federationId);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "propertyName", propertyName);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "controllerIdentity", controllerIdentity);
		try {
			const connector = this.getConnector(federationId);
			await connector.propertyRemove(controllerIdentity, federationId, propertyName);
		} catch (error) {
			throw new GeneralError(
				HierarchiesService.CLASS_NAME,
				"propertyRemoveFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Gets a property from an existing federation.
	 * @param federationId The ID of the federation from which the property will be retrieved.
	 * @param propertyName The name of the property to be retrieved.
	 * @returns A promise that resolves with the property.
	 */
	public async propertyGet(federationId: string, propertyName: string): Promise<IProperty> {
		Urn.guard(HierarchiesService.CLASS_NAME, "federationId", federationId);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "propertyName", propertyName);
		try {
			const connector = this.getConnector(federationId);
			return await connector.propertyGet(federationId, propertyName);
		} catch (error) {
			throw new GeneralError(HierarchiesService.CLASS_NAME, "propertyGetFailed", undefined, error);
		}
	}

	/**
	 * Gets all properties from an existing federation.
	 * @param federationId The ID of the federation from which the properties will be retrieved.
	 * @param options Options for retrieving the properties.
	 * @param options.includeRevokedProperties Whether to include revoked properties in the retrieved properties, defaults to false.
	 * @returns A promise that resolves with the properties.
	 */
	public async propertiesGet(
		federationId: string,
		options?: { includeRevokedProperties?: boolean }
	): Promise<IProperty[]> {
		Urn.guard(HierarchiesService.CLASS_NAME, "federationId", federationId);
		try {
			const connector = this.getConnector(federationId);
			return await connector.propertiesGet(federationId, options);
		} catch (error) {
			throw new GeneralError(
				HierarchiesService.CLASS_NAME,
				"propertiesGetFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Validates property for an existing federation.
	 * @param federationId The ID of the federation for which the property will be validated.
	 * @param accreditedById The ID of the entity that granted the accreditation.
	 * @param propertyName The name of the property to be validated.
	 * @param propertyValue The value of the property to be validated.
	 * @returns A promise that resolves with a boolean indicating whether the property is valid.
	 */
	public async propertyValidate(
		federationId: string,
		accreditedById: string,
		propertyName: string,
		propertyValue: IPropertyValue
	): Promise<boolean> {
		Urn.guard(HierarchiesService.CLASS_NAME, "federationId", federationId);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "accreditedById", accreditedById);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "propertyName", propertyName);
		Guards.object(HierarchiesService.CLASS_NAME, "propertyValue", propertyValue);
		try {
			const connector = this.getConnector(federationId);
			return await connector.propertyValidate(
				federationId,
				accreditedById,
				propertyName,
				propertyValue
			);
		} catch (error) {
			throw new GeneralError(
				HierarchiesService.CLASS_NAME,
				"propertyValidateFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Validates properties for an existing federation.
	 * @param federationId The ID of the federation for which the properties will be validated.
	 * @param accreditedById The ID of the entity that granted the accreditations.
	 * @param propertiesToValidate The properties to be validated.
	 * @returns A promise that resolves with a boolean indicating whether the properties are valid.
	 */
	public async propertiesValidate(
		federationId: string,
		accreditedById: string,
		propertiesToValidate: { [propertyName: string]: IPropertyValue }
	): Promise<boolean> {
		Urn.guard(HierarchiesService.CLASS_NAME, "federationId", federationId);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "accreditedById", accreditedById);
		Guards.object(HierarchiesService.CLASS_NAME, "propertiesToValidate", propertiesToValidate);
		try {
			const connector = this.getConnector(federationId);
			return await connector.propertiesValidate(federationId, accreditedById, propertiesToValidate);
		} catch (error) {
			throw new GeneralError(
				HierarchiesService.CLASS_NAME,
				"propertiesValidateFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Adds a new accreditation to attest to an existing federation.
	 * @param federationId The ID of the federation to which the accreditation will be added.
	 * @param accreditation The accreditation to be added.
	 * @param controllerIdentity The identity of the controller adding the accreditation.
	 * @returns The ID of the added accreditation.
	 */
	public async accreditationToAttestAdd(
		federationId: string,
		accreditation: Omit<IAccreditation, "permissionId">,
		controllerIdentity?: string
	): Promise<string> {
		Urn.guard(HierarchiesService.CLASS_NAME, "federationId", federationId);
		Guards.object(HierarchiesService.CLASS_NAME, "accreditation", accreditation);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "controllerIdentity", controllerIdentity);
		try {
			const connector = this.getConnector(federationId);
			return await connector.accreditationToAttestAdd(
				controllerIdentity,
				federationId,
				accreditation
			);
		} catch (error) {
			throw new GeneralError(
				HierarchiesService.CLASS_NAME,
				"accreditationToAttestAddFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Removes an accreditation to attest from an existing federation.
	 * @param federationId The ID of the federation from which the accreditation will be removed.
	 * @param accreditedById The ID of the entity that granted the accreditation to be removed.
	 * @param permissionId The ID of the accreditation to be removed.
	 * @param controllerIdentity The identity of the controller removing the accreditation.
	 * @returns A promise that resolves when the accreditation has been removed.
	 */
	public async accreditationToAttestRemove(
		federationId: string,
		accreditedById: string,
		permissionId: string,
		controllerIdentity?: string
	): Promise<void> {
		Urn.guard(HierarchiesService.CLASS_NAME, "federationId", federationId);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "accreditedById", accreditedById);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "permissionId", permissionId);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "controllerIdentity", controllerIdentity);
		try {
			const connector = this.getConnector(federationId);
			await connector.accreditationToAttestRemove(
				federationId,
				accreditedById,
				permissionId,
				controllerIdentity
			);
		} catch (error) {
			throw new GeneralError(
				HierarchiesService.CLASS_NAME,
				"accreditationToAttestRemoveFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Get accreditation to attest to an existing federation.
	 * @param federationId The ID of the federation for which to get the accreditation.
	 * @param accreditedById The ID of the entity that granted the accreditation.
	 * @param permissionId The ID of the accreditation to be retrieved.
	 * @returns A promise that resolves with the accreditation.
	 */
	public async accreditationToAttestGet(
		federationId: string,
		accreditedById: string,
		permissionId: string
	): Promise<IAccreditation> {
		Urn.guard(HierarchiesService.CLASS_NAME, "federationId", federationId);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "accreditedById", accreditedById);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "permissionId", permissionId);
		try {
			const connector = this.getConnector(federationId);
			return await connector.accreditationToAttestGet(federationId, accreditedById, permissionId);
		} catch (error) {
			throw new GeneralError(
				HierarchiesService.CLASS_NAME,
				"accreditationToAttestGetFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Gets accreditations to attest to an existing federation.
	 * @param federationId The ID of the federation for which to get the accreditations.
	 * @param accreditedById The ID of the entity that granted the accreditations.
	 * @returns A promise that resolves with the accreditations.
	 */
	public async accreditationsToAttestGet(
		federationId: string,
		accreditedById: string
	): Promise<IAccreditation[]> {
		Urn.guard(HierarchiesService.CLASS_NAME, "federationId", federationId);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "accreditedById", accreditedById);
		try {
			const connector = this.getConnector(federationId);
			return await connector.accreditationsToAttestGet(federationId, accreditedById);
		} catch (error) {
			throw new GeneralError(
				HierarchiesService.CLASS_NAME,
				"accreditationsToAttestGetFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Adds a new accreditation to accredit to an existing federation.
	 * @param federationId The ID of the federation to which the accreditation will be added.
	 * @param accreditation The accreditation to be added.
	 * @param controllerIdentity The identity of the controller adding the accreditation.
	 * @returns The ID of the added accreditation.
	 */
	public async accreditationToAccreditAdd(
		federationId: string,
		accreditation: Omit<IAccreditation, "permissionId">,
		controllerIdentity?: string
	): Promise<string> {
		Urn.guard(HierarchiesService.CLASS_NAME, "federationId", federationId);
		Guards.object(HierarchiesService.CLASS_NAME, "accreditation", accreditation);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "controllerIdentity", controllerIdentity);
		try {
			const connector = this.getConnector(federationId);
			return await connector.accreditationToAccreditAdd(
				controllerIdentity,
				federationId,
				accreditation
			);
		} catch (error) {
			throw new GeneralError(
				HierarchiesService.CLASS_NAME,
				"accreditationToAccreditAddFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Removes an accreditation to accredit from an existing federation.
	 * @param federationId The ID of the federation from which the accreditation will be removed.
	 * @param accreditedById The ID of the entity that granted the accreditation to be removed.
	 * @param permissionId The ID of the accreditation to be removed.
	 * @param controllerIdentity The identity of the controller removing the accreditation.
	 * @returns A promise that resolves when the accreditation has been removed.
	 */
	public async accreditationToAccreditRemove(
		federationId: string,
		accreditedById: string,
		permissionId: string,
		controllerIdentity?: string
	): Promise<void> {
		Urn.guard(HierarchiesService.CLASS_NAME, "federationId", federationId);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "accreditedById", accreditedById);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "permissionId", permissionId);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "controllerIdentity", controllerIdentity);
		try {
			const connector = this.getConnector(federationId);
			await connector.accreditationToAccreditRemove(
				federationId,
				accreditedById,
				permissionId,
				controllerIdentity
			);
		} catch (error) {
			throw new GeneralError(
				HierarchiesService.CLASS_NAME,
				"accreditationToAccreditRemoveFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Get accreditation to accredit to an existing federation.
	 * @param federationId The ID of the federation for which to get the accreditation.
	 * @param accreditedById The ID of the entity that granted the accreditation.
	 * @param permissionId The ID of the accreditation to be retrieved.
	 * @returns A promise that resolves with the accreditation.
	 */
	public async accreditationToAccreditGet(
		federationId: string,
		accreditedById: string,
		permissionId: string
	): Promise<IAccreditation> {
		Urn.guard(HierarchiesService.CLASS_NAME, "federationId", federationId);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "accreditedById", accreditedById);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "permissionId", permissionId);
		try {
			const connector = this.getConnector(federationId);
			return await connector.accreditationToAccreditGet(federationId, accreditedById, permissionId);
		} catch (error) {
			throw new GeneralError(
				HierarchiesService.CLASS_NAME,
				"accreditationToAccreditGetFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Gets accreditations to accredit to an existing federation.
	 * @param federationId The ID of the federation for which to get the accreditations.
	 * @param accreditedById The ID of the entity that granted the accreditations.
	 * @returns A promise that resolves with the accreditations.
	 */
	public async accreditationsToAccreditGet(
		federationId: string,
		accreditedById: string
	): Promise<IAccreditation[]> {
		Urn.guard(HierarchiesService.CLASS_NAME, "federationId", federationId);
		Guards.stringValue(HierarchiesService.CLASS_NAME, "accreditedById", accreditedById);
		try {
			const connector = this.getConnector(federationId);
			return await connector.accreditationsToAccreditGet(federationId, accreditedById);
		} catch (error) {
			throw new GeneralError(
				HierarchiesService.CLASS_NAME,
				"accreditationsToAccreditGetFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Get the connector from the federation id.
	 * @param id The id of the federation in urn format.
	 * @returns The connector.
	 * @throws GeneralError If the namespace does not match.
	 * @internal
	 */
	private getConnector(id: string): IHierarchiesConnector {
		const idUrn = Urn.fromValidString(id);
		if (idUrn.namespaceIdentifier() !== HierarchiesService._NAMESPACE) {
			throw new GeneralError(HierarchiesService.CLASS_NAME, "namespaceMismatch", {
				namespace: HierarchiesService._NAMESPACE,
				id
			});
		}
		return HierarchiesConnectorFactory.get<IHierarchiesConnector>(idUrn.namespaceMethod());
	}
}
