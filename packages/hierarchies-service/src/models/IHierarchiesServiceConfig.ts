// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the Hierarchies Service.
 */
export interface IHierarchiesServiceConfig {
	/**
	 * The default connector namespace to use; falls back to the first registered connector if not provided.
	 */
	defaultNamespace?: string;
}
