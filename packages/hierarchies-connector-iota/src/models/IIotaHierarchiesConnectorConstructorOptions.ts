// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IIotaHierarchiesConnectorConfig } from "./IIotaHierarchiesConnectorConfig.js";

/**
 * Options for the IotaHierarchiesConnector constructor.
 */
export interface IIotaHierarchiesConnectorConstructorOptions {
	/**
	 * The vault connector type to use.
	 * @default vault
	 */
	vaultConnectorType?: string;

	/**
	 * The logging component type.
	 */
	loggingComponentType?: string;

	/**
	 * The configuration to use for the connector.
	 */
	config: IIotaHierarchiesConnectorConfig;
}
