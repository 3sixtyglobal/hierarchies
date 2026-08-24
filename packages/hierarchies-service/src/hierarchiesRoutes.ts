// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	HttpContextIdKeys,
	HttpHeaderHelper,
	HttpUrlHelper,
	type ICreatedResponse,
	type IHttpRequestContext,
	type INoContentResponse,
	type IRestRoute,
	type ITag
} from "@twin.org/api-models";
import { ContextIdHelper, ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { Coerce, ComponentFactory, Guards } from "@twin.org/core";
import type {
	IHierarchiesAccreditationAddRequest,
	IHierarchiesAccreditationGetRequest,
	IHierarchiesAccreditationGetResponse,
	IHierarchiesAccreditationRemoveRequest,
	IHierarchiesAccreditationsGetRequest,
	IHierarchiesAccreditationsGetResponse,
	IHierarchiesAuthorityAddRequest,
	IHierarchiesAuthorityRemoveRequest,
	IHierarchiesComponent,
	IHierarchiesFederationCreateRequest,
	IHierarchiesFederationGetRequest,
	IHierarchiesFederationGetResponse,
	IHierarchiesPropertiesGetRequest,
	IHierarchiesPropertiesGetResponse,
	IHierarchiesPropertiesValidateRequest,
	IHierarchiesPropertiesValidateResponse,
	IHierarchiesPropertyAddRequest,
	IHierarchiesPropertyGetRequest,
	IHierarchiesPropertyGetResponse,
	IHierarchiesPropertyRemoveRequest,
	IHierarchiesPropertyValidateRequest,
	IHierarchiesPropertyValidateResponse
} from "@twin.org/hierarchies-models";
import { nameof } from "@twin.org/nameof";
import { HttpStatusCode, type IHttpHeaders } from "@twin.org/web";

/**
 * Source identifier used when constructing guard and error messages within routes.
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
			hierarchiesFederationCreate(httpRequestContext, componentName, request, baseRouteName),
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

	const authorityAddRoute: IRestRoute<IHierarchiesAuthorityAddRequest, ICreatedResponse> = {
		operationId: "hierarchiesAuthorityAdd",
		summary: "Add an authority to a federation",
		tag: tagsHierarchies[0].name,
		method: "POST",
		path: `${baseRouteName}/:federationId/authorities`,
		handler: async (httpRequestContext, request) =>
			hierarchiesAuthorityAdd(httpRequestContext, componentName, request, baseRouteName),
		requestType: {
			type: nameof<IHierarchiesAuthorityAddRequest>(),
			examples: [
				{
					id: "hierarchiesAuthorityAddRequestExample",
					request: {
						pathParams: { federationId: "hierarchies:iota:123" },
						body: { accountId: "acc-1" }
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<ICreatedResponse>(),
				examples: [
					{
						id: "hierarchiesAuthorityAddResponseExample",
						response: { statusCode: 201, headers: { location: "hierarchies:iota:auth-1" } }
					}
				]
			}
		]
	};

	const authorityRemoveRoute: IRestRoute<IHierarchiesAuthorityRemoveRequest, INoContentResponse> = {
		operationId: "hierarchiesAuthorityRemove",
		summary: "Remove an authority from a federation",
		tag: tagsHierarchies[0].name,
		method: "DELETE",
		path: `${baseRouteName}/:federationId/authorities/:accountId`,
		handler: async (httpRequestContext, request) =>
			hierarchiesAuthorityRemove(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IHierarchiesAuthorityRemoveRequest>(),
			examples: [
				{
					id: "hierarchiesAuthorityRemoveRequestExample",
					request: { pathParams: { federationId: "hierarchies:iota:123", accountId: "acc-1" } }
				}
			]
		},
		responseType: [
			{
				type: nameof<INoContentResponse>(),
				examples: [
					{
						id: "hierarchiesAuthorityRemoveResponseExample",
						response: { statusCode: HttpStatusCode.noContent }
					}
				]
			}
		]
	};

	const propertyAddRoute: IRestRoute<IHierarchiesPropertyAddRequest, INoContentResponse> = {
		operationId: "hierarchiesPropertyAdd",
		summary: "Add a property to a federation",
		tag: tagsHierarchies[0].name,
		method: "POST",
		path: `${baseRouteName}/:federationId/properties`,
		handler: async (httpRequestContext, request) =>
			hierarchiesPropertyAdd(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IHierarchiesPropertyAddRequest>(),
			examples: [
				{
					id: "hierarchiesPropertyAddRequestExample",
					request: {
						pathParams: { federationId: "hierarchies:iota:123" },
						body: { name: "my.property", allowedValues: [{ type: "String", value: "foo" }] }
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<INoContentResponse>(),
				examples: [
					{
						id: "hierarchiesPropertyAddResponseExample",
						response: { statusCode: HttpStatusCode.noContent }
					}
				]
			}
		]
	};

	const propertyRemoveRoute: IRestRoute<IHierarchiesPropertyRemoveRequest, INoContentResponse> = {
		operationId: "hierarchiesPropertyRemove",
		summary: "Remove a property from a federation",
		tag: tagsHierarchies[0].name,
		method: "DELETE",
		path: `${baseRouteName}/:federationId/properties/:propertyName`,
		handler: async (httpRequestContext, request) =>
			hierarchiesPropertyRemove(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IHierarchiesPropertyRemoveRequest>(),
			examples: [
				{
					id: "hierarchiesPropertyRemoveRequestExample",
					request: {
						pathParams: { federationId: "hierarchies:iota:123", propertyName: "my.property" }
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<INoContentResponse>(),
				examples: [
					{
						id: "hierarchiesPropertyRemoveResponseExample",
						response: { statusCode: HttpStatusCode.noContent }
					}
				]
			}
		]
	};

	const propertyGetRoute: IRestRoute<
		IHierarchiesPropertyGetRequest,
		IHierarchiesPropertyGetResponse
	> = {
		operationId: "hierarchiesPropertyGet",
		summary: "Get a property from a federation",
		tag: tagsHierarchies[0].name,
		method: "GET",
		path: `${baseRouteName}/:federationId/properties/:propertyName`,
		handler: async (httpRequestContext, request) =>
			hierarchiesPropertyGet(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IHierarchiesPropertyGetRequest>(),
			examples: [
				{
					id: "hierarchiesPropertyGetRequestExample",
					request: {
						pathParams: { federationId: "hierarchies:iota:123", propertyName: "my.property" }
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<IHierarchiesPropertyGetResponse>(),
				examples: [
					{
						id: "hierarchiesPropertyGetResponseExample",
						response: {
							body: { name: "my.property", allowedValues: [{ type: "String", value: "foo" }] }
						}
					}
				]
			}
		]
	};

	const propertiesGetRoute: IRestRoute<
		IHierarchiesPropertiesGetRequest,
		IHierarchiesPropertiesGetResponse
	> = {
		operationId: "hierarchiesPropertiesGet",
		summary: "Get all properties from a federation",
		tag: tagsHierarchies[0].name,
		method: "GET",
		path: `${baseRouteName}/:federationId/properties`,
		handler: async (httpRequestContext, request) =>
			hierarchiesPropertiesGet(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IHierarchiesPropertiesGetRequest>(),
			examples: [
				{
					id: "hierarchiesPropertiesGetRequestExample",
					request: { pathParams: { federationId: "hierarchies:iota:123" } }
				}
			]
		},
		responseType: [
			{
				type: nameof<IHierarchiesPropertiesGetResponse>(),
				examples: [
					{
						id: "hierarchiesPropertiesGetResponseExample",
						response: {
							body: [{ name: "my.property", allowedValues: [{ type: "String", value: "foo" }] }]
						}
					}
				]
			}
		]
	};

	const propertyValidateRoute: IRestRoute<
		IHierarchiesPropertyValidateRequest,
		IHierarchiesPropertyValidateResponse
	> = {
		operationId: "hierarchiesPropertyValidate",
		summary: "Validate a property for a federation",
		tag: tagsHierarchies[0].name,
		method: "POST",
		path: `${baseRouteName}/:federationId/properties/validate`,
		handler: async (httpRequestContext, request) =>
			hierarchiesPropertyValidate(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IHierarchiesPropertyValidateRequest>(),
			examples: [
				{
					id: "hierarchiesPropertyValidateRequestExample",
					request: {
						pathParams: { federationId: "hierarchies:iota:123" },
						body: {
							accreditedById: "acc-1",
							propertyName: "my.property",
							propertyValue: { type: "String", value: "foo" }
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<IHierarchiesPropertyValidateResponse>(),
				examples: [
					{
						id: "hierarchiesPropertyValidateResponseExample",
						response: { body: { valid: true } }
					}
				]
			}
		]
	};

	const propertiesValidateRoute: IRestRoute<
		IHierarchiesPropertiesValidateRequest,
		IHierarchiesPropertiesValidateResponse
	> = {
		operationId: "hierarchiesPropertiesValidate",
		summary: "Validate multiple properties for a federation",
		tag: tagsHierarchies[0].name,
		method: "POST",
		path: `${baseRouteName}/:federationId/properties/validate/batch`,
		handler: async (httpRequestContext, request) =>
			hierarchiesPropertiesValidate(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IHierarchiesPropertiesValidateRequest>(),
			examples: [
				{
					id: "hierarchiesPropertiesValidateRequestExample",
					request: {
						pathParams: { federationId: "hierarchies:iota:123" },
						body: {
							accreditedById: "acc-1",
							propertiesToValidate: { "my.property": { type: "String", value: "foo" } }
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<IHierarchiesPropertiesValidateResponse>(),
				examples: [
					{
						id: "hierarchiesPropertiesValidateResponseExample",
						response: { body: { valid: true } }
					}
				]
			}
		]
	};

	const accreditationToAttestAddRoute: IRestRoute<
		IHierarchiesAccreditationAddRequest,
		ICreatedResponse
	> = {
		operationId: "hierarchiesAccreditationToAttestAdd",
		summary: "Add an accreditation to attest to a federation",
		tag: tagsHierarchies[0].name,
		method: "POST",
		path: `${baseRouteName}/:federationId/accreditations/attest`,
		handler: async (httpRequestContext, request) =>
			hierarchiesAccreditationToAttestAdd(
				httpRequestContext,
				componentName,
				request,
				baseRouteName
			),
		requestType: {
			type: nameof<IHierarchiesAccreditationAddRequest>(),
			examples: [
				{
					id: "hierarchiesAccreditationToAttestAddRequestExample",
					request: {
						pathParams: { federationId: "hierarchies:iota:123" },
						body: { accreditedBy: "acc-1", properties: [] }
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<ICreatedResponse>(),
				examples: [
					{
						id: "hierarchiesAccreditationToAttestAddResponseExample",
						response: { statusCode: 201, headers: { location: "hierarchies:iota:perm-1" } }
					}
				]
			}
		]
	};

	const accreditationToAttestRemoveRoute: IRestRoute<
		IHierarchiesAccreditationRemoveRequest,
		INoContentResponse
	> = {
		operationId: "hierarchiesAccreditationToAttestRemove",
		summary: "Remove an accreditation to attest from a federation",
		tag: tagsHierarchies[0].name,
		method: "DELETE",
		path: `${baseRouteName}/:federationId/accreditations/attest/:accreditedById/:permissionId`,
		handler: async (httpRequestContext, request) =>
			hierarchiesAccreditationToAttestRemove(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IHierarchiesAccreditationRemoveRequest>(),
			examples: [
				{
					id: "hierarchiesAccreditationToAttestRemoveRequestExample",
					request: {
						pathParams: {
							federationId: "hierarchies:iota:123",
							accreditedById: "acc-1",
							permissionId: "perm-1"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<INoContentResponse>(),
				examples: [
					{
						id: "hierarchiesAccreditationToAttestRemoveResponseExample",
						response: { statusCode: HttpStatusCode.noContent }
					}
				]
			}
		]
	};

	const accreditationToAttestGetRoute: IRestRoute<
		IHierarchiesAccreditationGetRequest,
		IHierarchiesAccreditationGetResponse
	> = {
		operationId: "hierarchiesAccreditationToAttestGet",
		summary: "Get an accreditation to attest from a federation",
		tag: tagsHierarchies[0].name,
		method: "GET",
		path: `${baseRouteName}/:federationId/accreditations/attest/:accreditedById/:permissionId`,
		handler: async (httpRequestContext, request) =>
			hierarchiesAccreditationToAttestGet(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IHierarchiesAccreditationGetRequest>(),
			examples: [
				{
					id: "hierarchiesAccreditationToAttestGetRequestExample",
					request: {
						pathParams: {
							federationId: "hierarchies:iota:123",
							accreditedById: "acc-1",
							permissionId: "perm-1"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<IHierarchiesAccreditationGetResponse>(),
				examples: [
					{
						id: "hierarchiesAccreditationToAttestGetResponseExample",
						response: {
							body: { permissionId: "perm-1", accreditedBy: "acc-1", properties: [] }
						}
					}
				]
			}
		]
	};

	const accreditationsToAttestGetRoute: IRestRoute<
		IHierarchiesAccreditationsGetRequest,
		IHierarchiesAccreditationsGetResponse
	> = {
		operationId: "hierarchiesAccreditationsToAttestGet",
		summary: "Get accreditations to attest from a federation",
		tag: tagsHierarchies[0].name,
		method: "GET",
		path: `${baseRouteName}/:federationId/accreditations/attest/:accreditedById`,
		handler: async (httpRequestContext, request) =>
			hierarchiesAccreditationsToAttestGet(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IHierarchiesAccreditationsGetRequest>(),
			examples: [
				{
					id: "hierarchiesAccreditationsToAttestGetRequestExample",
					request: {
						pathParams: { federationId: "hierarchies:iota:123", accreditedById: "acc-1" }
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<IHierarchiesAccreditationsGetResponse>(),
				examples: [
					{
						id: "hierarchiesAccreditationsToAttestGetResponseExample",
						response: {
							body: [{ permissionId: "perm-1", accreditedBy: "acc-1", properties: [] }]
						}
					}
				]
			}
		]
	};

	const accreditationToAccreditAddRoute: IRestRoute<
		IHierarchiesAccreditationAddRequest,
		ICreatedResponse
	> = {
		operationId: "hierarchiesAccreditationToAccreditAdd",
		summary: "Add an accreditation to accredit to a federation",
		tag: tagsHierarchies[0].name,
		method: "POST",
		path: `${baseRouteName}/:federationId/accreditations/accredit`,
		handler: async (httpRequestContext, request) =>
			hierarchiesAccreditationToAccreditAdd(
				httpRequestContext,
				componentName,
				request,
				baseRouteName
			),
		requestType: {
			type: nameof<IHierarchiesAccreditationAddRequest>(),
			examples: [
				{
					id: "hierarchiesAccreditationToAccreditAddRequestExample",
					request: {
						pathParams: { federationId: "hierarchies:iota:123" },
						body: { accreditedBy: "acc-1", properties: [] }
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<ICreatedResponse>(),
				examples: [
					{
						id: "hierarchiesAccreditationToAccreditAddResponseExample",
						response: { statusCode: 201, headers: { location: "hierarchies:iota:perm-1" } }
					}
				]
			}
		]
	};

	const accreditationToAccreditRemoveRoute: IRestRoute<
		IHierarchiesAccreditationRemoveRequest,
		INoContentResponse
	> = {
		operationId: "hierarchiesAccreditationToAccreditRemove",
		summary: "Remove an accreditation to accredit from a federation",
		tag: tagsHierarchies[0].name,
		method: "DELETE",
		path: `${baseRouteName}/:federationId/accreditations/accredit/:accreditedById/:permissionId`,
		handler: async (httpRequestContext, request) =>
			hierarchiesAccreditationToAccreditRemove(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IHierarchiesAccreditationRemoveRequest>(),
			examples: [
				{
					id: "hierarchiesAccreditationToAccreditRemoveRequestExample",
					request: {
						pathParams: {
							federationId: "hierarchies:iota:123",
							accreditedById: "acc-1",
							permissionId: "perm-1"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<INoContentResponse>(),
				examples: [
					{
						id: "hierarchiesAccreditationToAccreditRemoveResponseExample",
						response: { statusCode: HttpStatusCode.noContent }
					}
				]
			}
		]
	};

	const accreditationToAccreditGetRoute: IRestRoute<
		IHierarchiesAccreditationGetRequest,
		IHierarchiesAccreditationGetResponse
	> = {
		operationId: "hierarchiesAccreditationToAccreditGet",
		summary: "Get an accreditation to accredit from a federation",
		tag: tagsHierarchies[0].name,
		method: "GET",
		path: `${baseRouteName}/:federationId/accreditations/accredit/:accreditedById/:permissionId`,
		handler: async (httpRequestContext, request) =>
			hierarchiesAccreditationToAccreditGet(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IHierarchiesAccreditationGetRequest>(),
			examples: [
				{
					id: "hierarchiesAccreditationToAccreditGetRequestExample",
					request: {
						pathParams: {
							federationId: "hierarchies:iota:123",
							accreditedById: "acc-1",
							permissionId: "perm-1"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<IHierarchiesAccreditationGetResponse>(),
				examples: [
					{
						id: "hierarchiesAccreditationToAccreditGetResponseExample",
						response: {
							body: { permissionId: "perm-1", accreditedBy: "acc-1", properties: [] }
						}
					}
				]
			}
		]
	};

	const accreditationsToAccreditGetRoute: IRestRoute<
		IHierarchiesAccreditationsGetRequest,
		IHierarchiesAccreditationsGetResponse
	> = {
		operationId: "hierarchiesAccreditationsToAccreditGet",
		summary: "Get accreditations to accredit from a federation",
		tag: tagsHierarchies[0].name,
		method: "GET",
		path: `${baseRouteName}/:federationId/accreditations/accredit/:accreditedById`,
		handler: async (httpRequestContext, request) =>
			hierarchiesAccreditationsToAccreditGet(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IHierarchiesAccreditationsGetRequest>(),
			examples: [
				{
					id: "hierarchiesAccreditationsToAccreditGetRequestExample",
					request: {
						pathParams: { federationId: "hierarchies:iota:123", accreditedById: "acc-1" }
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<IHierarchiesAccreditationsGetResponse>(),
				examples: [
					{
						id: "hierarchiesAccreditationsToAccreditGetResponseExample",
						response: {
							body: [{ permissionId: "perm-1", accreditedBy: "acc-1", properties: [] }]
						}
					}
				]
			}
		]
	};

	return [
		federationCreateRoute,
		federationGetRoute,
		authorityAddRoute,
		authorityRemoveRoute,
		propertyValidateRoute,
		propertiesValidateRoute,
		propertyAddRoute,
		propertyRemoveRoute,
		propertyGetRoute,
		propertiesGetRoute,
		accreditationToAttestAddRoute,
		accreditationToAttestRemoveRoute,
		accreditationToAttestGetRoute,
		accreditationsToAttestGetRoute,
		accreditationToAccreditAddRoute,
		accreditationToAccreditRemoveRoute,
		accreditationToAccreditGetRoute,
		accreditationsToAccreditGetRoute
	];
}

/**
 * Handles a request to create a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request to create a federation, containing the body with root authorities and optional namespace.
 * @param baseRouteName The base route name for constructing URLs.
 * @returns The response object with HTTP status and Location header for the created federation.
 */
export async function hierarchiesFederationCreate(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesFederationCreateRequest,
	baseRouteName: string
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

	const publicOrigin = contextIds?.[HttpContextIdKeys.PublicOrigin];

	const headers: IHttpHeaders = {};
	HttpHeaderHelper.buildId(
		headers,
		result,
		HttpUrlHelper.combineOriginPath(publicOrigin, `${baseRouteName}/:id`)
	);

	return {
		statusCode: HttpStatusCode.created,
		headers
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
	const federation = await component.federationGet(request.pathParams.federationId, {
		includeRevokedProperties: Coerce.boolean(request.query?.includeRevokedProperties)
	});
	return { body: federation };
}

/**
 * Handles a request to add an authority to a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request object.
 * @param baseRouteName The base route name for constructing URLs.
 * @returns The response object with HTTP status and Location header for the created authority.
 */
export async function hierarchiesAuthorityAdd(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesAuthorityAddRequest,
	baseRouteName: string
): Promise<ICreatedResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);
	Guards.object<IHierarchiesAuthorityAddRequest["body"]>(
		ROUTES_SOURCE,
		nameof(request.body),
		request.body
	);

	const contextIds = await ContextIdStore.getContextIds();
	ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);

	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	const result = await component.authorityAdd(
		request.pathParams.federationId,
		request.body.accountId,
		contextIds[ContextIdKeys.Organization]
	);

	const publicOrigin = contextIds?.[HttpContextIdKeys.PublicOrigin];

	const headers: IHttpHeaders = {};
	HttpHeaderHelper.buildId(
		headers,
		result,
		HttpUrlHelper.combineOriginPath(publicOrigin, `${baseRouteName}/:id`)
	);

	return {
		statusCode: HttpStatusCode.created,
		headers
	};
}

