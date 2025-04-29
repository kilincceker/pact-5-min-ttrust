const request = require("superagent");
const { Order } = require("./order");

const hostname = "127.0.0.1"

const fetchOrders = async () => {
  try {
    const res = await request.get(`http://${hostname}:${process.env.API_PORT}/orders`);
    
    // Validate and map the response to Order objects
    return res.body.map((o) => {
      // Validate each item in the items array
      o.items.forEach((item) => {
        if (item.quantity < 0) {
          throw new Error(`Error processing orders: Invalid quantity "${item.quantity}" for item "${item.name}"`);
        }
      });

      // Map the validated order to an Order object
      return new Order(o.id, o.items);
    });
  } catch (err) {
    console.error("Error fetching orders:", err.message);
    throw new Error(err.message);
  }
};

module.exports = {
  fetchOrders,
};
