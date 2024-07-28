import { faker } from '@faker-js/faker'
import { expect, test } from 'vitest'

import {
	getCurrentOrganisationId,
	setCurrentOrganisationId,
} from './organisations.server.ts'

test('Returns null when the organisation does not exist', () => {
	const request = new Request('https://example.com')
	expect(getCurrentOrganisationId(request)).toBe(null)
})

test('Returns the organisation id when it exists', () => {
	const id = faker.number.int()
	const request = new Request('https://example.com', {
		headers: {
			cookie: `current_organisation=${id}`,
		},
	})
	expect(getCurrentOrganisationId(request)).toBe(id)
})

test('Returns null when the organisation id is not a number', () => {
	const request = new Request('https://example.com', {
		headers: {
			cookie: 'current_organisation=not-a-number',
		},
	})
	expect(getCurrentOrganisationId(request)).toBe(null)
})

test('Returns null when the organisation id an empty string', () => {
	const request = new Request('https://example.com', {
		headers: {
			cookie: 'current_organisation=',
		},
	})
	expect(getCurrentOrganisationId(request)).toBe(null)
})

test('Set the cookie with the organisation id', () => {
	const id = faker.number.int()
	expect(setCurrentOrganisationId(id)).toBe(
		`current_organisation=${id}; Max-Age=31536000; Path=/`,
	)
})

test('Set the cookie with the organisation id as an empty string', () => {
	expect(setCurrentOrganisationId(undefined)).toBe(
		'current_organisation=; Max-Age=-1; Path=/',
	)
})