/**
 * Handles a request to remove an authority from a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request object.
 * @returns The response object with HTTP no content status.
 */
export async function hierarchiesAuthorityRemove(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesAuthorityRemoveRequest
): Promise<INoContentResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);

	const contextIds = await ContextIdStore.getContextIds();
	ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);

	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	await component.authorityRemove(
		request.pathParams.federationId,
		request.pathParams.accountId,
		contextIds[ContextIdKeys.Organization]
	);

	return { statusCode: HttpStatusCode.noContent };
}

/**
 * Handles a request to add a property to a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request object.
 * @returns The response object with HTTP no content status.
 */
export async function hierarchiesPropertyAdd(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesPropertyAddRequest
): Promise<INoContentResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);
	Guards.object<IHierarchiesPropertyAddRequest["body"]>(
		ROUTES_SOURCE,
		nameof(request.body),
		request.body
	);

	const contextIds = await ContextIdStore.getContextIds();
	ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);

	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	await component.propertyAdd(
		request.pathParams.federationId,
		request.body,
		contextIds[ContextIdKeys.Organization]
	);

	return { statusCode: HttpStatusCode.noContent };
}

/**
 * Handles a request to remove a property from a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request object.
 * @returns The response object with HTTP no content status.
 */
export async function hierarchiesPropertyRemove(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesPropertyRemoveRequest
): Promise<INoContentResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);

	const contextIds = await ContextIdStore.getContextIds();
	ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);

	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	await component.propertyRemove(
		request.pathParams.federationId,
		request.pathParams.propertyName,
		contextIds[ContextIdKeys.Organization]
	);

	return { statusCode: HttpStatusCode.noContent };
}

