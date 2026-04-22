// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ICreatedResponse, IHttpRequestContext, IRestRoute, ITag } from "@twin.org/api-models";
import { ContextIdHelper, ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { ComponentFactory, Guards } from "@twin.org/core";
import type {
	IHierarchiesComponent,
	IHierarchiesFederationCreateRequest,
	IHierarchiesFederationGetRequest,
	IHierarchiesFederationGetResponse
} from "@twin.org/hierarchies-models";
import { nameof } from "@twin.org/nameof";
import { HeaderTypes, HttpStatusCode } from "@twin.org/web";

/**
 * The source for the routes.
 */
export const ROUTES_SOURCE = "hierarchiesRoutes";

/**
 * The tag to associate with the routes.
 */
export const tagsHierarchies: ITag[] = [
	{
		name: "Hierarchies",
		description: "Endpoints which are modelled to access a hierarchies service."
	}
];

/**
 * The REST routes for hierarchies.
 * @param baseRouteName Prefix to prepend to the paths.
 * @param componentName The name of the component to use in the routes stored in the ComponentFactory.
 * @returns The generated routes.
 */
export function generateRestRoutesHierarchies(
	baseRouteName: string,
	componentName: string
): IRestRoute[] {
	const federationCreateRoute: IRestRoute<IHierarchiesFederationCreateRequest, ICreatedResponse> = {
		operationId: "hierarchiesFederationCreate",
		summary: "Create a federation",
		tag: tagsHierarchies[0].name,
		method: "POST",
		path: `${baseRouteName}/`,
		handler: async (httpRequestContext, request) =>
			hierarchiesFederationCreate(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IHierarchiesFederationCreateRequest>(),
			examples: [
				{
					id: "hierarchiesFederationCreateRequestExample",
					request: {
						body: {
							rootAuthorities: ["acc-1", "acc-2"]
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<ICreatedResponse>(),
				examples: [
					{
						id: "hierarchiesFederationCreateResponseExample",
						response: {
							statusCode: 201,
							headers: { location: "hierarchies:iota:123" }
						}
					}
				]
			}
		]
	};

	const federationGetRoute: IRestRoute<
		IHierarchiesFederationGetRequest,
		IHierarchiesFederationGetResponse
	> = {
		operationId: "hierarchiesFederationGet",
		summary: "Get a federation by its ID",
		tag: tagsHierarchies[0].name,
		method: "GET",
		path: `${baseRouteName}/:federationId`,
		handler: async (httpRequestContext, request) =>
			hierarchiesFederationGet(httpRequestContext, componentName, request),
		requestType: {
			type: "IHierarchiesFederationGetRequest",
			examples: [
				{
					id: "hierarchiesFederationGetRequestExample",
					request: {
						pathParams: { federationId: "hierarchies:iota:123" }
					}
				}
			]
		},
		responseType: [
			{
				type: "IHierarchiesFederationGetResponse",
				examples: [
					{
						id: "hierarchiesFederationGetResponseExample",
						response: {
							body: {
								id: "hierarchies:iota:123",
								rootAuthorities: [
									{ id: "11111", accountId: "acc-1" },
									{ id: "22222", accountId: "acc-2" }
								],
								revokedRootAuthorities: [],
								governance: {
									id: "gov-1",
									accreditationsToAccredit: {},
									accreditationsToAttest: {},
									properties: []
								}
							}
						}
					}
				]
			}
		]
	};

	// TODO Implement other REST routes for hierarchies, e.g., to manage authorities, delegations, and governance.

	return [federationCreateRoute, federationGetRoute];
}

/**
 * Handles a request to create a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request to create a federation, containing the body with root authorities and optional namespace.
 * @returns The response object with HTTP status and Location header for the created federation.
 */
export async function hierarchiesFederationCreate(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesFederationCreateRequest
): Promise<ICreatedResponse> {
	Guards.object<IHierarchiesFederationCreateRequest["body"]>(
		ROUTES_SOURCE,
		nameof(request.body),
		request.body
	);

	const contextIds = await ContextIdStore.getContextIds();
	ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);

	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	const result = await component.federationCreate(
		request.body.rootAuthorities,
		request.body.namespace,
		contextIds[ContextIdKeys.Organization]
	);

	return {
		statusCode: HttpStatusCode.created,
		headers: {
			[HeaderTypes.Location]: result
		}
	};
}

/**
 * Handles a request to get a federation by its ID.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request object.
 * @returns The response object with the federation in the body.
 */
export async function hierarchiesFederationGet(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesFederationGetRequest
): Promise<IHierarchiesFederationGetResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);
	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	const federation = await component.federationGet(request.pathParams.federationId);
	return { body: federation };
}
