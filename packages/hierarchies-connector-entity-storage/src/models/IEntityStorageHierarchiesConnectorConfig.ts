// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Options for the entity storage hierarchies connector constructor.
 */
export interface IEntityStorageHierarchiesConnectorConfig {
	/**
	 * The account address index.
	 * @default 0
	 */
	accountAddressIndex?: number;

	/**
	 * The wallet address index.
	 * @default 0
	 */
	walletAddressIndex?: number;
}