/**
 * Handles a request to get a property from a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request object.
 * @returns The response object with the property in the body.
 */
export async function hierarchiesPropertyGet(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesPropertyGetRequest
): Promise<IHierarchiesPropertyGetResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);
	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	const property = await component.propertyGet(
		request.pathParams.federationId,
		request.pathParams.propertyName
	);
	return { body: property };
}

/**
 * Handles a request to get all properties from a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request object.
 * @returns The response object with the properties in the body.
 */
export async function hierarchiesPropertiesGet(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesPropertiesGetRequest
): Promise<IHierarchiesPropertiesGetResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);
	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	const properties = await component.propertiesGet(request.pathParams.federationId, {
		includeRevokedProperties: Coerce.boolean(request.query?.includeRevokedProperties)
	});
	return { body: properties };
}

/**
 * Handles a request to validate a property for a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request object.
 * @returns The response object with the validation result in the body.
 */
export async function hierarchiesPropertyValidate(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesPropertyValidateRequest
): Promise<IHierarchiesPropertyValidateResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);
	Guards.object<IHierarchiesPropertyValidateRequest["body"]>(
		ROUTES_SOURCE,
		nameof(request.body),
		request.body
	);
	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	const valid = await component.propertyValidate(
		request.pathParams.federationId,
		request.body.accreditedById,
		request.body.propertyName,
		request.body.propertyValue
	);
	return { body: { valid } };
}

