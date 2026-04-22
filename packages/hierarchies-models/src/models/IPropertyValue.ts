// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { PropertyType } from "./propertyType.js";

/**
 * Describes the value of a property.
 */
export interface IPropertyValue {
	/**
	 * The property type.
	 */
	type: PropertyType;

	/**
	 * The property value.
	 */
	value: string;
}
