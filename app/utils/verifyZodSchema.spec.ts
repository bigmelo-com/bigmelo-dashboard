import { z } from "zod";
import { ValidationError } from "./validate";
import verifyZodSchema from "./verifyZodSchema";

describe("verifyZodSchema", () => {
  it("should return the data if it matches the schema", () => {
    const data: unknown = { email: "alice@lhc.org" };
    const schema = z.object({ email: z.string().email() });

    const result = verifyZodSchema(data, schema);

    expect(result).toEqual(data);
  });

  it("should return the data with the correct type from the schema", () => {
    const data = { email: "alice@lhc.org" };
    const schema = z.object({ email: z.string().email() });

    const result = verifyZodSchema(data, schema);

    expectTypeOf(result).toEqualTypeOf<z.infer<typeof schema>>();
  });

  it("should throw an error if the data does not match the schema", () => {
    const data = { email: "test", orderId: 1029 };
    const schema = z.object({ email: z.string().email(), orderId: z.string() });

    try {
      verifyZodSchema(data, schema);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it("should throw a ValidationError with custom message if provided", () => {
    const data = { email: "test", orderId: 1029 };
    const schema = z.object({ email: z.string().email(), orderId: z.string() });
    const errorMessage = "Invalid data";

    try {
      verifyZodSchema(data, schema, errorMessage);
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? error.message
          : "";

      expect(error).toBeInstanceOf(ValidationError);
      expect(errorMessage).toEqual(errorMessage);
    }
  });
});
