import camelcaseKeys from 'camelcase-keys'
import decamelcaseKeys from 'decamelcase-keys'
import { type ApiResponse } from '#app/types/app/apiResponse.js'
import logErrorResponse from './logErrorResponse'

// const BASE_URL = process.env.BASE_URL
const BASE_URL = 'http://localhost:8090'

export const get = async (
	urlPath: string,
	options = {} as Omit<RequestInit, 'method'>,
): Promise<ApiResponse> => {
	const { headers: additionalHeaders = {}, ...restOfOptions } = options

	const response = await fetch(`${BASE_URL}${urlPath}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			...additionalHeaders,
		},
		...restOfOptions,
	})

	logErrorResponse(response)

	const data: Record<string, unknown> | null = response.ok
		? camelcaseKeys((await response.json()) as Record<string, unknown>, {
				deep: true,
			})
		: null
	return {
		status: response.status,
		statusText: response.statusText,
		data,
	}
}

export const post = async (
	urlPath: string,
	body: Record<string, unknown>,
	options = {} as Omit<RequestInit, 'body' | 'method'>,
): Promise<ApiResponse> => {
	const { headers: additionalHeaders = {}, ...restOfOptions } = options

	const response = await fetch(`${BASE_URL}${urlPath}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			...additionalHeaders,
		},
		...restOfOptions,
		body: JSON.stringify(decamelcaseKeys(body, { deep: true })),
	})

	logErrorResponse(response)

	let data: Record<string, unknown> | null = null
	try {
		data =
			response.ok &&
			response.body !== null &&
			response.headers.get('Content-Length') !== '0'
				? camelcaseKeys((await response.json()) as Record<string, unknown>, {
						deep: true,
					})
				: null
	} catch (error: unknown) {
		console.error('Error parsing response body:', error)
	}

	return {
		status: response.status,
		statusText: response.statusText,
		data,
	}
}

export const put = async (
	urlPath: string,
	body: Record<string, unknown>,
	options = {} as Omit<RequestInit, 'body' | 'method'>,
): Promise<ApiResponse> => {
	const { headers: additionalHeaders = {}, ...restOfOptions } = options

	const response = await fetch(`${BASE_URL}${urlPath}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			...additionalHeaders,
		},
		...restOfOptions,
		body: JSON.stringify(decamelcaseKeys(body, { deep: true })),
	})

	logErrorResponse(response)

	let data: Record<string, unknown> | null = null
	try {
		data =
			response.ok &&
			response.body !== null &&
			response.headers.get('Content-Length') !== '0'
				? camelcaseKeys((await response.json()) as Record<string, unknown>, {
						deep: true,
					})
				: null
	} catch (error: unknown) {
		console.error('Error parsing response body:', error)
	}

	return {
		status: response.status,
		statusText: response.statusText,
		data,
	}
}

export const patch = async (
	urlPath: string,
	body: Record<string, unknown>,
	options = {} as Omit<RequestInit, 'body' | 'method'>,
): Promise<ApiResponse> => {
	const { headers: additionalHeaders = {}, ...restOfOptions } = options

	const response = await fetch(`${BASE_URL}${urlPath}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			...additionalHeaders,
		},
		...restOfOptions,
		body: JSON.stringify(decamelcaseKeys(body, { deep: true })),
	})

	logErrorResponse(response)

	let data: Record<string, unknown> | null = null
	try {
		data =
			response.ok &&
			response.body !== null &&
			response.headers.get('Content-Length') !== '0'
				? camelcaseKeys((await response.json()) as Record<string, unknown>, {
						deep: true,
					})
				: null
	} catch (error: unknown) {
		console.error('Error parsing response body:', error)
	}

	return {
		status: response.status,
		statusText: response.statusText,
		data,
	}
}
