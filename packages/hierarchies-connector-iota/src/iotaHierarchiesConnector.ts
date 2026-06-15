// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	FederationProperty,
	HierarchiesClient,
	HierarchiesClientReadOnly,
	PropertyName,
	PropertyShape,
	PropertyValue,
	type Accreditation,
	type Accreditations,
	type Federation,
	type Timespan,
	type Transaction,
	type TransactionBuilder
} from "@iota/hierarchies/node/index.js";
import { Ed25519Keypair } from "@iota/iota-sdk/keypairs/ed25519";
import { Transaction as IotaTransaction } from "@iota/iota-sdk/transactions";
import { ComponentFactory, GeneralError, Guards, Is, NotFoundError, Urn } from "@twin.org/core";
import { Iota, type IIotaTransactionBlockResponse } from "@twin.org/dlt-iota";
import {
	PropertyConstraintType,
	PropertyType,
	type IAccreditation,
	type IFederation,
	type IHierarchiesConnector,
	type IProperty,
	type IPropertyCondition,
	type IPropertyValue,
	type ITimespan
} from "@twin.org/hierarchies-models";
import type { ILoggingComponent } from "@twin.org/logging-models";
import { nameof } from "@twin.org/nameof";
import { VaultConnectorFactory, type IVaultConnector } from "@twin.org/vault-models";
import type { IIotaHierarchiesConnectorConfig } from "./models/IIotaHierarchiesConnectorConfig.js";
import type { IIotaHierarchiesConnectorConstructorOptions } from "./models/IIotaHierarchiesConnectorConstructorOptions.js";

/**
 * IOTA connector for hierarchies.
 */
export class IotaHierarchiesConnector implements IHierarchiesConnector {
	/**
	 * The namespace supported by the connector.
	 */
	public static readonly NAMESPACE: string = "iota";

	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<IotaHierarchiesConnector>();

	/**
	 * The connector configuration.
	 * @internal
	 */
	private readonly _config: IIotaHierarchiesConnectorConfig;

	/**
	 * The vault connector.
	 * @internal
	 */
	private readonly _vaultConnector: IVaultConnector;

	/**
	 * The logging component.
	 * @internal
	 */
	private readonly _logging?: ILoggingComponent;

	/**
	 * Create a new instance of IotaHierarchiesConnector.
	 * @param options The options for the connector.
	 */
	constructor(options: IIotaHierarchiesConnectorConstructorOptions) {
		Guards.object(IotaHierarchiesConnector.CLASS_NAME, nameof(options), options);
		Guards.object(IotaHierarchiesConnector.CLASS_NAME, nameof(options.config), options.config);
		this._config = options.config;
		Iota.populateConfig(this._config);
		this._vaultConnector = VaultConnectorFactory.get(options.vaultConnectorType ?? "vault");
		this._logging = ComponentFactory.getIfExists(options?.loggingComponentType);
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return IotaHierarchiesConnector.CLASS_NAME;
	}

	/**
	 * Creates a new federation.
	 * @param controllerIdentity The identity of the controller creating the federation.
	 * @param rootAuthorities The root authorities to be included in the federation.
	 * @returns The ID of the created federation.
	 */
	public async federationCreate(
		controllerIdentity: string,
		rootAuthorities?: string[]
	): Promise<string> {
		Guards.stringValue(
			IotaHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);

		try {
			const client = await this.buildWritableClient(controllerIdentity);

			const tx = await client.createNewFederation();
			const result = await this.postTransaction(controllerIdentity, tx, client, "federationCreate");

			const federationId = this.toFederationId(this.extractCreatedObjectId(result));

			if (Is.arrayValue(rootAuthorities)) {
				for (const rootAuthority of rootAuthorities) {
					const tx2 = await client.addRootAuthority(federationId, rootAuthority);
					await this.postTransaction(controllerIdentity, tx2, client, "rootAuthorityAdd");
				}
			}

			return federationId;
		} catch (error) {
			throw new GeneralError(
				IotaHierarchiesConnector.CLASS_NAME,
				"creationFailed",
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
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);

		const objectId = this.objectIdFromUrn(federationId);

		try {
			const client = await this.buildReadOnlyClient();

			const federation = await client.getFederationById(objectId);

			return this.mapFederationToModel(
				federation,
				(options?.includeRevokedProperties ?? false) ? 0 : Date.now()
			);
		} catch (error) {
			throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "getFailed", undefined, error);
		}
	}

