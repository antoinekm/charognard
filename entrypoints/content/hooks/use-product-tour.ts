import { useContext } from 'react';
import { ProductTourContext } from '../contexts/product-tour';

export function useProductTour() {
  const context = useContext(ProductTourContext);
  if (!context) {
    throw new Error('useProductTour must be used within a ProductTourProvider');
  }
  return context;
}
