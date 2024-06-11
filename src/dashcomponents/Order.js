import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, itemsPerPage]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_URL}/order/get`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      setOrders(res.data.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error fetching orders. Please try again.");
    }
  };

  const handleApproveOrder = async (orderId) => {
    try {
      await updateOrderStatus(orderId, "Delivered");
      toast.success(`Order status updated successfully!`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Error updating order status. Please try again.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_URL}/order/delete/${orderId}`);
      toast.success("Order deleted successfully!");
      const updatedOrders = orders.filter(order => order._id !== orderId);
      setOrders(updatedOrders);
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Error deleting order. Please try again.");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    return axios.put(
      `${process.env.REACT_APP_URL}/order/update/${orderId}`,
      { status },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  };

  const nextPage = () => {
    if (orders.length === itemsPerPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      <h1>Orders</h1>
      <ToastContainer />
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>User Name</th>
            <th>Products</th>
            <th>Order Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order._id}>
              <td>{index + 1}</td>
              <td>{order.user ? order.user.fullName : "N/A"}</td>
              <td>
                {order.products ? (
                  <ul>
                    {order.products.map((product, idx) => (
                      <li key={idx}>
                        <strong>Name:</strong> {product.productId.name || "N/A"} <br />
                        <strong>Category:</strong> {product.productId.categoryName || "N/A"} <br />
                        <strong>Color:</strong> {product.selectedOptions?.color || "Not specified"} <br />
                        <strong>Weight:</strong> {product.selectedOptions?.weights?.length > 0 ? product.selectedOptions.weights.join(", ") : "Not specified"} <br />
                      </li>
                    ))}
                  </ul>
                ) : (
                  "N/A"
                )}
              </td>
              <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}</td>
              <td>{order.orderStatus}</td>
              <td>
                {order.orderStatus === "Pending" && (
                  <>
                    <Button
                      variant="success"
                      onClick={() => handleApproveOrder(order._id)}
                    >
                      Approve
                    </Button>{" "}
                  </>
                )}
                <Button variant="danger" onClick={() => handleDeleteOrder(order._id)}>
                  <FontAwesomeIcon icon={faTrashAlt} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div>
        <Button
          variant="secondary"
          disabled={currentPage === 1}
          onClick={prevPage}
        >
          Previous
        </Button>
        <span style={{ margin: "0 10px" }}>Page {currentPage}</span>
        <Button variant="secondary" onClick={nextPage}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default Order;