	/**
	 * Adds a new authority to an existing federation.
	 * @param controllerIdentity The identity of the controller adding the authority.
	 * @param federationId The ID of the federation to which the authority will be added.
	 * @param accountId The account ID of the authority to be added.
	 * @returns The id of the authority.
	 */
	public async authorityAdd(
		controllerIdentity: string,
		federationId: string,
		accountId: string
	): Promise<string> {
		Guards.stringValue(
			IotaHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(accountId), accountId);

		const objectId = this.objectIdFromUrn(federationId);

		try {
			const client = await this.buildWritableClient(controllerIdentity);

			const federation = await client.readOnly().getFederationById(objectId);

			if (federation.revokedRootAuthorities.includes(accountId)) {
				const tx = client.reinstateRootAuthority(objectId, accountId);
				await this.postTransaction(controllerIdentity, tx, client, "rootAuthorityReinstate");
			} else {
				const tx = client.addRootAuthority(objectId, accountId);
				await this.postTransaction(controllerIdentity, tx, client, "rootAuthorityAdd");
			}

			const federation2 = await client.readOnly().getFederationById(objectId);

			const rootAuthority = federation2.rootAuthorities.find(ra => ra.accountId === accountId);
			if (Is.empty(rootAuthority)) {
				throw new NotFoundError(IotaHierarchiesConnector.CLASS_NAME, "noRootAuthority", accountId);
			}

			return rootAuthority.id;
		} catch (error) {
			throw new GeneralError(
				IotaHierarchiesConnector.CLASS_NAME,
				"authorityAddFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Removes an authority from an existing federation.
	 * @param controllerIdentity The identity of the controller removing the authority.
	 * @param federationId The ID of the federation from which the authority will be removed.
	 * @param accountId The account ID of the authority to be removed.
	 * @returns A promise that resolves when the authority has been removed.
	 */
	public async authorityRemove(
		controllerIdentity: string,
		federationId: string,
		accountId: string
	): Promise<void> {
		Guards.stringValue(
			IotaHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(accountId), accountId);

		const objectId = this.objectIdFromUrn(federationId);

		try {
			const client = await this.buildWritableClient(controllerIdentity);

			const tx = client.revokeRootAuthority(objectId, accountId);
			await this.postTransaction(controllerIdentity, tx, client, "rootAuthorityRemove");
		} catch (error) {
			throw new GeneralError(
				IotaHierarchiesConnector.CLASS_NAME,
				"authorityRemoveFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Adds a new property to an existing federation.
	 * @param controllerIdentity The identity of the controller adding the property.
	 * @param federationId The ID of the federation to which the property will be added.
	 * @param property The property to be added.
	 * @returns A promise that resolves when the property has been added.
	 */
	public async propertyAdd(
		controllerIdentity: string,
		federationId: string,
		property: IProperty
	): Promise<void> {
		Guards.stringValue(
			IotaHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.objectValue(IotaHierarchiesConnector.CLASS_NAME, nameof(property), property);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(property.name), property.name);

		const objectId = this.objectIdFromUrn(federationId);

		try {
			const client = await this.buildWritableClient(controllerIdentity);

			const federationProperty = this.mapPropertyModelToFederationProperty(property);

			const tx = client.addProperty(objectId, federationProperty);

			await this.postTransaction(controllerIdentity, tx, client, "propertyAdd");
		} catch (error) {
			throw new GeneralError(
				IotaHierarchiesConnector.CLASS_NAME,
				"propertyAddFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Removes a property from an existing federation.
	 * @param controllerIdentity The identity of the controller removing the property.
	 * @param federationId The ID of the federation from which the property will be removed.
	 * @param propertyName The name of the property to be removed.
	 * @returns A promise that resolves when the property has been removed.
	 */
	public async propertyRemove(
		controllerIdentity: string,
		federationId: string,
		propertyName: string
	): Promise<void> {
		Guards.stringValue(
			IotaHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(propertyName), propertyName);

		const objectId = this.objectIdFromUrn(federationId);

		try {
			const client = await this.buildWritableClient(controllerIdentity);

			const federation = await client.readOnly().getFederationById(objectId);

			const properties = this.mapFederatedPropertiesToModel(
				federation.governance.properties.data,
				Date.now()
			);

			const property = properties.find(p => p.name === propertyName);

			if (Is.empty(property)) {
				throw new NotFoundError(
					IotaHierarchiesConnector.CLASS_NAME,
					"propertyNotFound",
					propertyName
				);
			}

			const propertyNameObj = new PropertyName(propertyName.split("."));
			const tx = client.revoke_property(objectId, propertyNameObj);
			await this.postTransaction(controllerIdentity, tx, client, "propertyRemove");
		} catch (error) {
			throw new GeneralError(
				IotaHierarchiesConnector.CLASS_NAME,
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
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(propertyName), propertyName);

		const objectId = this.objectIdFromUrn(federationId);

		try {
			const client = await this.buildReadOnlyClient();

			const federation = await client.getFederationById(objectId);

			const properties = this.mapFederatedPropertiesToModel(
				federation.governance.properties.data,
				Date.now()
			);

			const property = properties.find(p => p.name === propertyName);

			if (Is.empty(property)) {
				throw new NotFoundError(
					IotaHierarchiesConnector.CLASS_NAME,
					"propertyNotFound",
					propertyName
				);
			}
			return property;
		} catch (error) {
			throw new GeneralError(
				IotaHierarchiesConnector.CLASS_NAME,
				"propertyGetFailed",
				undefined,
				error
			);
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
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);

		const objectId = this.objectIdFromUrn(federationId);

		try {
			const client = await this.buildReadOnlyClient();

			const federation = await client.getFederationById(objectId);

			const properties = this.mapFederatedPropertiesToModel(
				federation.governance.properties.data,
				(options?.includeRevokedProperties ?? false) ? 0 : Date.now()
			);

			return properties;
		} catch (error) {
			throw new GeneralError(
				IotaHierarchiesConnector.CLASS_NAME,
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
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(accreditedById), accreditedById);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(propertyName), propertyName);
		Guards.objectValue(IotaHierarchiesConnector.CLASS_NAME, nameof(propertyValue), propertyValue);

		const objectId = this.objectIdFromUrn(federationId);

		try {
			const client = await this.buildReadOnlyClient();

			let prop;
			if (propertyValue.type === PropertyType.String) {
				prop = PropertyValue.newText(propertyValue.value);
			} else if (propertyValue.type === PropertyType.BigInt) {
				prop = PropertyValue.newNumber(BigInt(propertyValue.value));
			} else {
				throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "invalidPropertyType", {
					type: propertyValue.type
				});
			}

			let result = false;
			try {
				result = await client.validateProperty(
					objectId,
					accreditedById,
					new PropertyName(propertyName.split(".")),
					prop
				);
			} catch {
				// Silently fail this, the validateProperty should return false if the property is not valid,
				// but in case of any error we also want to return false rather than throwing an error.
			}

			return result;
		} catch (error) {
			throw new GeneralError(
				IotaHierarchiesConnector.CLASS_NAME,
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
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(accreditedById), accreditedById);
		Guards.objectValue(
			IotaHierarchiesConnector.CLASS_NAME,
			nameof(propertiesToValidate),
			propertiesToValidate
		);

		const objectId = this.objectIdFromUrn(federationId);

		try {
			const client = await this.buildReadOnlyClient();

			const map = new Map<PropertyName, PropertyValue>();

			for (const propertyName of Object.keys(propertiesToValidate)) {
				const propertyValue = propertiesToValidate[propertyName];

				if (propertyValue.type === PropertyType.String) {
					map.set(
						new PropertyName(propertyName.split(".")),
						PropertyValue.newText(propertyValue.value)
					);
				} else if (propertyValue.type === PropertyType.BigInt) {
					map.set(
						new PropertyName(propertyName.split(".")),
						PropertyValue.newNumber(BigInt(propertyValue.value))
					);
				} else {
					throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "invalidPropertyType", {
						type: propertyValue.type
					});
				}
			}

			let result = false;
			try {
				result = await client.validateProperties(objectId, accreditedById, map);
			} catch {
				// Silently fail this, the validateProperties should return false if the property is not valid,
				// but in case of any error we also want to return false rather than throwing an error.
			}

			return result;
		} catch (error) {
			throw new GeneralError(
				IotaHierarchiesConnector.CLASS_NAME,
				"propertiesValidateFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Adds a new accreditation to attest to an existing federation.
	 * @param controllerIdentity The identity of the controller adding the accreditation.
	 * @param federationId The ID of the federation to which the accreditation will be added.
	 * @param accreditation The accreditation to be added.
	 * @returns The ID of the added accreditation.
	 */
	public async accreditationToAttestAdd(
		controllerIdentity: string,
		federationId: string,
		accreditation: Omit<IAccreditation, "permissionId">
	): Promise<string> {
		Guards.stringValue(
			IotaHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.objectValue(IotaHierarchiesConnector.CLASS_NAME, nameof(accreditation), accreditation);

		const objectId = this.objectIdFromUrn(federationId);

		try {
			const client = await this.buildWritableClient(controllerIdentity);

			const tx = await client.createAccreditationToAttest(
				objectId,
				accreditation.accreditedBy,
				accreditation.properties.map(p => this.mapPropertyModelToFederationProperty(p))
			);

			await this.postTransaction(controllerIdentity, tx, client, "accreditationToAttestAdd");

			// For now use the most recent entry in the accreditations to attest list as the ID of the created accreditation,
			// as the permissionId is not returned in the result.
			const toAttest = await this.accreditationsToAttestGet(
				federationId,
				accreditation.accreditedBy
			);
			return toAttest[toAttest.length - 1].permissionId;
		} catch (error) {
			throw new GeneralError(
				IotaHierarchiesConnector.CLASS_NAME,
				"accreditationToAttestAddFailed",
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
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(accreditedById), accreditedById);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(permissionId), permissionId);

		const objectId = this.objectIdFromUrn(federationId);

		try {
			const client = await this.buildReadOnlyClient();

			const accreditations = await client.getAccreditationsToAttest(objectId, accreditedById);

			const permission = accreditations.accreditations.find(a => a.id === permissionId);

			if (Is.empty(permission)) {
				throw new NotFoundError(
					IotaHierarchiesConnector.CLASS_NAME,
					"permissionNotFound",
					permissionId
				);
			}
			return this.mapAccreditationToModel(permission, Date.now());
		} catch (error) {
			throw new GeneralError(
				IotaHierarchiesConnector.CLASS_NAME,
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
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(accreditedById), accreditedById);

		const objectId = this.objectIdFromUrn(federationId);

		try {
			const client = await this.buildReadOnlyClient();

			const accreditationsToAttest = await client.getAccreditationsToAttest(
				objectId,
				accreditedById
			);

			const now = Date.now();
			return accreditationsToAttest.accreditations.map(a => this.mapAccreditationToModel(a, now));
		} catch (error) {
			throw new GeneralError(
				IotaHierarchiesConnector.CLASS_NAME,
				"accreditationsToAttestGetFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Removes an accreditation to attest from an existing federation.
	 * @param controllerIdentity The identity of the controller removing the accreditation.
	 * @param federationId The ID of the federation from which the accreditation will be removed.
	 * @param accreditedById The ID of the entity that granted the accreditation to be removed.
	 * @param permissionId The ID of the accreditation to be removed.
	 * @returns A promise that resolves when the accreditation has been removed.
	 */
	public async accreditationToAttestRemove(
		controllerIdentity: string,
		federationId: string,
		accreditedById: string,
		permissionId: string
	): Promise<void> {
		Guards.stringValue(
			IotaHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(accreditedById), accreditedById);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(permissionId), permissionId);

		const objectId = this.objectIdFromUrn(federationId);

		try {
			const client = await this.buildWritableClient(controllerIdentity);

			const tx = await client.revokeAccreditationToAttest(objectId, accreditedById, permissionId);
			await this.postTransaction(controllerIdentity, tx, client, "accreditationToAttestRemove");
		} catch (error) {
			throw new GeneralError(
				IotaHierarchiesConnector.CLASS_NAME,
				"accreditationToAttestRemoveFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Adds a new accreditation to accredit to an existing federation.
	 * @param controllerIdentity The identity of the controller adding the accreditation.
	 * @param federationId The ID of the federation to which the accreditation will be added.
	 * @param accreditation The accreditation to be added.
	 * @returns The ID of the added accreditation.
	 */
	public async accreditationToAccreditAdd(
		controllerIdentity: string,
		federationId: string,
		accreditation: Omit<IAccreditation, "permissionId">
	): Promise<string> {
		Guards.stringValue(
			IotaHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.objectValue(IotaHierarchiesConnector.CLASS_NAME, nameof(accreditation), accreditation);

		const objectId = this.objectIdFromUrn(federationId);

		try {
			const client = await this.buildWritableClient(controllerIdentity);

			const tx = await client.createAccreditationToAccredit(
				objectId,
				accreditation.accreditedBy,
				accreditation.properties.map(p => this.mapPropertyModelToFederationProperty(p))
			);

			await this.postTransaction(controllerIdentity, tx, client, "accreditationToAccreditAdd");

			// For now use the most recent entry in the accreditations to accredit list as the ID of the created accreditation,
			// as the permissionId is not returned in the result.
			const toAccredit = await this.accreditationsToAccreditGet(
				federationId,
				accreditation.accreditedBy
			);
			return toAccredit[toAccredit.length - 1].permissionId;
		} catch (error) {
			throw new GeneralError(
				IotaHierarchiesConnector.CLASS_NAME,
				"accreditationToAccreditAddFailed",
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
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(accreditedById), accreditedById);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(permissionId), permissionId);

		const objectId = this.objectIdFromUrn(federationId);

		try {
			const client = await this.buildReadOnlyClient();

			const accreditations = await client.getAccreditationsToAccredit(objectId, accreditedById);

			const permission = accreditations.accreditations.find(a => a.id === permissionId);

			if (Is.empty(permission)) {
				throw new NotFoundError(
					IotaHierarchiesConnector.CLASS_NAME,
					"permissionNotFound",
					permissionId
				);
			}

			return this.mapAccreditationToModel(permission, Date.now());
		} catch (error) {
			throw new GeneralError(
				IotaHierarchiesConnector.CLASS_NAME,
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
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(accreditedById), accreditedById);

		const objectId = this.objectIdFromUrn(federationId);

		try {
			const client = await this.buildReadOnlyClient();

			const accreditationsToAccredit = await client.getAccreditationsToAccredit(
				objectId,
				accreditedById
			);

			const now = Date.now();
			return accreditationsToAccredit.accreditations.map(a => this.mapAccreditationToModel(a, now));
		} catch (error) {
			throw new GeneralError(
				IotaHierarchiesConnector.CLASS_NAME,
				"accreditationsToAccreditGetFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Removes an accreditation to accredit from an existing federation.
	 * @param controllerIdentity The identity of the controller removing the accreditation.
	 * @param federationId The ID of the federation from which the accreditation will be removed.
	 * @param accreditedById The ID of the entity that granted the accreditation to be removed.
	 * @param permissionId The ID of the accreditation to be removed.
	 * @returns A promise that resolves when the accreditation has been removed.
	 */
	public async accreditationToAccreditRemove(
		controllerIdentity: string,
		federationId: string,
		accreditedById: string,
		permissionId: string
	): Promise<void> {
		Guards.stringValue(
			IotaHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(accreditedById), accreditedById);
		Guards.stringValue(IotaHierarchiesConnector.CLASS_NAME, nameof(permissionId), permissionId);

		const objectId = this.objectIdFromUrn(federationId);

		try {
			const client = await this.buildWritableClient(controllerIdentity);

			const tx = await client.revokeAccreditationToAccredit(objectId, accreditedById, permissionId);
			await this.postTransaction(controllerIdentity, tx, client, "accreditationToAccreditRemove");
		} catch (error) {
			throw new GeneralError(
				IotaHierarchiesConnector.CLASS_NAME,
				"accreditationToAccreditRemoveFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Builds a writable hierarchies client for the given controller identity.
	 * @param controllerIdentity The controller identity.
	 * @returns A promise that resolves with the writable client.
	 * @internal
	 */
	private async buildWritableClient(controllerIdentity: string): Promise<HierarchiesClient> {
		const readOnlyClient = await this.buildReadOnlyClient();

		const keyPair = await Iota.getKeyPair(
			this._vaultConnector,
			this._config,
			controllerIdentity,
			this._config.accountAddressIndex ?? 0,
			this._config.walletAddressIndex ?? 0
		);
		const signerKeyPair = new Ed25519Keypair({
			publicKey: keyPair.publicKey,
			secretKey: keyPair.privateKey
		});

		const signer = {
			sign: async (txDataBcs: Uint8Array): Promise<string> =>
				(await signerKeyPair.signTransaction(txDataBcs)).signature,
			publicKey: async () => signerKeyPair.getPublicKey(),
			iotaPublicKeyBytes: async () => signerKeyPair.getPublicKey().toIotaBytes(),
			keyId: () => Iota.publicKeyToAddress(keyPair.publicKey)
		};

		return new HierarchiesClient(readOnlyClient, signer);
	}

	/**
	 * Builds a read-only hierarchies client connected to the configured IOTA node.
	 * @returns A promise that resolves with the read-only client.
	 * @internal
	 */
	private async buildReadOnlyClient(): Promise<HierarchiesClientReadOnly> {
		const iotaClient = Iota.createClient(this._config);
		return HierarchiesClientReadOnly.create(
			iotaClient as unknown as Parameters<typeof HierarchiesClientReadOnly.create>[0]
		);
	}

	/**
	 * Parse and validate a hierarchies id into the underlying object id.
	 * @param id The hierarchies id.
	 * @returns The object id.
	 * @throws {GeneralError} If the namespace does not match.
	 * @internal
	 */
	private objectIdFromUrn(id: string): string {
		const urnParsed = Urn.fromValidString(id);
		if (urnParsed.namespaceMethod() !== IotaHierarchiesConnector.NAMESPACE) {
			throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "namespaceMismatch", {
				namespace: IotaHierarchiesConnector.NAMESPACE,
				id
			});
		}

		return urnParsed.namespaceSpecific(1);
	}

	/**
	 * Format an object id as a hierarchies URN.
	 * @param objectId The object id.
	 * @returns The hierarchies id.
	 * @internal
	 */
	private toFederationId(objectId: string): string {
		return `federation:${new Urn(IotaHierarchiesConnector.NAMESPACE, objectId).toString()}`;
	}

	/**
	 * Builds and posts a hierarchies transaction, handling gas station mode when configured.
	 * @param controllerIdentity The identity performing the transaction.
	 * @param transactionBuilder The transaction builder.
	 * @param hierarchiesClient The hierarchies client.
	 * @param dryRunLabel The label to use for dry-run cost logging when cost logging is enabled.
	 * @returns A promise that resolves with the transaction execution result.
	 * @internal
	 */
	private async postTransaction(
		controllerIdentity: string,
		transactionBuilder: TransactionBuilder<Transaction<unknown>>,
		hierarchiesClient: HierarchiesClient,
		dryRunLabel: string
	): Promise<IIotaTransactionBlockResponse> {
		const [txBytes] = await transactionBuilder.build(hierarchiesClient);
		const transaction = IotaTransaction.from(txBytes);
		const owner = await Iota.getAddress(
			this._vaultConnector,
			this._config,
			controllerIdentity,
			this._config.accountAddressIndex ?? 0,
			this._config.walletAddressIndex ?? 0
		);

		const iotaClient = Iota.createClient(this._config);

		const response = await Iota.prepareAndPostTransaction(
			this._config,
			this._vaultConnector,
			this._logging,
			controllerIdentity,
			iotaClient,
			owner,
			transaction,
			{
				dryRunLabel: this._config.enableCostLogging ? dryRunLabel : undefined
			}
		);

		this.handleAbortCode(response);

		return response;
	}

	/**
	 * Extract the created object id from transaction response object changes.
	 * @param result The posted transaction result.
	 * @returns The created object id.
	 * @throws {GeneralError} If the creation output is invalid or missing.
	 * @internal
	 */
	private extractCreatedObjectId(result: IIotaTransactionBlockResponse): string {
		const events = result.events;
		if (
			!Is.arrayValue<{ parsedJson: { federation_address?: string; receiver?: string } }>(events)
		) {
			throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "creationFailedOutput");
		}

		for (const event of events) {
			if (Is.stringValue(event.parsedJson?.federation_address)) {
				return event.parsedJson.federation_address;
			}
			if (Is.stringValue(event.parsedJson?.receiver)) {
				return event.parsedJson.receiver;
			}
		}

		throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "creationFailedOutput");
	}

	/**
	 * Maps a Federation to an IFederation model.
	 * @param federation The Federation to map.
	 * @param now The current timestamp in milliseconds; pass 0 to include revoked properties.
	 * @returns The mapped IFederation.
	 * @internal
	 */
	private mapFederationToModel(federation: Federation, now: number): IFederation {
		const model: IFederation = {
			id: this.toFederationId(federation.id),
			rootAuthorities: federation.rootAuthorities.map(ra => ({
				id: ra.id,
				accountId: ra.accountId
			})),
			revokedRootAuthorities: federation.revokedRootAuthorities,
			governance: {
				id: federation.governance.id,
				accreditationsToAccredit: this.mapAccreditationsToAccreditToModel(
					federation.governance.accreditationsToAccredit,
					now
				),
				accreditationsToAttest: this.mapAccreditationsToAttestToModel(
					federation.governance.accreditationsToAttest,
					now
				),
				properties: this.mapFederatedPropertiesToModel(federation.governance.properties.data, now)
			}
		};

		return model;
	}

	/**
	 * Maps an array of FederationProperty to an IProperty array, filtering revoked entries when now is positive.
	 * @param properties The FederationProperty items to map.
	 * @param now The current timestamp in milliseconds; pass 0 to include revoked properties.
	 * @returns The mapped IProperty array.
	 * @internal
	 */
	private mapFederatedPropertiesToModel(
		properties: FederationProperty[] | undefined,
		now: number
	): IProperty[] {
		if (Is.empty(properties)) {
			return [];
		}
		const props: IProperty[] = properties.map(value => this.mapFederatedPropertyToModel(value));

		if (now > 0) {
			return props.filter(
				p => Is.empty(p.timespan?.validTo) || BigInt(p.timespan.validTo) > BigInt(now)
			);
		}

		return props;
	}

	/**
	 * Maps a FederationProperty to an IProperty model.
	 * @param property The FederationProperty to map.
	 * @returns The mapped IProperty.
	 * @internal
	 */
	private mapFederatedPropertyToModel(property: FederationProperty): IProperty {
		return {
			name: property.propertyName.dotted(),
			allowedValues: property.allowAny
				? undefined
				: property.allowedValues.map(v => this.mapFederatedPropertyValueToModel(v)),
			condition: this.mapFederatedPropertyConditionToModel(property.condition),
			timespan: this.mapTimespanToModel(property.timespan)
		};
	}

	/**
	 * Maps an IProperty model to a FederationProperty.
	 * @param property The IProperty to map.
	 * @returns The mapped FederationProperty.
	 * @throws {GeneralError} If the allowed value type or property condition constraint is invalid.
	 * @internal
	 */
	private mapPropertyModelToFederationProperty(property: IProperty): FederationProperty {
		const propertyName = new PropertyName(property.name.split("."));
		const allowedValues: PropertyValue[] = [];
		if (Is.arrayValue(property.allowedValues)) {
			for (const allowedValue of property.allowedValues) {
				if (allowedValue.type === PropertyType.BigInt) {
					allowedValues.push(PropertyValue.newNumber(BigInt(allowedValue.value)));
				} else if (allowedValue.type === PropertyType.String) {
					allowedValues.push(PropertyValue.newText(allowedValue.value));
				} else {
					throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "invalidAllowedValueType", {
						type: allowedValue.type
					});
				}
			}
		}

		let propertyShape: PropertyShape | undefined;
		if (Is.objectValue<IPropertyCondition>(property.condition)) {
			const condition = property.condition;
			if (condition.constraint === PropertyConstraintType.Contains) {
				propertyShape = PropertyShape.newContains(condition.value);
			} else if (condition.constraint === PropertyConstraintType.StartsWith) {
				propertyShape = PropertyShape.newStartsWith(condition.value);
			} else if (condition.constraint === PropertyConstraintType.EndsWith) {
				propertyShape = PropertyShape.newEndsWith(condition.value);
			} else if (condition.constraint === PropertyConstraintType.GreaterThan) {
				propertyShape = PropertyShape.newGreaterThan(BigInt(condition.value));
			} else if (condition.constraint === PropertyConstraintType.LessThan) {
				propertyShape = PropertyShape.newLowerThan(BigInt(condition.value));
			} else {
				throw new GeneralError(
					IotaHierarchiesConnector.CLASS_NAME,
					"invalidPropertyValueConditionConstraint",
					{
						constraint: condition.constraint
					}
				);
			}
		}

		if (Is.empty(propertyShape)) {
			if (Is.arrayValue(allowedValues)) {
				return new FederationProperty(propertyName).withAllowedValues(allowedValues);
			}
			return new FederationProperty(propertyName).withAllowAny(true);
		}
		if (Is.arrayValue(allowedValues)) {
			return new FederationProperty(propertyName)
				.withAllowedValues(allowedValues)
				.withCondition(propertyShape);
		}
		return new FederationProperty(propertyName).withAllowAny(true).withCondition(propertyShape);
	}

	/**
	 * Maps a PropertyValue to an IPropertyValue model.
	 * @param propertyValue The PropertyValue to map.
	 * @returns The mapped IPropertyValue.
	 * @internal
	 */
	private mapFederatedPropertyValueToModel(propertyValue: PropertyValue): IPropertyValue {
		if (propertyValue.isNumber()) {
			return {
				type: PropertyType.BigInt,
				value: propertyValue.asNumber()?.toString() ?? "0"
			};
		}
		return {
			type: PropertyType.String,
			value: propertyValue.asText() ?? ""
		};
	}

	/**
	 * Maps a PropertyShape to an IPropertyCondition model.
	 * @param propertyShape The PropertyShape to map.
	 * @returns The mapped condition, or undefined if no shape is provided.
	 * @internal
	 */
	private mapFederatedPropertyConditionToModel(
		propertyShape?: PropertyShape
	): IPropertyCondition | undefined {
		if (!propertyShape) {
			return undefined;
		}

		if (propertyShape.isContains()) {
			return {
				type: PropertyType.String,
				value: propertyShape.asContains() ?? "",
				constraint: PropertyConstraintType.Contains
			};
		}
		if (propertyShape.isStartsWith()) {
			return {
				type: PropertyType.String,
				value: propertyShape.asStartsWith() ?? "",
				constraint: PropertyConstraintType.StartsWith
			};
		}
		if (propertyShape.isEndsWith()) {
			return {
				type: PropertyType.String,
				value: propertyShape.asEndsWith() ?? "",
				constraint: PropertyConstraintType.EndsWith
			};
		}
		if (propertyShape.isGreaterThan()) {
			return {
				type: PropertyType.BigInt,
				value: propertyShape.asGreaterThan()?.toString() ?? "0",
				constraint: PropertyConstraintType.GreaterThan
			};
		}
		if (propertyShape.isLowerThan()) {
			return {
				type: PropertyType.BigInt,
				value: propertyShape.asLowerThan()?.toString() ?? "0",
				constraint: PropertyConstraintType.LessThan
			};
		}
	}

	/**
	 * Maps a Timespan to an ITimespan model.
	 * @param timespan The Timespan to map.
	 * @returns The mapped ITimespan, or undefined if the timespan is empty.
	 * @internal
	 */
	private mapTimespanToModel(timespan: Timespan | undefined): ITimespan | undefined {
		if (Is.empty(timespan) || (Is.empty(timespan.validFromMs) && Is.empty(timespan.validUntilMs))) {
			return undefined;
		}

		return {
			validFrom: timespan.validFromMs?.toString(),
			validTo: timespan.validUntilMs?.toString()
		};
	}

	/**
	 * Maps the accreditations-to-accredit map to a plain IAccreditation map.
	 * @param accreditationsToAccredit The source map of accreditations to accredit.
	 * @param now The current timestamp in milliseconds used to filter revoked entries.
	 * @returns The mapped IAccreditation record.
	 * @internal
	 */
	private mapAccreditationsToAccreditToModel(
		accreditationsToAccredit: Map<string, Accreditations> | undefined,
		now: number
	): {
		[id: string]: IAccreditation[];
	} {
		if (!accreditationsToAccredit) {
			return {};
		}

		const result: { [id: string]: IAccreditation[] } = {};

		for (const [key, value] of accreditationsToAccredit.entries()) {
			if (Is.stringValue(key)) {
				result[key] = value.accreditations.map(acc => this.mapAccreditationToModel(acc, now));
			}
		}

		return result;
	}

	/**
	 * Maps an Accreditation to an IAccreditation model.
	 * @param accreditation The Accreditation to map.
	 * @param now The current timestamp in milliseconds used to filter revoked properties.
	 * @returns The mapped IAccreditation.
	 * @internal
	 */
	private mapAccreditationToModel(accreditation: Accreditation, now: number): IAccreditation {
		return {
			permissionId: accreditation.id,
			accreditedBy: accreditation.accreditedBy,
			properties: this.mapFederatedPropertiesToModel(accreditation.properties, now)
		};
	}

	/**
	 * Maps the accreditations-to-attest map to a plain IAccreditation map.
	 * @param accreditationsToAttest The source map of accreditations to attest.
	 * @param now The current timestamp in milliseconds used to filter revoked entries.
	 * @returns The mapped IAccreditation record.
	 * @internal
	 */
	private mapAccreditationsToAttestToModel(
		accreditationsToAttest:
			| Map<string, { accreditations: { [id: string]: Accreditation } }>
			| undefined,
		now: number
	): {
		[id: string]: IAccreditation[];
	} {
		if (!accreditationsToAttest) {
			return {};
		}

		const result: { [id: string]: IAccreditation[] } = {};

		for (const [key, value] of accreditationsToAttest.entries()) {
			if (Is.stringValue(key)) {
				result[key] = Object.values(value.accreditations).map(acc =>
					this.mapAccreditationToModel(acc, now)
				);
			}
		}

		return result;
	}

	/**
	 * Handles an abort code from a transaction result if the transaction was aborted.
	 * @param response The transaction result to handle the abort code from.
	 * @throws {GeneralError} If the transaction was aborted with a known or unknown abort code.
	 * @internal
	 */
	private handleAbortCode(response: IIotaTransactionBlockResponse): void {
		const abortCode = Iota.extractAbortCode(response);
		if (!Is.empty(abortCode)) {
			if (abortCode === 1) {
				throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "wrongFederation");
			} else if (abortCode === 2) {
				throw new GeneralError(
					IotaHierarchiesConnector.CLASS_NAME,
					"insufficientAccreditationToAccredit"
				);
			} else if (abortCode === 3) {
				throw new GeneralError(
					IotaHierarchiesConnector.CLASS_NAME,
					"invalidPropertyValueCondition"
				);
			} else if (abortCode === 4) {
				throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "accreditationNotFound");
			} else if (abortCode === 5) {
				throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "timestampMustBeInTheFuture");
			} else if (abortCode === 6) {
				throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "propertyNotInFederation");
			} else if (abortCode === 7) {
				throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "rootAuthorityNotFound");
			} else if (abortCode === 8) {
				throw new GeneralError(
					IotaHierarchiesConnector.CLASS_NAME,
					"cannotRevokeLastRootAuthority"
				);
			} else if (abortCode === 9) {
				throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "revokedRootAuthority");
			} else if (abortCode === 10) {
				throw new GeneralError(
					IotaHierarchiesConnector.CLASS_NAME,
					"emptyAllowedValuesWithoutAllowAny"
				);
			} else if (abortCode === 11) {
				throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "alreadyRootAuthority");
			} else if (abortCode === 12) {
				throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "notRevokedRootAuthority");
			} else if (abortCode === 13) {
				throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "propertyRevoked");
			} else {
				if (response?.effects?.status?.error?.includes("vec_map::insert")) {
					throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "propertyAlreadyExists");
				}

				throw new GeneralError(IotaHierarchiesConnector.CLASS_NAME, "unknownAbortCode", {
					abortCode,
					detail: response?.effects?.status?.error ?? ""
				});
			}
		}
	}
}
