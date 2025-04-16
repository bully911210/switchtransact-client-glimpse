import React, { useState, useEffect } from 'react';
import { PRODUCTS, ProductConfig, getDefaultProduct } from '@/config/api-config';
import { setCurrentProduct } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface ProductSelectorProps {
  onProductChange?: (product: ProductConfig) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ onProductChange }) => {
  // Initialize with DearSA product
  const [selectedProduct, setSelectedProduct] = useState<ProductConfig>(getDefaultProduct());
  const { toast } = useToast();

  // Set DearSA as the current product on component mount
  useEffect(() => {
    const dearSaProduct = setCurrentProduct('dear-sa');
    setSelectedProduct(dearSaProduct);
    if (onProductChange) {
      onProductChange(dearSaProduct);
    }
  }, [onProductChange]);

  // Handle product change
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    const product = setCurrentProduct(productId);
    setSelectedProduct(product);

    // Notify parent component
    if (onProductChange) {
      onProductChange(product);
    }

    // Check if the product has an API key
    if (!product.apiKey) {
      // Show warning toast for products without API keys
      toast({
        title: `Warning: ${product.name} API Not Configured`,
        description: `The API key for ${product.name} is not configured. Please select DearSA for a working API connection.`,
        variant: "destructive",
        duration: 5000,
      });
    } else {
      // Show success toast for products with API keys
      toast({
        title: `Product Changed: ${product.name}`,
        description: `Now using the ${product.name} API configuration.`,
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex items-center">
      <label htmlFor="product-selector" className="mr-2 text-sm font-medium text-gray-700">
        Product:
      </label>
      <select
        id="product-selector"
        value={selectedProduct.id}
        onChange={handleProductChange}
        className="text-sm bg-white border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
      >
        {PRODUCTS.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProductSelector;
