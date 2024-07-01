import { type ApiResponse } from '#app/types/app/apiResponse'

export function isSuccessResponse(response: ApiResponse): boolean {
	return (
		response.status >= 200 && (response.status < 300 || response.status === 304)
	)
}
