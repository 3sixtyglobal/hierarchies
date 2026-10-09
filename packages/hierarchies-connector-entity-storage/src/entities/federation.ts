// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity, property } from "@3sixty/entity";
import type { IGovernance, IRootAuthority } from "@3sixty/hierarchies-models";

/**
 * Class describing a federation record.
 */
@entity()
export class Federation {
	/**
	 * The identity of the federation record.
	 */
	@property({ type: "string", isPrimary: true, maxLength: 255 })
	public id!: string;

	/**
	 * List of root authority IDs associated with this federation.
	 */
	@property({ type: "array" })
	public rootAuthorities!: IRootAuthority[];

	/**
	 * Account IDs of root authorities that have been revoked and are no longer trusted.
	 */
	@property({ type: "array" })
	public revokedRootAuthorities!: string[];

	/**
	 * The governance entity that manages accreditations and attestations within the federation.
	 */
	@property({ type: "object" })
	public governance!: IGovernance;

	/**
	 * The controller identity.
	 */
	@property({ type: "string", maxLength: 255 })
	public controllerIdentity!: string;
}
