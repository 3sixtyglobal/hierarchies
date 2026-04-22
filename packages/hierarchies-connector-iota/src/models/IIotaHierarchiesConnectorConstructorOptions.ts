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
	 * The wallet connector type to use.
	 * @default wallet
	 */
	walletConnectorType?: string;

	/**
	 * The logging component type.
	 * @default logging
	 */
	loggingComponentType?: string;

	/**
	 * The configuration to use for the connector.
	 */
	config: IIotaHierarchiesConnectorConfig;
}
