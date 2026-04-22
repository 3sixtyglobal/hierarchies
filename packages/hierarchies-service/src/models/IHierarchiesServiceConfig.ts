// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the Hierarchies Service.
 */
export interface IHierarchiesServiceConfig {
	/**
	 * What is the default connector to use for hierarchies. If not provided the first connector from the factory will be used.
	 */
	defaultNamespace?: string;
}
