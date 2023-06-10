const { deterministicPartitionKey } = require("./dpk");
const crypto = require("crypto");

describe("deterministicPartitionKey", () => {
  it("Returns the literal '0' when given no input", () => {
    const trivialKey = deterministicPartitionKey();
    expect(trivialKey).toBe("0");
  });

  it("should return a hashed partition key if only an event is provided", () => {
    const mockEvent = { name: "example", timestamp: new Date() };
    const data = JSON.stringify(mockEvent);
    const expected = crypto.createHash("sha3-512").update(data).digest("hex");
    const result = deterministicPartitionKey(mockEvent);
    expect(result).toEqual(expected);
  });

  it("should return a hashed partition key if the provided partition key is too long", () => {
    const longKey = "a".repeat(257);
    const expected = crypto
      .createHash("sha3-512")
      .update(longKey)
      .digest("hex");
    const result = deterministicPartitionKey({ partitionKey: longKey });
    expect(result).toEqual(expected);
  });

  it("should return the provided partition key if it is short enough", () => {
    const expected = "abc123";
    const result = deterministicPartitionKey({ partitionKey: expected });
    expect(result).toEqual(expected);
  });
});
