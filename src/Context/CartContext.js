import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const sessionCart = sessionStorage.getItem("cart");
    return sessionCart ? JSON.parse(sessionCart) : [];
  });

  const [cartID, setCartID] = useState(() => {
    const sessionCartID = sessionStorage.getItem("cartID");
    return sessionCartID ? JSON.parse(sessionCartID) : null;
  });

  useEffect(() => {
    sessionStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (cartID !== null) {
      sessionStorage.setItem("cartID", JSON.stringify(cartID));
    }
  }, [cartID]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart, product];
      return updatedCart;
    });
    const newCartID = generateCartID();
    setCartID(newCartID);
  };

  const generateCartID = () => {
    const newCartID = "cart_" + Math.random().toString(36).substr(2, 9);
    return newCartID;
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item._id !== productId);
      return updatedCart;
    });
  };

  const updateQuantity = (product, newQuantity, selectedOptions) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product._id === product._id &&
        (item.selectedOptions.color ===
          JSON.stringify(item.selectedOptions.size)) ===
          JSON.stringify(selectedOptions.size)
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const submitCart = async (userId, totalAmount) => {
    try {
      if (typeof totalAmount !== "number") {
        throw new Error("Invalid totalAmount");
      }

      const orderData = {
        user: userId,
        cartId: cartID,
        products: cart.map((item) => ({
          productId: item._id.toString(),
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
          price: calculateItemPrice(item).toFixed(2),
        })),
        price: totalAmount.toFixed(2),
        orderStatus: "Pending",
        orderDate: new Date().toISOString(),
      };

      const response = await axios.post(
        `${process.env.REACT_APP_URL}/order/create`,
        orderData
      );

      if (response && response.status === 200 && response.data.success) {
        setCart([]);
        sessionStorage.removeItem("cart");
        return response.data;
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error submitting cart:", error);
      throw error;
    }
  };

  const calculateItemPrice = (item) => {
    // console.log('Calculating price for item:', item);

    if (!item || typeof item !== "object") {
      console.error("Invalid item structure:", item);
      return 0;
    }
    const basePrice = item.price || 0;
    // console.log('Base price:', basePrice);

    const sizePrice = Array.isArray(item.selectedOptions?.size)
      ? item.selectedOptions.size.reduce((total, size) => {
          // console.log('Weight:', weight);
          const sizeOption = item.characteristics
            ?.find((char) => char.type.toLowerCase() === "size")
            ?.options.find((option) => option.value === size);
          console.log("Size option:", sizeOption);
          return total + (sizeOption ? sizeOption.price : 0);
        }, 0)
      : 0;
    return basePrice + sizePrice;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        submitCart,
        cartID,
        calculateItemPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
