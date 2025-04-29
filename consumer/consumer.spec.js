// Setting up our test framework
const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

// We need Pact in order to use it in our test
const { provider } = require("../pact");
const { eachLike } = require("@pact-foundation/pact").MatchersV3;

// Importing our system under test (the orderClient) and our Order model
const { Order } = require("./order"); 
const { fetchOrders } = require("./orderClient");

// This is where we start writing our test
describe("Pact with Order API", () => {
  // ------------------- Happy Path Test Cases -------------------

  // ------------------- Happy Path Test Case 1: Single Order -------------------
  describe("given there are orders", () => {
    // Define the structure of an item in an order
    const itemProperties = {
      name: "burger",
      quantity: 2,
      value: 100,
    };

    // Define the structure of an order
    const orderProperties = {
      id: 1,
      items: eachLike(itemProperties),
    };

    describe("when a call to the API is made", () => {
      before(() => {
        // Set up the mock server to respond with a single order
        provider
          .given("there are orders") // Provider state
          .uponReceiving("a request for orders") // Description of the interaction
          .withRequest({
            method: "GET",
            path: "/orders", // The endpoint being tested
          })
          .willRespondWith({
            body: eachLike(orderProperties), // Response body with one or more orders
            status: 200, // HTTP status code
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
          });
      });

      it("will receive the list of current orders", () => {
        // Explanation:
        // This test verifies that the consumer can correctly process a response
        // containing a single order. The mock server returns one order with
        // predefined properties, and the consumer is expected to map it to an
        // Order object.

        return provider.executeTest((mockserver) => {
          process.env.API_PORT = mockserver.port; // Set the mock server port dynamically
          return expect(fetchOrders()).to.eventually.have.deep.members([
            new Order(orderProperties.id, [itemProperties]), // Expected result
          ]);
        });
      });
    });
  });

  // ------------------- Happy Path Test Case 2: Multiple Orders -------------------
  describe("given there are multiple orders", () => {
    // Define the structure of items for two different orders
    const itemProperties1 = {
      name: "burger",
      quantity: 2,
      value: 100,
    };
  
    const itemProperties2 = {
      name: "fries",
      quantity: 1,
      value: 50,
    };
  
    // Define the structure of two orders
    const orderProperties1 = {
      id: 1,
      items: eachLike(itemProperties1),
    };
  
    const orderProperties2 = {
      id: 2,
      items: eachLike(itemProperties2),
    };
  
    describe("when a call to the API is made", () => {
      before(() => {
        // Set up the mock server to respond with multiple orders
        provider
          .given("there are multiple orders") // Provider state
          .uponReceiving("a request for multiple orders") // Description of the interaction
          .withRequest({
            method: "GET",
            path: "/orders", // The endpoint being tested
          })
          .willRespondWith({
            body: [
              {
                id: 1,
                items: [
                  {
                    name: "burger",
                    quantity: 2,
                    value: 100,
                  },
                ],
              },
              {
                id: 2,
                items: [
                  {
                    name: "fries",
                    quantity: 1,
                    value: 50,
                  },
                ],
              },
            ],
            status: 200, // HTTP status code
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
          });
      });
  
      it("will receive the list of all current orders", () => {
        // Explanation:
        // This test verifies that the consumer can correctly process a response
        // containing multiple orders. The mock server returns two orders with
        // predefined properties, and the consumer is expected to map them to
        // an array of Order objects.

        return provider.executeTest((mockserver) => {
          process.env.API_PORT = mockserver.port; // Set the mock server port dynamically
          return expect(fetchOrders()).to.eventually.have.deep.members([
            new Order(1, [
              { name: "burger", quantity: 2, value: 100 },
            ]),
            new Order(2, [
              { name: "fries", quantity: 1, value: 50 },
            ]),
          ]);
        });
      });
    });
  });

  // ------------------- Negative (Unhappy Path) Test Cases -------------------

  // ------------------- Negative (Unhappy Path) Test Case 1: No Orders -------------------
  describe("given there are no orders", () => {
    describe("when a call to the API is made", () => {
      before(() => {
        // Set up the mock server to respond with an empty list of orders
        provider
          .given("there are no orders") // Provider state
          .uponReceiving("a request for orders") // Description of the interaction
          .withRequest({
            method: "GET",
            path: "/orders", // The endpoint being tested
          })
          .willRespondWith({
            body: [], // Empty response body
            status: 200, // HTTP status code
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
          });
      });
  
      it("will receive an empty list of orders", () => {
        // Explanation:
        // This test verifies that the consumer can handle an empty response
        // gracefully. The mock server returns an empty array, and the consumer
        // is expected to return an empty list without errors.

        return provider.executeTest((mockserver) => {
          process.env.API_PORT = mockserver.port; // Set the mock server port dynamically
          return expect(fetchOrders()).to.eventually.deep.equal([]); // Expected result
        });
      });
    });
  });
  // ------------------- Edge Test Case 1: Single Order with No Items -------------------
    describe("given there is a single order with no items", () => {
      describe("when a call to the API is made", () => {
        before(() => {
          // Set up the mock server to respond with a single order with no items
          provider
            .given("there is a single order with no items")
            .uponReceiving("a request for orders")
            .withRequest({
              method: "GET",
              path: "/orders",
            })
            .willRespondWith({
              body: [
                {
                  id: 1,
                  items: [], // Empty items array
                },
              ],
              status: 200,
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
            });
        });

        it("will receive a single order with no items", () => {
          // Test that the consumer correctly processes an order with no items
          return provider.executeTest((mockserver) => {
            process.env.API_PORT = mockserver.port;
            return expect(fetchOrders()).to.eventually.deep.equal([
              new Order(1, []), // Expected result: Order with no items
            ]);
          });
        });
      });
    });
    // ------------------- Edge Test Case 2: Order with Negative Quantity -------------------
    describe("given there is an order with a negative quantity", () => {
      describe("when a call to the API is made", () => {
        before(() => {
          // Set up the mock server to respond with an order containing a negative quantity
          provider
            .given("there is an order with a negative quantity")
            .uponReceiving("a request for orders")
            .withRequest({
              method: "GET",
              path: "/orders",
            })
            .willRespondWith({
              body: [
                {
                  id: 1,
                  items: [
                    {
                      name: "burger",
                      quantity: -2, // Invalid negative quantity
                      value: 100,
                    },
                  ],
                },
              ],
              status: 200,
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
            });
        });

        it("will throw an error for an order with a negative quantity", () => {
          // Test that the consumer throws an error for invalid data
          return provider.executeTest((mockserver) => {
            process.env.API_PORT = mockserver.port;
            return expect(fetchOrders()).to.be.rejectedWith(
              "Error processing orders: Invalid quantity"
            );
          });
        });
      });
    });
  });