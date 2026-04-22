// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAccreditation } from "./IAccreditation.js";
import type { IProperty } from "./IProperty.js";

/**
 * Represents a governance entity in a federation hierarchy.
 * Governance entities are trusted entities that can accredit or revoke delegations.
 */
export interface IGovernance {
	/**
	 * Unique identifier for the governance entity.
	 */
	id: string;

	/**
	 * The accreditations to accredit mapping.
	 */
	accreditationsToAccredit: { [id: string]: IAccreditation[] };

	/**
	 * The accreditations to attest mapping.
	 */
	accreditationsToAttest: { [id: string]: IAccreditation[] };

	/**
	 * The set of properties this governance entity covers.
	 */
	properties: IProperty[];
}
