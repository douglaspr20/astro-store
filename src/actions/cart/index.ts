import type { CartItem } from "@/interfaces";
import { defineAction } from "astro:actions";
import { db, eq, inArray, Product, ProductImage } from "astro:db";

export const loadProductsFromCart = defineAction({
    accept: "json",
    handler: async (_ , {cookies}) => {


       const cart = (cookies.get('cart')?.json() ?? []) as CartItem[];

       if(cart.length === 0) return []

       console.log("cart", cart)


       const productsIds = cart.map(item => item.productId)

       const dbProducts = await db.select().from(Product)
       .innerJoin(ProductImage, eq(Product.id, ProductImage.productId))
       .where(inArray(Product.id, productsIds))


       return cart.map(item => {

        const dbProduct = dbProducts.find(({Product}) => Product?.id === item.productId)

        if(!dbProduct) throw new Error('Product not found')

            const {title, price, slug} = dbProduct.Product

            const image = dbProduct.ProductImage?.image

            return {
                productId: item.productId,
                title,
                size: item.size,
                quantity: item.quantity,
                image: image.startsWith('http') ? image : `${import.meta.env.PUBLIC_URL}/images/products/${image}`,
                price,
                slug
            }
       })
    },
})