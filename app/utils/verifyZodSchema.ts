import { type z, type ZodTypeAny } from 'zod'
import { ValidationError } from './validate'

/**
 * Can use a Zod schema to validate data and return the inferred type.
 * Will throw an Error if the data does not match the schema.
 *
 * @param data The data to validate.
 * @param schema The Zod schema to use for validation.
 * @param validationErrorMessage [OPTIONAL] change the error message to a custom message. useful for user facing errors
 * @returns `data` with the inferred type from the `schema`.
 * @throws `Error` if the data does not match the schema. `ValidationError` if `validationErrorMessage` is provided.
 */
export function verifyZodSchema<T extends ZodTypeAny>(
	data: unknown,
	schema: T,
	validationErrorMessage?: string,
) {
	const result = schema.safeParse(data)

	if (!result.success) {
		const issues = result.error.issues
		const errorMessage = issues
			.map(issue => `${issue.path}: ${issue.message}`)
			.join('\n')

		const error = validationErrorMessage
			? new ValidationError(validationErrorMessage)
			: new Error(errorMessage)

		throw error
	}

	// Have to use `as` because we need the type assignment to happen at runtime
	// because this function is generic. We've verified that this type assertion is
	// valid via the safeParse call above.
	return result.data as z.infer<T>
}
