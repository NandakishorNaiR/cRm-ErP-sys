import {
  createProduct,
  updateProduct,
  findProductById,
  findProductBySku,
  findProducts,
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductQueryParams,
} from "../models/product.model";

export const addProductService = async (
  input: CreateProductInput
): Promise<Product> => {
  const existing = await findProductBySku(input.sku);
  if (existing) {
    throw new Error(`Product SKU '${input.sku}' already exists`);
  }
  return await createProduct(input);
};

export const editProductService = async (
  id: number,
  input: UpdateProductInput
): Promise<Product | null> => {
  if (input.sku) {
    const existing = await findProductBySku(input.sku);
    if (existing && existing.id !== id) {
      throw new Error(`Product SKU '${input.sku}' already exists`);
    }
  }
  return await updateProduct(id, input);
};

export const getProductByIdService = async (
  id: number
): Promise<Product | null> => {
  return await findProductById(id);
};

export const getProductsService = async (
  params: ProductQueryParams
): Promise<{ products: Product[]; total: number; page: number; limit: number }> => {
  return await findProducts(params);
};
