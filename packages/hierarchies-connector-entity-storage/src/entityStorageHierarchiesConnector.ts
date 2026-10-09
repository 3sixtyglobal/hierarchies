// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	Coerce,
	ComponentFactory,
	GeneralError,
	Guards,
	Is,
	NotFoundError,
	ObjectHelper,
	RandomHelper,
	Urn
} from "@3sixty/core";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@3sixty/entity-storage-models";
import {
	type IAccreditation,
	type IFederation,
	type IHierarchiesConnector,
	type IProperty,
	type IPropertyValue,
	PropertyConstraintType,
	PropertyType
} from "@3sixty/hierarchies-models";
import type { ILoggingComponent } from "@3sixty/logging-models";
import { nameof } from "@3sixty/nameof";
import type { IWalletConnector } from "@3sixty/wallet-models";
import type { Federation } from "./entities/federation.js";
import type { IEntityStorageHierarchiesConnectorConstructorOptions } from "./models/IEntityStorageHierarchiesConnectorConstructorOptions.js";

/**
 * Entity storage connector for hierarchies scaffolding.
 * Implements the IHierarchiesConnector interface for entity storage.
 */
export class EntityStorageHierarchiesConnector implements IHierarchiesConnector {
	/**
	 * The namespace supported by the connector.
	 */
	public static readonly NAMESPACE: string = "entity-storage";

	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<EntityStorageHierarchiesConnector>();

	/**
	 * The entity storage for federation records.
	 * @internal
	 */
	private readonly _federationEntityStorage: IEntityStorageConnector<Federation>;

	/**
	 * The wallet connector.
	 * @internal
	 */
	private readonly _walletConnector: IWalletConnector;

	/**
	 * The logging component.
	 * @internal
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-private-class-members
	private readonly _logging?: ILoggingComponent;

	/**
	 * The index of the account address in the secondary indexes of the entity storage.
	 * @internal
	 */
	private readonly _accountAddressIndex: number;

	/**
	 * The index of the wallet address in the secondary indexes of the entity storage.
	 * @internal
	 */
	private readonly _walletAddressIndex: number;

	/**
	 * Create a new instance of EntityStorageHierarchiesConnector.
	 * @param options The options for the connector.
	 */
	constructor(options?: IEntityStorageHierarchiesConnectorConstructorOptions) {
		this._federationEntityStorage = EntityStorageConnectorFactory.get<
			IEntityStorageConnector<Federation>
		>(options?.federationEntityStorageType ?? "federation");
		this._walletConnector = ComponentFactory.get<IWalletConnector>(
			options?.walletConnectorType ?? "wallet"
		);
		this._logging = ComponentFactory.getIfExists(options?.loggingComponentType);
		this._accountAddressIndex = options?.config?.accountAddressIndex ?? 0;
		this._walletAddressIndex = options?.config?.walletAddressIndex ?? 0;
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return EntityStorageHierarchiesConnector.CLASS_NAME;
	}

