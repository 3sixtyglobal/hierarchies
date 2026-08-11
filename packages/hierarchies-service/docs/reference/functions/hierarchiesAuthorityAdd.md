# Function: hierarchiesAuthorityAdd()

> **hierarchiesAuthorityAdd**(`httpRequestContext`, `componentName`, `request`, `baseRouteName`): `Promise`\<`ICreatedResponse`\>

Handles a request to add an authority to a federation.

## Parameters

### httpRequestContext

`IHttpRequestContext`

The request context for the API.

### componentName

`string`

The name of the component to use in the routes.

### request

`IHierarchiesAuthorityAddRequest`

The request object.

### baseRouteName

`string`

The base route name for constructing URLs.

## Returns

`Promise`\<`ICreatedResponse`\>

The response object with HTTP status and Location header for the created authority.
