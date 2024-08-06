import { z } from 'zod'
import { linksResponseSchema, metaResponseSchema } from '../app/apiResponse'

export const organisationSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string(),
	owner: z.object({
		id: z.number(),
		name: z.string(),
	}),
	createdAt: z.string(),
})
export type Organisation = z.infer<typeof organisationSchema>

export const organisationsSchema = z.array(organisationSchema)

export type Organisations = z.infer<typeof organisationsSchema>

export const organisationsApiResponseSchema = z.object({
	data: organisationsSchema,
	links: linksResponseSchema,
	meta: metaResponseSchema,
})

export type OrganisationsResponse = z.infer<
	typeof organisationsApiResponseSchema
>

export const createOrganisationRequestSchema = z.object({
	userId: z.number(),
	name: z.string(),
	description: z.string(),
})

export type CreateOrganisationRequest = z.infer<
	typeof createOrganisationRequestSchema
>

export const createOrganisationResponseSchema = z.object({
	organisationId: z.number(),
	message: z.string(),
})

export type CreateOrganisationResponse = z.infer<
	typeof createOrganisationResponseSchema
>
