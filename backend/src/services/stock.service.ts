import pool from "../config/database";
import { findProductById, updateProductStock, Product } from "../models/product.model";
import {
  createStockMovement,
  findStockMovements,
  StockMovement,
  CreateStockMovementInput,
  StockMovementQueryParams,
} from "../models/stockMovement.model";

export interface StockMovementResponse {
  movement: StockMovement;
  product: Product;
}

export const recordStockMovementService = async (
  input: CreateStockMovementInput
): Promise<StockMovementResponse> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const product = await findProductById(input.product_id, client);
    if (!product) {
      throw new Error("Product not found");
    }

    const type = input.movement_type.toUpperCase();
    let newStock = product.current_stock;

    if (type === "IN") {
      newStock += input.quantity_changed;
    } else if (type === "OUT") {
      if (product.current_stock < input.quantity_changed) {
        const err = new Error(
          `Insufficient stock available. Current stock: ${product.current_stock}, requested OUT: ${input.quantity_changed}`
        );
        (err as any).statusCode = 400;
        throw err;
      }
      newStock -= input.quantity_changed;
    } else {
      throw new Error("Invalid movement_type. Must be IN or OUT.");
    }

    const updatedProduct = await updateProductStock(input.product_id, newStock, client);
    if (!updatedProduct) {
      throw new Error("Failed to update product stock");
    }

    const movement = await createStockMovement(input, client);

    await client.query("COMMIT");

    return {
      movement,
      product: updatedProduct,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getStockMovementsService = async (
  params: StockMovementQueryParams
): Promise<{ movements: StockMovement[]; total: number; page: number; limit: number }> => {
  return await findStockMovements(params);
};
