import type { IProduct } from '@/interfaces';
import React, { type FC } from 'react';
import ProductCard from './ProductCard';

interface Props {
  products: IProduct[];
}

const ProductList: FC<Props> = ({ products }) => {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 place-items-center'>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
};

export default ProductList;
