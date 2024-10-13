type TryCatchResult<T> = [T | null, Error | null];

export async function handleTryCatch<T>(
	promise: Promise<T>
): Promise<TryCatchResult<T>> {
	try {
		const response = await promise;
		return [response, null];
	} catch (error) {
		return [null, error as Error];
	}
}
