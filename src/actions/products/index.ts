import type { IProduct } from '@/interfaces';
import { defineAction } from 'astro:actions';
import { count, db, eq, Product, ProductImage, sql } from 'astro:db';
import { z } from 'astro:schema';
import { getSession } from 'auth-astro/server';
import { v4 as uuid } from 'uuid';
import { ACEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '../config';
import { deleteImage, uploadImage } from '@/utils/image-upload';

export const getProductsByPage = defineAction({
  accept: 'json',
  input: z.object({
    page: z.number().optional().default(1),
    limit: z.number().optional().default(12),
  }),
  handler: async ({ page, limit }) => {
    page = page < 1 ? 1 : page;

    const [totalRecords] = await db.select({ count: count() }).from(Product);

    const totalPages = Math.ceil(totalRecords.count / limit);

    if (page > totalPages) {
      return {
        products: [] as IProduct[],
        totalPages,
        totalRecords: totalRecords.count,
      };
    }

    const productsQuery = sql`
      select a.*, (select GROUP_CONCAT(IMAGE, ',') from 
        (select * from ${ProductImage} where productId = a.id limit 2)
      ) as images from ${Product} a
      limit ${limit} offset ${(page - 1) * limit}
      `;

    const { rows } = await db.run(productsQuery);

    const products = rows.map((product) => {
      return {
        ...product,
        images: product.images ? product.images : 'no-imnages.png',
      };
    });

    return {
      products: products as unknown as IProduct[],
      totalPages,
    };
  },
});

export const getProductBySlug = defineAction({
  accept: 'json',
  input: z.string(),
  handler: async (slug) => {
    console.log('slug action', slug);
    const [product] = await db
      .select()
      .from(Product)
      .where(eq(Product.slug, slug));

    console.log('slug action', slug);

    if (!product) {
      throw new Error('Product not found');
    }

    const images = await db
      .select()
      .from(ProductImage)
      .where(eq(ProductImage.productId, product.id));

    return {
      product,
      // images: images.map(({ image }) => image),
      images,
    };
  },
});

export const createOrUpdateProduct = defineAction({
  accept: 'form',
  input: z.object({
    id: z.string().optional(),
    stock: z.number(),
    slug: z.string(),
    price: z.number(),
    sizes: z.string(),
    type: z.string(),
    tags: z.string(),
    title: z.string(),
    description: z.string(),
    gender: z.string(),

    //TODO Imagen
    imageFiles: z
      .array(
        z
          .instanceof(File)
          .refine((file) => file.size <= MAX_FILE_SIZE, 'Max image size 5MB')
          .refine((file) => {
            if (file.size === 0) return true;

            return ACEPTED_IMAGE_TYPES.includes(file.type);
          }, `Only supported image files are valid, ${ACEPTED_IMAGE_TYPES.join(', ')}`)
      )
      .optional(),
  }),
  handler: async (form, { request }) => {
    const session = await getSession(request);
    const user = session?.user;

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { id = uuid(), imageFiles, ...rest } = form;

    rest.slug = rest.slug.toLowerCase().replaceAll(' ', '-').trim();

    const product = {
      id,
      user: user.id || '',
      ...rest,
    };

    const queries: any = [];

    console.log('product', product);

    if (!form.id) {
      queries.push(db.insert(Product).values(product));
    } else {
      queries.push(db.update(Product).set(product).where(eq(Product.id, id)));
    }

    if (imageFiles && imageFiles.length > 0 && imageFiles[0].size > 0) {
      const urls = await Promise.all(
        imageFiles.map((imageFile) => uploadImage(imageFile))
      );

      urls.forEach((url) => {
        const imageObj = {
          id: uuid(),
          image: url,
          productId: product.id,
        };

        console.log('imageObj', imageObj);

        queries.push(db.insert(ProductImage).values(imageObj));
      });
    }

    await db.batch(queries);

    return product;
  },
});

export const deleteProductImage = defineAction({
  accept: 'json',
  input: z.string(),
  handler: async (imageId, { request }) => {
    const session = await getSession(request);
    const user = session?.user;

    if (!user) {
      throw new Error('Unauthorized');
    }

    const [productImage] = await db
      .select()
      .from(ProductImage)
      .where(eq(ProductImage.id, imageId));

    if (!productImage) {
      throw new Error('Image not found');
    }

    const deleted = await db
      .delete(ProductImage)
      .where(eq(ProductImage.id, productImage.id));

    if (productImage.image.includes('http')) {
      await deleteImage(productImage.image);
    }

    return { ok: true };
  },
});
