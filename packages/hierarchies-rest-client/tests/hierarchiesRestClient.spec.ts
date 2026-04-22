// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HierarchiesRestClient } from "../src/hierarchiesRestClient.js";

describe("HierarchiesRestClient", () => {
	test("Can create an instance", async () => {
		const client = new HierarchiesRestClient({ endpoint: "http://localhost:8080" });
		expect(client).toBeDefined();
	});
});
