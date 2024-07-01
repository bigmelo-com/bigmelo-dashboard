import invariant from 'tiny-invariant'

/**
 * This uses `tiny-invariant` under the hood, but throws an Error with your message, because tiny-invariant strips that message in production.
 * This is useful for getting your message to the client.
 *
 * @param condition
 * @param message
 */
export function validate(
	condition: unknown,
	message: string,
): asserts condition {
	try {
		invariant(condition)
	} catch (error) {
		console.error(error)
		throw new ValidationError(message)
	}
}

export class ValidationError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ValidationError'
	}
}