/**
 * Handles a request to validate multiple properties for a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request object.
 * @returns The response object with the validation result in the body.
 */
export async function hierarchiesPropertiesValidate(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesPropertiesValidateRequest
): Promise<IHierarchiesPropertiesValidateResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);
	Guards.object<IHierarchiesPropertiesValidateRequest["body"]>(
		ROUTES_SOURCE,
		nameof(request.body),
		request.body
	);
	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	const valid = await component.propertiesValidate(
		request.pathParams.federationId,
		request.body.accreditedById,
		request.body.propertiesToValidate
	);
	return { body: { valid } };
}

/**
 * Handles a request to add an accreditation to attest to a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request object.
 * @param baseRouteName The base route name for constructing URLs.
 * @returns The response object with HTTP status and Location header for the created accreditation.
 */
export async function hierarchiesAccreditationToAttestAdd(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesAccreditationAddRequest,
	baseRouteName: string
): Promise<ICreatedResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);
	Guards.object<IHierarchiesAccreditationAddRequest["body"]>(
		ROUTES_SOURCE,
		nameof(request.body),
		request.body
	);

	const contextIds = await ContextIdStore.getContextIds();
	ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);

	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	const result = await component.accreditationToAttestAdd(
		request.pathParams.federationId,
		request.body,
		contextIds[ContextIdKeys.Organization]
	);

	const publicOrigin = contextIds?.[HttpContextIdKeys.PublicOrigin];

	const headers: IHttpHeaders = {};
	HttpHeaderHelper.buildId(
		headers,
		result,
		HttpUrlHelper.combineOriginPath(publicOrigin, `${baseRouteName}/:id`)
	);

	return {
		statusCode: HttpStatusCode.created,
		headers
	};
}

