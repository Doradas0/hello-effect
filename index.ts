import { Effect, Match, pipe, Random } from "effect";

// ==================== Types & Errors ====================

class ValidationError extends Error {
  readonly _tag = "ValidationError";
}

class PayPalError extends Error {
  readonly _tag = "PayPalError";
}

class CCError extends Error {
  readonly _tag = "CCError";
}

type PaymentDetails = {
  readonly amount: number;
  readonly country: string;
  readonly type: "PayPal" | "CreditCard";
};

type PayPalDetails = PaymentDetails & {
  readonly email: string;
  readonly type: "PayPal";
};

type CreditCardDetails = PaymentDetails & {
  readonly cardNumber: string;
  readonly type: "CreditCard";
};

type PaymentItem = CreditCardDetails | PayPalDetails;

// ==================== Credit Card ====================

const ccCountries = ["US", "UK", "CA"] as const;
type CreditCardCountry = (typeof ccCountries)[number];
const isCreditCardCountry = (country: string): country is CreditCardCountry =>
  (ccCountries as readonly string[]).includes(country);

const validateCCCountry = (country: string) =>
  isCreditCardCountry(country)
    ? Effect.succeed(true)
    : Effect.fail(new ValidationError("Invalid PayPal country"));

const sendCCPayment = (payment: CreditCardDetails) =>
  // Using the built in random generator to simulate a call to external service
  // failing for whatever reason
  Random.next.pipe(
    Effect.andThen((n) =>
      n > 0.5
        ? Effect.succeed(`Payment of ${payment.amount} was successful`)
        : Effect.fail(new CCError("Payment failed"))
    )
  );

const handleCCPayment = (payment: CreditCardDetails) =>
  pipe(
    Effect.succeed(payment),
    Effect.andThen(() => validateCCCountry(payment.country)),
    Effect.andThen(() => sendCCPayment(payment))
  );

// // ==================== PayPal ====================

const paypalCountries = ["US", "UK"] as const;
type PayPalCountry = (typeof paypalCountries)[number];
const isPayPalCountry = (country: string): country is PayPalCountry =>
  (paypalCountries as readonly string[]).includes(country);

const validatePayPalCountry = (country: string) =>
  isPayPalCountry(country)
    ? Effect.succeed(true)
    : Effect.fail(new ValidationError("Invalid PayPal country"));

const sendPayPalPayment = (payment: PayPalDetails) =>
  // Using the built in random generator to simulate a call to external service
  // failing for whatever reason
  Random.next.pipe(
    Effect.andThen((n) =>
      n > 0.5
        ? Effect.succeed(
            `Payment of ${payment.amount} was successful from ${payment.email}`
          )
        : Effect.fail(new PayPalError("Payment failed"))
    )
  );

const handlePayPalPayment = (payment: PayPalDetails) =>
  pipe(
    Effect.succeed(payment),
    Effect.andThen(() => validatePayPalCountry(payment.country)),
    Effect.andThen(() => sendPayPalPayment(payment))
  );

// ==================== Payment Flow ====================

const MIN_AMOUNT = 10;
const MAX_AMOUNT = 1000;
const validateAmount = (amount: number) =>
  amount >= MIN_AMOUNT && amount <= MAX_AMOUNT
    ? Effect.succeed("Valid amount")
    : Effect.fail(new ValidationError("Invalid amount"));

const handlePaymentType = Match.type<PaymentItem>().pipe(
  Match.when({ type: "CreditCard" }, (_) => handleCCPayment(_)),
  Match.when({ type: "PayPal" }, (_) => handlePayPalPayment(_)),
  Match.exhaustive
);

const handlePayment = (payment: PaymentItem) =>
  pipe(
    Effect.succeed(payment),
    // Every payment should have a valid amount
    Effect.andThen(() => validateAmount(payment.amount)),
    // Handle payment based on the payment type
    // Each payment type has its own validation and payment logic
    Effect.andThen(() => handlePaymentType(payment))
  );

console.log(
  // runSyncExit will circuit break on the first failure and return the error
  // This skips invoking the rest of the payment flow, saving compute resources
  // For async effects, use: Effect.runPromiseExit(...)
  Effect.runSyncExit(
    handlePayment({
      amount: 100,
      country: "US",
      type: "PayPal",
      email: "test@mail",
    })
  )
);

console.log(
  Effect.runSyncExit(
    handlePayment({
      amount: 1, // Invalid amount
      country: "US",
      type: "PayPal",
      email: "test@mail",
    })
  )
);

console.log(
  Effect.runSyncExit(
    handlePayment({
      amount: 10,
      country: "US",
      type: "PayPal",
      cardNumber: "1234", // Type error caught by strict input union
    })
  )
);
