import { db, Role, User, Product, ProductImage } from 'astro:db';
import { v4 as uuid } from 'uuid';
import bvcrypt from 'bcryptjs';
import { seedProducts } from './seed-data';
// https://astro.build/db/seed
export default async function seed() {
  // TODO

  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
    },
    {
      id: 'user',
      name: 'User',
    },
  ];

  const johnDoe = {
    id: uuid(),
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    password: bvcrypt.hashSync('123456', 10),
    role: 'admin',
  };

  const janeDoe = {
    id: uuid(),
    name: 'Jane Doe',
    email: 'jane.doe@gmail.com',
    password: bvcrypt.hashSync('123456', 10),
    role: 'user',
  };

  await db.insert(Role).values(roles);
  await db.insert(User).values([johnDoe, janeDoe]);

  const queries: any = [];

  seedProducts.forEach(
    ({
      stock,
      slug,
      price,
      sizes,
      type,
      tags,
      title,
      description,
      gender,
      images,
    }) => {
      const newProduct = {
        id: uuid(),
        stock,
        slug,
        price,
        sizes: sizes.join(','),
        type,
        tags: tags.join(','),
        title,
        description,
        gender,
        user: johnDoe.id,
      };

      queries.push(db.insert(Product).values(newProduct));

      images.forEach((img) => {
        const image = {
          id: uuid(),
          image: img,
          productId: newProduct.id,
        };

        queries.push(db.insert(ProductImage).values(image));
      });
    }
  );

  await db.batch(queries);
}