/**
 * Handles a request to remove an accreditation to attest from a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request object.
 * @returns The response object with HTTP no content status.
 */
export async function hierarchiesAccreditationToAttestRemove(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesAccreditationRemoveRequest
): Promise<INoContentResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);

	const contextIds = await ContextIdStore.getContextIds();
	ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);

	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	await component.accreditationToAttestRemove(
		request.pathParams.federationId,
		request.pathParams.accreditedById,
		request.pathParams.permissionId,
		contextIds[ContextIdKeys.Organization]
	);

	return { statusCode: HttpStatusCode.noContent };
}

/**
 * Handles a request to get an accreditation to attest from a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request object.
 * @returns The response object with the accreditation in the body.
 */
export async function hierarchiesAccreditationToAttestGet(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesAccreditationGetRequest
): Promise<IHierarchiesAccreditationGetResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);
	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	const accreditation = await component.accreditationToAttestGet(
		request.pathParams.federationId,
		request.pathParams.accreditedById,
		request.pathParams.permissionId
	);
	return { body: accreditation };
}

/**
 * Handles a request to get accreditations to attest from a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request object.
 * @returns The response object with the accreditations in the body.
 */
export async function hierarchiesAccreditationsToAttestGet(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesAccreditationsGetRequest
): Promise<IHierarchiesAccreditationsGetResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);
	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	const accreditations = await component.accreditationsToAttestGet(
		request.pathParams.federationId,
		request.pathParams.accreditedById
	);
	return { body: accreditations };
}

