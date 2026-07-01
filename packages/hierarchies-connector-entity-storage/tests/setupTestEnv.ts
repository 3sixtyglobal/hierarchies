// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { ComponentFactory } from "@twin.org/core";
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import { nameof } from "@twin.org/nameof";
import type { IWalletConnector } from "@twin.org/wallet-models";
import * as dotenv from "dotenv";
import type { Federation } from "../src/entities/federation.js";
import { initSchema } from "../src/schema.js";

console.debug("Setting up test environment from .env and .env.dev files");

dotenv.config({
	path: [path.join(__dirname, ".env.dev"), path.join(__dirname, ".env")],
	quiet: true
});

export const TEST_NODE_IDENTITY =
	"did:entity-storage:0x0101010101010101010101010101010101010101010101010101010101010101";
export const TEST_ORGANIZATION_IDENTITY =
	"did:entity-storage:0x0202020202020202020202020202020202020202020202020202020202020202";
export const TEST_USER_IDENTITY =
	"did:entity-storage:0x0303030303030303030303030303030303030303030303030303030303030303";
export const TEST_USER_IDENTITY_2 =
	"did:entity-storage:0x0404040404040404040404040404040404040404040404040404040404040404";

export const TEST_ADDRESS_1 = "test-address-1";
export const TEST_ADDRESS_2 = "test-address-2";

initSchema();

EntityStorageConnectorFactory.register(
	"federation",
	() =>
		new MemoryEntityStorageConnector<Federation>({
			entitySchema: nameof<Federation>(),
			config: { storageKey: "federation-test-storage" }
		})
);

// Register a mock wallet connector for tests
ComponentFactory.register(
	"wallet",
	() =>
		({
			// Minimal mock implementation for required wallet methods
			getAddresses: async () => [TEST_ADDRESS_1]
			// Add more methods if tests require them
		}) as unknown as IWalletConnector
);
