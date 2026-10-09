// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntityStorageHierarchiesConnector } from "@3sixty/hierarchies-connector-entity-storage";
import { HierarchiesConnectorFactory } from "@3sixty/hierarchies-models";
import { HierarchiesService } from "../src/hierarchiesService.js";

describe("HierarchiesService", () => {
	test("Can create an instance", async () => {
		HierarchiesConnectorFactory.register(
			EntityStorageHierarchiesConnector.NAMESPACE,
			() => new EntityStorageHierarchiesConnector()
		);
		const service = new HierarchiesService();
		expect(service).toBeDefined();
	});
});