/**
 * Handles a request to add an accreditation to accredit to a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request object.
 * @param baseRouteName The base route name for constructing URLs.
 * @returns The response object with HTTP status and Location header for the created accreditation.
 */
export async function hierarchiesAccreditationToAccreditAdd(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesAccreditationAddRequest,
	baseRouteName: string
): Promise<ICreatedResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);
	Guards.object<IHierarchiesAccreditationAddRequest["body"]>(
		ROUTES_SOURCE,
		nameof(request.body),
		request.body
	);

	const contextIds = await ContextIdStore.getContextIds();
	ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);

	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	const result = await component.accreditationToAccreditAdd(
		request.pathParams.federationId,
		request.body,
		contextIds[ContextIdKeys.Organization]
	);

	const publicOrigin = contextIds?.[HttpContextIdKeys.PublicOrigin];

	const headers: IHttpHeaders = {};
	HttpHeaderHelper.buildId(
		headers,
		result,
		HttpUrlHelper.combineOriginPath(publicOrigin, `${baseRouteName}/:id`)
	);

	return {
		statusCode: HttpStatusCode.created,
		headers
	};
}

/**
 * Handles a request to remove an accreditation to accredit from a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request object.
 * @returns The response object with HTTP no content status.
 */
export async function hierarchiesAccreditationToAccreditRemove(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesAccreditationRemoveRequest
): Promise<INoContentResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);

	const contextIds = await ContextIdStore.getContextIds();
	ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);

	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	await component.accreditationToAccreditRemove(
		request.pathParams.federationId,
		request.pathParams.accreditedById,
		request.pathParams.permissionId,
		contextIds[ContextIdKeys.Organization]
	);

	return { statusCode: HttpStatusCode.noContent };
}

/**
 * Handles a request to get an accreditation to accredit from a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request object.
 * @returns The response object with the accreditation in the body.
 */
export async function hierarchiesAccreditationToAccreditGet(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesAccreditationGetRequest
): Promise<IHierarchiesAccreditationGetResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);
	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	const accreditation = await component.accreditationToAccreditGet(
		request.pathParams.federationId,
		request.pathParams.accreditedById,
		request.pathParams.permissionId
	);
	return { body: accreditation };
}

/**
 * Handles a request to get accreditations to accredit from a federation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request object.
 * @returns The response object with the accreditations in the body.
 */
export async function hierarchiesAccreditationsToAccreditGet(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IHierarchiesAccreditationsGetRequest
): Promise<IHierarchiesAccreditationsGetResponse> {
	Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);
	const component = ComponentFactory.get<IHierarchiesComponent>(componentName);
	const accreditations = await component.accreditationsToAccreditGet(
		request.pathParams.federationId,
		request.pathParams.accreditedById
	);
	return { body: accreditations };
}