	/**
	 * Creates a new federation.
	 * @param controllerIdentity The identity of the controller creating the federation.
	 * @param rootAuthorities The root authorities to be included in the federation.
	 * @returns The ID of the created federation as a URN.
	 */
	public async federationCreate(
		controllerIdentity: string,
		rootAuthorities?: string[]
	): Promise<string> {
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		try {
			const walletAddresses = await this._walletConnector.getAddresses(
				controllerIdentity,
				this._accountAddressIndex,
				this._walletAddressIndex,
				1
			);
			const id = RandomHelper.generateUuidV7("compact");

			// Always add the controller as a root authority
			const rootAuthoritiesList = [
				{ id: RandomHelper.generateUuidV7("compact"), accountId: walletAddresses[0] }
			];

			if (Is.arrayValue(rootAuthorities)) {
				for (const accountId of rootAuthorities) {
					rootAuthoritiesList.push({
						id: RandomHelper.generateUuidV7("compact"),
						accountId
					});
				}
			}

			// Initialize accreditations for the controller
			const accreditationsToAccredit = { [walletAddresses[0]]: [] };
			const accreditationsToAttest = { [walletAddresses[0]]: [] };
			const federation: Federation = {
				id,
				rootAuthorities: rootAuthoritiesList,
				revokedRootAuthorities: [],
				governance: {
					id: RandomHelper.generateUuidV7("compact"),
					accreditationsToAccredit,
					accreditationsToAttest,
					properties: []
				},
				controllerIdentity
			};
			await this._federationEntityStorage.set(federation);
			return `federation:${new Urn(EntityStorageHierarchiesConnector.NAMESPACE, id).toString()}`;
		} catch (error) {
			throw new GeneralError(
				EntityStorageHierarchiesConnector.CLASS_NAME,
				"federationCreateFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Retrieves a federation by its ID.
	 * @param federationId The URN of the federation to retrieve.
	 * @param options Options for retrieving the federation.
	 * @param options.includeRevokedProperties Whether to include revoked properties in the retrieved federation, defaults to false.
	 * @returns The federation with the specified URN.
	 */
	public async federationGet(
		federationId: string,
		options?: { includeRevokedProperties?: boolean }
	): Promise<IFederation> {
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(federationId),
			federationId
		);
		const id = this.getFederationIdFromUrn(federationId);
		try {
			const federation = await this._federationEntityStorage.get(id);
			if (Is.empty(federation)) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"federationNotFound",
					federationId
				);
			}

			if (
				!(options?.includeRevokedProperties ?? false) &&
				Is.arrayValue(federation.governance.properties)
			) {
				const now = BigInt(Date.now());
				federation.governance.properties = federation.governance.properties.filter(
					property => !this.isPropertyRevoked(property, now)
				);
			}

			ObjectHelper.propertyDelete(federation, "controllerIdentity");

			return { ...federation, id: federationId };
		} catch (error) {
			throw new GeneralError(
				EntityStorageHierarchiesConnector.CLASS_NAME,
				"federationGetFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Adds a new authority to an existing federation.
	 * @param controllerIdentity The identity of the controller adding the authority.
	 * @param federationId The URN of the federation to which the authority will be added.
	 * @param accountId The account ID of the authority to be added.
	 * @returns The id of the authority.
	 */
	public async authorityAdd(
		controllerIdentity: string,
		federationId: string,
		accountId: string
	): Promise<string> {
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Urn.guard(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(accountId), accountId);
		const id = this.getFederationIdFromUrn(federationId);
		try {
			const federation = await this._federationEntityStorage.get(id);
			if (Is.empty(federation)) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"federationNotFound",
					federationId
				);
			}
			if (federation.controllerIdentity !== controllerIdentity) {
				throw new GeneralError(EntityStorageHierarchiesConnector.CLASS_NAME, "notController");
			}

			// If revoked, move back to rootAuthorities
			if (federation.revokedRootAuthorities.includes(accountId)) {
				federation.revokedRootAuthorities = federation.revokedRootAuthorities.filter(
					a => a !== accountId
				);
			} else if (federation.rootAuthorities.some(a => a.accountId === accountId)) {
				// Throw if already a root authority
				throw new GeneralError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"authorityAlreadyExists",
					{ accountId }
				);
			}
			const newId = RandomHelper.generateUuidV7("compact");
			federation.rootAuthorities.push({ id: newId, accountId });
			await this._federationEntityStorage.set(federation);
			return newId;
		} catch (error) {
			throw new GeneralError(
				EntityStorageHierarchiesConnector.CLASS_NAME,
				"authorityAddFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Removes an authority from an existing federation.
	 * @param controllerIdentity The identity of the controller removing the authority.
	 * @param federationId The URN of the federation from which the authority will be removed.
	 * @param accountId The account ID of the authority to be removed.
	 * @returns A promise that resolves when the authority has been removed.
	 */
	public async authorityRemove(
		controllerIdentity: string,
		federationId: string,
		accountId: string
	): Promise<void> {
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Urn.guard(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(accountId), accountId);
		const id = this.getFederationIdFromUrn(federationId);
		try {
			const federation = await this._federationEntityStorage.get(id);
			if (Is.empty(federation)) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"federationNotFound",
					federationId
				);
			}
			if (federation.controllerIdentity !== controllerIdentity) {
				throw new GeneralError(EntityStorageHierarchiesConnector.CLASS_NAME, "notController");
			}
			const authorityIdx = federation.rootAuthorities.findIndex(a => a.accountId === accountId);
			if (authorityIdx === -1) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"authorityNotFound",
					accountId
				);
			}
			federation.rootAuthorities.splice(authorityIdx, 1);
			federation.revokedRootAuthorities.push(accountId);
			await this._federationEntityStorage.set(federation);
		} catch (error) {
			throw new GeneralError(
				EntityStorageHierarchiesConnector.CLASS_NAME,
				"authorityRemoveFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Adds a new property to an existing federation.
	 * @param controllerIdentity The identity of the controller adding the property.
	 * @param federationId The URN of the federation to which the property will be added.
	 * @param property The property to be added.
	 * @returns A promise that resolves when the property has been added.
	 */
	public async propertyAdd(
		controllerIdentity: string,
		federationId: string,
		property: IProperty
	): Promise<void> {
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Urn.guard(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.objectValue(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(property), property);
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(property.name),
			property.name
		);
		const id = this.getFederationIdFromUrn(federationId);
		try {
			const federation = await this._federationEntityStorage.get(id);
			if (Is.empty(federation)) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"federationNotFound",
					federationId
				);
			}
			if (federation.controllerIdentity !== controllerIdentity) {
				throw new GeneralError(EntityStorageHierarchiesConnector.CLASS_NAME, "notController");
			}
			// Validate allowedValues[].type using Guards.arrayOneOf
			if (Is.arrayValue(property.allowedValues)) {
				for (const allowedValue of property.allowedValues) {
					Guards.arrayOneOf(
						EntityStorageHierarchiesConnector.CLASS_NAME,
						nameof(allowedValue.type),
						allowedValue.type,
						Object.values(PropertyType)
					);
				}
			}

			const existing = federation.governance.properties.find(p => p.name === property.name);
			if (existing) {
				const now = BigInt(Date.now());
				if (this.isPropertyRevoked(existing, now)) {
					existing.timespan = {};
				} else {
					throw new GeneralError(EntityStorageHierarchiesConnector.CLASS_NAME, "propertyDuplicate");
				}
			} else {
				federation.governance.properties.push(property);
			}
			await this._federationEntityStorage.set(federation);
		} catch (error) {
			throw new GeneralError(
				EntityStorageHierarchiesConnector.CLASS_NAME,
				"propertyAddFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Removes a property from an existing federation.
	 * @param controllerIdentity The identity of the controller removing the property.
	 * @param federationId The URN of the federation from which the property will be removed.
	 * @param propertyName The name of the property to be removed.
	 * @returns A promise that resolves when the property has been removed.
	 */
	public async propertyRemove(
		controllerIdentity: string,
		federationId: string,
		propertyName: string
	): Promise<void> {
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Urn.guard(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(propertyName),
			propertyName
		);
		const id = this.getFederationIdFromUrn(federationId);
		try {
			const federation = await this._federationEntityStorage.get(id);
			if (Is.empty(federation)) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"federationNotFound",
					federationId
				);
			}
			if (federation.controllerIdentity !== controllerIdentity) {
				throw new GeneralError(EntityStorageHierarchiesConnector.CLASS_NAME, "notController");
			}
			const prop = federation.governance.properties.find(p => p.name === propertyName);
			if (prop) {
				prop.timespan ??= {};
				prop.timespan.validTo = Date.now().toString();
			}
			await this._federationEntityStorage.set(federation);
		} catch (error) {
			throw new GeneralError(
				EntityStorageHierarchiesConnector.CLASS_NAME,
				"propertyRemoveFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Gets a property from an existing federation.
	 * @param federationId The URN of the federation from which the property will be retrieved.
	 * @param propertyName The name of the property to be retrieved.
	 * @returns A promise that resolves with the property.
	 */
	public async propertyGet(federationId: string, propertyName: string): Promise<IProperty> {
		Urn.guard(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(propertyName),
			propertyName
		);

		const id = this.getFederationIdFromUrn(federationId);
		try {
			const federation = await this._federationEntityStorage.get(id);
			if (Is.empty(federation)) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"federationNotFound",
					federationId
				);
			}
			const property = federation.governance.properties.find(p => p.name === propertyName);
			if (!property) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"propertyNotFound",
					propertyName
				);
			}
			return property;
		} catch (error) {
			throw new GeneralError(
				EntityStorageHierarchiesConnector.CLASS_NAME,
				"propertyGetFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Gets all properties from an existing federation.
	 * @param federationId The URN of the federation from which the properties will be retrieved.
	 * @param options Options for retrieving the properties.
	 * @param options.includeRevokedProperties Whether to include revoked properties in the retrieved properties, defaults to false.
	 * @returns A promise that resolves with the properties.
	 */
	public async propertiesGet(
		federationId: string,
		options?: { includeRevokedProperties?: boolean }
	): Promise<IProperty[]> {
		Urn.guard(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		const id = this.getFederationIdFromUrn(federationId);
		try {
			const federation = await this._federationEntityStorage.get(id);
			if (Is.empty(federation)) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"federationNotFound",
					federationId
				);
			}

			if (
				!(options?.includeRevokedProperties ?? false) &&
				Is.arrayValue(federation.governance.properties)
			) {
				const now = BigInt(Date.now());
				federation.governance.properties = federation.governance.properties.filter(
					property => !this.isPropertyRevoked(property, now)
				);
			}

			return federation.governance.properties;
		} catch (error) {
			throw new GeneralError(
				EntityStorageHierarchiesConnector.CLASS_NAME,
				"propertiesGetFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Validates property for an existing federation.
	 * @param federationId The URN of the federation for which the property will be validated.
	 * @param attesterId The ID of the entity attesting the property.
	 * @param propertyName The name of the property to be validated.
	 * @param propertyValue The value of the property to be validated.
	 * @returns A promise that resolves with a boolean indicating whether the property is valid.
	 */
	public async propertyValidate(
		federationId: string,
		attesterId: string,
		propertyName: string,
		propertyValue: IPropertyValue
	): Promise<boolean> {
		Urn.guard(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(attesterId),
			attesterId
		);
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(propertyName),
			propertyName
		);

		const id = this.getFederationIdFromUrn(federationId);
		const now = BigInt(Date.now());
		const federation = await this._federationEntityStorage.get(id);
		if (Is.empty(federation)) {
			return false;
		}
		return this.isPropertyValid(federation, attesterId, propertyName, propertyValue, now);
	}

	/**
	 * Validates properties for an existing federation.
	 * @param federationId The URN of the federation for which the properties will be validated.
	 * @param attesterId The ID of the entity attesting the properties.
	 * @param propertiesToValidate The properties to be validated.
	 * @returns A promise that resolves with a boolean indicating whether the properties are valid.
	 */
	public async propertiesValidate(
		federationId: string,
		attesterId: string,
		propertiesToValidate: { [propertyName: string]: IPropertyValue }
	): Promise<boolean> {
		Urn.guard(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(attesterId),
			attesterId
		);

		const id = this.getFederationIdFromUrn(federationId);
		const now = BigInt(Date.now());
		const federation = await this._federationEntityStorage.get(id);
		if (Is.empty(federation)) {
			return false;
		}
		for (const [propertyName, propertyValue] of Object.entries(propertiesToValidate)) {
			if (!this.isPropertyValid(federation, attesterId, propertyName, propertyValue, now)) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Adds a new accreditation to attest to an existing federation.
	 * @param controllerIdentity The identity of the controller adding the accreditation.
	 * @param federationId The URN of the federation to which the accreditation will be added.
	 * @param accreditation The accreditation to be added.
	 * @returns The ID of the added accreditation.
	 */
	public async accreditationToAttestAdd(
		controllerIdentity: string,
		federationId: string,
		accreditation: Omit<IAccreditation, "permissionId">
	): Promise<string> {
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Urn.guard(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);

		const id = this.getFederationIdFromUrn(federationId);
		try {
			const federation = await this._federationEntityStorage.get(id);
			if (Is.empty(federation)) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"federationNotFound",
					federationId
				);
			}
			if (federation.controllerIdentity !== controllerIdentity) {
				throw new GeneralError(EntityStorageHierarchiesConnector.CLASS_NAME, "notController");
			}
			// Throw if any accreditation property is missing or revoked
			if (Is.arrayValue(accreditation.properties)) {
				const now = BigInt(Date.now());
				for (const prop of accreditation.properties) {
					const federationProp = federation.governance.properties.find(p => p.name === prop.name);
					if (!federationProp) {
						throw new GeneralError(
							EntityStorageHierarchiesConnector.CLASS_NAME,
							"accreditationPropertyMissing",
							{ propertyName: prop.name }
						);
					}
					if (this.isPropertyRevoked(federationProp, now)) {
						throw new GeneralError(
							EntityStorageHierarchiesConnector.CLASS_NAME,
							"accreditationPropertyRevoked",
							{ propertyName: prop.name }
						);
					}
				}
			}
			const permissionId = RandomHelper.generateUuidV7("compact");
			const acc: IAccreditation = { ...accreditation, permissionId };
			federation.governance.accreditationsToAttest[accreditation.accreditedBy] ??= [];
			federation.governance.accreditationsToAttest[accreditation.accreditedBy].push(acc);
			await this._federationEntityStorage.set(federation);
			return permissionId;
		} catch (error) {
			throw new GeneralError(
				EntityStorageHierarchiesConnector.CLASS_NAME,
				"accreditationToAttestAddFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Removes an accreditation to attest from an existing federation.
	 * @param controllerIdentity The identity of the controller removing the accreditation.
	 * @param federationId The URN of the federation from which the accreditation will be removed.
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
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Urn.guard(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);

		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(accreditedById),
			accreditedById
		);
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(permissionId),
			permissionId
		);
		const id = this.getFederationIdFromUrn(federationId);
		try {
			const federation = await this._federationEntityStorage.get(id);
			if (Is.empty(federation)) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"federationNotFound",
					federationId
				);
			}
			if (federation.controllerIdentity !== controllerIdentity) {
				throw new GeneralError(EntityStorageHierarchiesConnector.CLASS_NAME, "notController");
			}
			const accreditations = federation.governance.accreditationsToAttest[accreditedById] ?? [];
			federation.governance.accreditationsToAttest[accreditedById] = accreditations.filter(
				a => a.permissionId !== permissionId
			);
			await this._federationEntityStorage.set(federation);
		} catch (error) {
			throw new GeneralError(
				EntityStorageHierarchiesConnector.CLASS_NAME,
				"accreditationToAttestRemoveFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Get accreditation to attest to an existing federation.
	 * @param federationId The URN of the federation for which to get the accreditation.
	 * @param accreditedById The ID of the entity that granted the accreditation.
	 * @param permissionId The ID of the accreditation to be retrieved.
	 * @returns A promise that resolves with the accreditation.
	 */
	public async accreditationToAttestGet(
		federationId: string,
		accreditedById: string,
		permissionId: string
	): Promise<IAccreditation> {
		Urn.guard(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(accreditedById),
			accreditedById
		);
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(permissionId),
			permissionId
		);
		const id = this.getFederationIdFromUrn(federationId);
		try {
			const federation = await this._federationEntityStorage.get(id);
			if (Is.empty(federation)) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"federationNotFound",
					federationId
				);
			}
			const accreditations = federation.governance.accreditationsToAttest[accreditedById] ?? [];
			const acc = accreditations.find(a => a.permissionId === permissionId);
			if (!acc) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"accreditationNotFound",
					permissionId
				);
			}
			return acc;
		} catch (error) {
			throw new GeneralError(
				EntityStorageHierarchiesConnector.CLASS_NAME,
				"accreditationToAttestGetFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Gets accreditations to attest to an existing federation.
	 * @param federationId The URN of the federation for which to get the accreditations.
	 * @param accreditedById The ID of the entity that granted the accreditations.
	 * @returns A promise that resolves with the accreditations.
	 */
	public async accreditationsToAttestGet(
		federationId: string,
		accreditedById: string
	): Promise<IAccreditation[]> {
		Urn.guard(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(accreditedById),
			accreditedById
		);
		const id = this.getFederationIdFromUrn(federationId);
		try {
			const federation = await this._federationEntityStorage.get(id);
			if (Is.empty(federation)) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"federationNotFound",
					federationId
				);
			}
			return federation.governance.accreditationsToAttest[accreditedById] ?? [];
		} catch (error) {
			throw new GeneralError(
				EntityStorageHierarchiesConnector.CLASS_NAME,
				"accreditationsToAttestGetFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Adds a new accreditation to accredit to an existing federation.
	 * @param controllerIdentity The identity of the controller adding the accreditation.
	 * @param federationId The URN of the federation to which the accreditation will be added.
	 * @param accreditation The accreditation to be added.
	 * @returns The ID of the added accreditation.
	 */
	public async accreditationToAccreditAdd(
		controllerIdentity: string,
		federationId: string,
		accreditation: Omit<IAccreditation, "permissionId">
	): Promise<string> {
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Urn.guard(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		const id = this.getFederationIdFromUrn(federationId);
		try {
			const federation = await this._federationEntityStorage.get(id);
			if (Is.empty(federation)) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"federationNotFound",
					federationId
				);
			}
			if (federation.controllerIdentity !== controllerIdentity) {
				throw new GeneralError(EntityStorageHierarchiesConnector.CLASS_NAME, "notController");
			}
			// Throw if any accreditation property is revoked
			if (Is.arrayValue(accreditation.properties)) {
				const now = BigInt(Date.now());
				for (const prop of accreditation.properties) {
					const federationProp = federation.governance.properties.find(p => p.name === prop.name);
					if (!federationProp) {
						throw new GeneralError(
							EntityStorageHierarchiesConnector.CLASS_NAME,
							"accreditationPropertyMissing",
							{ propertyName: prop.name }
						);
					}
					if (this.isPropertyRevoked(federationProp, now)) {
						throw new GeneralError(
							EntityStorageHierarchiesConnector.CLASS_NAME,
							"accreditationPropertyRevoked",
							{ propertyName: prop.name }
						);
					}
				}
			}
			const permissionId = RandomHelper.generateUuidV7("compact");
			const acc: IAccreditation = { ...accreditation, permissionId };
			federation.governance.accreditationsToAccredit[accreditation.accreditedBy] ??= [];
			federation.governance.accreditationsToAccredit[accreditation.accreditedBy].push(acc);
			await this._federationEntityStorage.set(federation);
			return permissionId;
		} catch (error) {
			throw new GeneralError(
				EntityStorageHierarchiesConnector.CLASS_NAME,
				"accreditationToAccreditAddFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Removes an accreditation to accredit from an existing federation.
	 * @param controllerIdentity The identity of the controller removing the accreditation.
	 * @param federationId The URN of the federation from which the accreditation will be removed.
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
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Urn.guard(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(accreditedById),
			accreditedById
		);
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(permissionId),
			permissionId
		);
		const id = this.getFederationIdFromUrn(federationId);
		try {
			const federation = await this._federationEntityStorage.get(id);
			if (Is.empty(federation)) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"federationNotFound",
					federationId
				);
			}
			if (federation.controllerIdentity !== controllerIdentity) {
				throw new GeneralError(EntityStorageHierarchiesConnector.CLASS_NAME, "notController");
			}
			const accreditations = federation.governance.accreditationsToAccredit[accreditedById] ?? [];
			federation.governance.accreditationsToAccredit[accreditedById] = accreditations.filter(
				a => a.permissionId !== permissionId
			);
			await this._federationEntityStorage.set(federation);
		} catch (error) {
			throw new GeneralError(
				EntityStorageHierarchiesConnector.CLASS_NAME,
				"accreditationToAccreditRemoveFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Get accreditation to accredit to an existing federation.
	 * @param federationId The URN of the federation for which to get the accreditation.
	 * @param accreditedById The ID of the entity that granted the accreditation.
	 * @param permissionId The ID of the accreditation to be retrieved.
	 * @returns A promise that resolves with the accreditation.
	 */
	public async accreditationToAccreditGet(
		federationId: string,
		accreditedById: string,
		permissionId: string
	): Promise<IAccreditation> {
		Urn.guard(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(federationId),
			federationId
		);
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(accreditedById),
			accreditedById
		);
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(permissionId),
			permissionId
		);
		const id = this.getFederationIdFromUrn(federationId);
		try {
			const federation = await this._federationEntityStorage.get(id);
			if (Is.empty(federation)) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"federationNotFound",
					federationId
				);
			}
			const accreditations = federation.governance.accreditationsToAccredit[accreditedById] ?? [];
			const acc = accreditations.find(a => a.permissionId === permissionId);
			if (!acc) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"accreditationNotFound",
					permissionId
				);
			}
			return acc;
		} catch (error) {
			throw new GeneralError(
				EntityStorageHierarchiesConnector.CLASS_NAME,
				"accreditationToAccreditGetFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Gets accreditations to accredit to an existing federation.
	 * @param federationId The URN of the federation for which to get the accreditations.
	 * @param accreditedById The ID of the entity that granted the accreditations.
	 * @returns A promise that resolves with the accreditations.
	 */
	public async accreditationsToAccreditGet(
		federationId: string,
		accreditedById: string
	): Promise<IAccreditation[]> {
		Urn.guard(EntityStorageHierarchiesConnector.CLASS_NAME, nameof(federationId), federationId);
		Guards.stringValue(
			EntityStorageHierarchiesConnector.CLASS_NAME,
			nameof(accreditedById),
			accreditedById
		);
		const id = this.getFederationIdFromUrn(federationId);
		try {
			const federation = await this._federationEntityStorage.get(id);
			if (Is.empty(federation)) {
				throw new NotFoundError(
					EntityStorageHierarchiesConnector.CLASS_NAME,
					"federationNotFound",
					federationId
				);
			}
			return federation.governance.accreditationsToAccredit[accreditedById] ?? [];
		} catch (error) {
			throw new GeneralError(
				EntityStorageHierarchiesConnector.CLASS_NAME,
				"accreditationsToAccreditGetFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Extracts the federation ID from the given URN and validates the namespace.
	 * @param federationId The URN of the federation.
	 * @returns The extracted federation ID.
	 * @throws GeneralError if the URN namespace does not match the expected namespace.
	 * @internal
	 */
	private getFederationIdFromUrn(federationId: string): string {
		const urnParsed = Urn.fromValidString(federationId);
		if (urnParsed.namespaceMethod() !== EntityStorageHierarchiesConnector.NAMESPACE) {
			throw new GeneralError(EntityStorageHierarchiesConnector.CLASS_NAME, "namespaceMismatch", {
				namespace: EntityStorageHierarchiesConnector.NAMESPACE,
				id: federationId
			});
		}
		return urnParsed.namespaceSpecific(1);
	}

	/**
	 * Validates a single property for an existing federation at a given time.
	 * @param federation The federation object.
	 * @param attesterId The ID of the entity attesting the property.
	 * @param propertyName The name of the property to be validated.
	 * @param propertyValue The value of the property to be validated.
	 * @param now The timestamp to use for validation.
	 * @returns True if the property is valid, false otherwise.
	 * @internal
	 */
	private isPropertyValid(
		federation: IFederation,
		attesterId: string,
		propertyName: string,
		propertyValue: IPropertyValue,
		now: bigint
	): boolean {
		// 1. Property must exist and not be revoked
		const prop = federation.governance.properties.find(p => p.name === propertyName);
		if (!prop) {
			return false;
		}
		if (this.isPropertyRevoked(prop, now)) {
			return false;
		}
		// If allowedValues is set, value must be in allowedValues
		if (Is.arrayValue(prop.allowedValues)) {
			const found = prop.allowedValues.some(
				v => v.type === propertyValue.type && v.value === propertyValue.value
			);
			if (!found) {
				return false;
			}
		}

		if (!Is.empty(prop.condition)) {
			if (propertyValue.type !== prop.condition.type) {
				return false;
			}
			const val = propertyValue.value;
			const condValue = prop.condition.value;
			const constraint = prop.condition.constraint;
			switch (constraint) {
				case PropertyConstraintType.Contains: {
					if (!val.includes(condValue)) {
						return false;
					}
					break;
				}
				case PropertyConstraintType.StartsWith: {
					if (!val.startsWith(condValue)) {
						return false;
					}
					break;
				}
				case PropertyConstraintType.EndsWith: {
					if (!val.endsWith(condValue)) {
						return false;
					}
					break;
				}
				case PropertyConstraintType.GreaterThan: {
					if (BigInt(val) <= BigInt(condValue)) {
						return false;
					}
					break;
				}
				case PropertyConstraintType.LessThan: {
					if (BigInt(val) >= BigInt(condValue)) {
						return false;
					}
					break;
				}
			}
		}

		// 2. Attester must have accreditations to attest
		const accreditations = federation.governance.accreditationsToAttest?.[attesterId];
		if (!Is.arrayValue(accreditations)) {
			return false;
		}

		// 3. Attester must have permission for the property
		const allowed = accreditations.some(acc =>
			acc.properties?.some(ap => ap.name === propertyName)
		);
		return allowed;
	}

	/**
	 * Determines if a property is revoked (invalid due to timespan).
	 * @param property The property to check.
	 * @param now The current timestamp as bigint.
	 * @returns True if revoked, false otherwise.
	 * @internal
	 */
	private isPropertyRevoked(property: IProperty, now: bigint): boolean {
		const validTo = Coerce.bigint(property.timespan?.validTo);
		if (Is.bigint(validTo) && now >= validTo) {
			return true;
		}
		const validFrom = Coerce.bigint(property.timespan?.validFrom);
		if (Is.bigint(validFrom) && now <= validFrom) {
			return true;
		}
		return false;
	}
}
