// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IPropertyValue } from "../index.js";
import type { IPropertyCondition } from "./IPropertyCondition.js";
import type { ITimespan } from "./ITimespan.js";

/**
 * Represents a named property with optional allowed values, a condition, and a validity timespan.
 */
export interface IProperty {
	/**
	 * The property name, can be dotted form.
	 */
	name: string;

	/**
	 * The allowed values for this property, if empty, any value is allowed.
	 */
	allowedValues?: IPropertyValue[];

	/**
	 * The condition for this property.
	 */
	condition?: IPropertyCondition;

	/**
	 * The timespan for this property.
	 */
	timespan?: ITimespan;
}
