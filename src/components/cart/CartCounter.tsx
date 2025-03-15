import {useStore} from "@nanostores/react"
import { itemsInCart } from '@/store';
import { useEffect } from "react";
import { getCart } from "@/utils";

const CartCounter = () => {
  const $itemsInCart = useStore(itemsInCart)


  useEffect(() => {
    const cart = getCart()

    itemsInCart.set(cart.length)
  }, [])
  return (
    <a
      href='/cart'
      className='relative inline-block'
    >
      {$itemsInCart > 0 && (
        <span className='absolute -top-2 -right-2 flex justify-center items-center bg-blue-500 text-white text-xs rounded-full w-5 h-5'>
        {$itemsInCart}
      </span>
      )}
    

      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='1.5rem'
        height='1.5rem'
        viewBox='0 0 32 32'
      >
        <g
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
        >
          <path d='M6 6h24l-3 13H9m18 4H10L5 2H2'></path>
          <circle
            cx={25}
            cy={27}
            r={2}
          ></circle>
          <circle
            cx={12}
            cy={27}
            r={2}
          ></circle>
        </g>
      </svg>
    </a>
  );
};

export default CartCounter;
