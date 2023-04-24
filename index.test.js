const mockPut = jest.fn().mockReturnValue(2);
jest.mock('aws-sdk', () => {
	class mockDocumentClient {
        async put(config) {
			mockPut(config);
            return;
        }
    }
    return {
        DynamoDB: {
            DocumentClient: mockDocumentClient,
    }};
});

function getValidEvent() {
	return {
		UUID: "289d256c-4088-4369-ada0-d00e710b768e",
		V: "1",
		Data: "Hello World"
	}
}

describe('handler tests', () => {
	beforeEach(() => {
	  jest.clearAllMocks();
	});

	it('given valid input, it stores a record in dynamodb from the event payload', async () => {
		const handler = require('./index.js').handler;

		const event = getValidEvent();
		await handler(event);

		expect(mockPut).toHaveBeenCalledTimes(1);
		expect(mockPut).toHaveBeenCalledWith(expect.objectContaining({
			Item: expect.objectContaining({
				UUID: event.UUID
			})
		}, expect.anything()));
		expect(mockPut).toHaveBeenCalledWith(expect.objectContaining({
			Item: expect.objectContaining({
				V: event.V
			})
		}, expect.anything()));
		expect(mockPut).toHaveBeenCalledWith(expect.objectContaining({
			Item: expect.objectContaining({
				Data: event.Data
			})
		}, expect.anything()));
	});

	it('given valid input, it stores a record in dynamodb with a TTL of 1 minute', async () => {
		const handler = require('./index.js').handler;

		const event = getValidEvent();
		const timeBefore = Math.floor((Date.now() + 60000) / 1000);
		await handler(event);
		const timeAfter = Math.floor((Date.now() + 60000) / 1000);

		const call = mockPut.mock.calls[0]
		const putParams = call[0]
		const ttl = putParams.Item.ttl;
		expect(ttl).toBeGreaterThanOrEqual(timeBefore);
		expect(ttl).toBeLessThanOrEqual(timeAfter);
	});

	describe('no input cases', () => {
		const noInputCases = [undefined, null];

		it.each(noInputCases)('given no input, does not call dynamodb', (testCase) => {
			const handler = require('./index.js').handler;

			handler(testCase);

			expect(mockPut).not.toHaveBeenCalled();
		});
	});

	describe('invalid input cases', () => {
		describe('invalid UUID cases', () => {
			const cases = [undefined, null, "ABC"];

			it.each(cases)('invalid UUID, does not call dynamodb', (testCase) => {
				const handler = require('./index.js').handler;
				const event = {
					...getValidEvent(),
					UUID: testCase
				}
				handler(event);

				expect(mockPut).not.toHaveBeenCalled();
			});
		});
	});
});