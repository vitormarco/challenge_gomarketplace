import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );

      if (productsStorage) {
        setProducts([...JSON.parse(productsStorage)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExist = products.find(p => p.id === product.id);

      let newProduct = [];
      if (productExist) {
        newProduct = products.map(p =>
          p.id === product.id ? { ...product, quantity: p.quantity + 1 } : p,
        );
        setProducts(newProduct);
      } else {
        newProduct = [...products, { ...product, quantity: 1 }];
        setProducts(newProduct);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(newProduct),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProduct = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p,
      );

      setProducts(newProduct);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(newProduct),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProduct = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity - 1 } : p,
      );

      setProducts(newProduct);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(newProduct),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
