// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { PropertyConstraintType } from "./propertyConstraintType.js";
import type { PropertyType } from "./propertyType.js";

/**
 * Describes the condition and constraints of a property within a hierarchy.
 */
export interface IPropertyCondition {
	/**
	 * The property type.
	 */
	type: PropertyType;

	/**
	 * The property value.
	 */
	value: string;

	/**
	 * The constraint for this property.
	 */
	constraint?: PropertyConstraintType;
}
