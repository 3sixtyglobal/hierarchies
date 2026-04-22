// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IPropertyValue } from "../index.js";
import type { IPropertyCondition } from "./IPropertyCondition.js";
import type { ITimespan } from "./ITimespan.js";

/**
 * Represents a property that can be granted to an account. A property
 * consists of a set of properties that must be satisfied by the account
 * in order to be granted the property.
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
