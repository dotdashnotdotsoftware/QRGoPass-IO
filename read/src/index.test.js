const { unmarshall } = require("@aws-sdk/util-dynamodb");

const mockGetData = jest.fn();
const mockGet = jest.fn();
const mockPut = jest.fn();
jest.mock('@aws-sdk/client-dynamodb', () => {
	class mockDocumentClient {
		async send(request) {
			if (request.constructor.name === "GetItemCommand") {
				return await mockGet(request);
			} else {
				return await mockPut(request);
			}
		}
    }
    return {
		...jest.requireActual('@aws-sdk/client-dynamodb'),
        DynamoDBClient: mockDocumentClient,
    };
});

function getValidEvent() {
	return {
		UUID: "289d256c-4088-4369-ada0-d00e710b768e"
	}
}

function getValidStoredEvent() {
	return {
		Item: {
			Data: { S: "Hello World" },
			UUID: { S: '5d80ed60-ebee-11ed-a05b-0242ac120003' },
			ttl: { N: '1683372210' },
			V: { S: '999' }
		}
	}
}

describe('handler tests', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.resetAllMocks();
		mockGetData.mockReturnValue(getValidStoredEvent());
		mockGet.mockImplementation(async () => mockGetData());
	});

	it('returns no data when an error occurs', async () => {
		const handler = require('./index.js').handler;

		mockGet.mockRejectedValue("A test error");

		const event = getValidEvent();
		const result = await handler(event);

		expect(result).toBeNull();
	});

	it.each([
		null,
		undefined,
		{}
	])('returns no data when no record is found', async (testCase) => {
		const handler = require('./index.js').handler;

		mockGetData.mockReturnValue(testCase);

		const event = getValidEvent();
		const result = await handler(event);

		expect(result).toBeNull();
	});

	it('returns the data it found', async () => {
		const handler = require('./index.js').handler;

		const storedEvent = getValidStoredEvent();
		mockGetData.mockReturnValue(storedEvent);

		const result = await handler(getValidEvent());

		console.log(storedEvent);
		const expected = unmarshall(storedEvent.Item);
		expect(result).toEqual(expected);
	});

	it('"deletes" the data it found so we can detect repeat attacks', async () => {
		const handler = require('./index.js').handler;

		const storedEvent = getValidStoredEvent();
		mockGetData.mockReturnValue(storedEvent);

		await handler(getValidEvent());

		expect(mockPut).toHaveBeenCalledTimes(1);
		expect(mockPut).toHaveBeenCalledWith(
			expect.objectContaining(
				{
					input: expect.objectContaining(
						{
							Item: expect.objectContaining(
								{
									UUID: storedEvent.Item.UUID
								}
							)
						}
					)
				}
			)
		);
	});
});