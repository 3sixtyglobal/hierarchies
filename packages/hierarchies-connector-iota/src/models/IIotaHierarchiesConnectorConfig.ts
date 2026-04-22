// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IIotaConfig } from "@twin.org/dlt-iota";

/**
 * Configuration for the IOTA Hierarchies Connector.
 */
export interface IIotaHierarchiesConnectorConfig extends IIotaConfig {
	/**
	 * The wallet address index to use when performing hierarchies operations.
	 * @default 0
	 */
	walletAddressIndex?: number;

	/**
	 * Enable cost logging.
	 * @default false
	 */
	enableCostLogging?: boolean;
}
