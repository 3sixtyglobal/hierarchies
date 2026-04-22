// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IProperty } from "./IProperty.js";

/**
 * Represents an accreditation, which is a collection of properties granted by an accreditor.
 */
export interface IAccreditation {
	/**
	 * Unique identifier for the accreditation.
	 */
	permissionId: string;

	/**
	 * The identifier of the entity that granted the accreditation.
	 */
	accreditedBy: string;

	/**
	 * Properties associated with this accreditation.
	 */
	properties: IProperty[];
}
