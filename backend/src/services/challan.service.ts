import pool from "../config/database";
import { findCustomerById } from "../models/customer.model";
import { findProductById, updateProductStock, Product } from "../models/product.model";
import { createStockMovement } from "../models/stockMovement.model";
import {
  createChallanHeader,
  updateChallanStatus,
  findChallanById,
  findChallans,
  ChallanWithDetails,
  ChallanQueryParams,
} from "../models/challan.model";
import { createChallanItems, CreateChallanItemInput } from "../models/challanItem.model";
import { generateNextChallanNumber } from "../utils/challanNumber";

export interface CreateChallanRequest {
  customer_id: number;
  status?: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  created_by: number;
}

export const createChallanService = async (
  input: CreateChallanRequest
): Promise<ChallanWithDetails> => {
  const customer = await findCustomerById(input.customer_id);
  if (!customer) {
    const err = new Error(`Customer with ID ${input.customer_id} not found`);
    (err as any).statusCode = 404;
    throw err;
  }

  const requestedStatus = input.status ? input.status.trim() : "Draft";
  if (!["Draft", "Confirmed"].includes(requestedStatus)) {
    const err = new Error("Invalid status. Must be Draft or Confirmed");
    (err as any).statusCode = 400;
    throw err;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Fetch products & build snapshots, aggregating quantities per product
    const productMap = new Map<number, { product: Product; requestedQty: number }>();
    const snapshotItemsInput: Array<{
      product_id: number;
      product_name: string;
      sku: string;
      unit_price: number;
      quantity: number;
    }> = [];

    let totalQuantity = 0;

    for (const item of input.items) {
      const product = await findProductById(item.product_id, client);
      if (!product) {
        const err = new Error(`Product with ID ${item.product_id} not found`);
        (err as any).statusCode = 404;
        throw err;
      }

      totalQuantity += item.quantity;

      const existing = productMap.get(item.product_id);
      if (existing) {
        existing.requestedQty += item.quantity;
      } else {
        productMap.set(item.product_id, { product, requestedQty: item.quantity });
      }

      snapshotItemsInput.push({
        product_id: product.id,
        product_name: product.product_name,
        sku: product.sku,
        unit_price: product.unit_price,
        quantity: item.quantity,
      });
    }

    // 2. Generate automatic challan number
    const challan_number = await generateNextChallanNumber(client);

    // 3. If Confirmed, perform Atomic Multi-Product Stock Check
    if (requestedStatus === "Confirmed") {
      for (const [product_id, entry] of productMap.entries()) {
        const { product, requestedQty } = entry;
        if (product.current_stock < requestedQty) {
          const err = new Error(
            `Insufficient stock for product '${product.product_name}' (SKU: ${product.sku}). Available: ${product.current_stock}, Required: ${requestedQty}`
          );
          (err as any).statusCode = 400;
          throw err;
        }
      }
    }

    // 4. Create Challan Header
    const challanHeader = await createChallanHeader(
      {
        challan_number,
        customer_id: input.customer_id,
        total_quantity: totalQuantity,
        status: requestedStatus,
        created_by: input.created_by,
      },
      client
    );

    // 5. Create Challan Items
    const itemInputs: CreateChallanItemInput[] = snapshotItemsInput.map((snap) => ({
      challan_id: challanHeader.id,
      product_id: snap.product_id,
      product_name: snap.product_name,
      sku: snap.sku,
      unit_price: snap.unit_price,
      quantity: snap.quantity,
    }));

    const items = await createChallanItems(itemInputs, client);

    // 6. If Confirmed, perform stock reductions and log OUT stock movements
    if (requestedStatus === "Confirmed") {
      for (const [product_id, entry] of productMap.entries()) {
        const { product, requestedQty } = entry;
        const newStock = product.current_stock - requestedQty;

        await updateProductStock(product_id, newStock, client);

        await createStockMovement(
          {
            product_id,
            quantity_changed: requestedQty,
            movement_type: "OUT",
            reason: `Sales Challan ${challan_number}`,
            created_by: input.created_by,
          },
          client
        );
      }
    }

    await client.query("COMMIT");

    const fullChallan = await findChallanById(challanHeader.id);
    return fullChallan || { ...challanHeader, items };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateChallanStatusService = async (
  id: number,
  newStatus: string,
  created_by: number
): Promise<ChallanWithDetails | null> => {
  const existingChallan = await findChallanById(id);
  if (!existingChallan) {
    return null;
  }

  if (existingChallan.status === newStatus) {
    return existingChallan;
  }

  if (existingChallan.status === "Cancelled") {
    const err = new Error("Cannot change status of a cancelled sales challan");
    (err as any).statusCode = 400;
    throw err;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (newStatus === "Confirmed" && existingChallan.status === "Draft") {
      // Aggregate quantities per product
      const productMap = new Map<number, { product: Product; requestedQty: number }>();

      if (!existingChallan.items || existingChallan.items.length === 0) {
        const err = new Error("Cannot confirm a sales challan with no items");
        (err as any).statusCode = 400;
        throw err;
      }

      for (const item of existingChallan.items) {
        const product = await findProductById(item.product_id, client);
        if (!product) {
          const err = new Error(`Product with ID ${item.product_id} not found`);
          (err as any).statusCode = 404;
          throw err;
        }

        const existing = productMap.get(item.product_id);
        if (existing) {
          existing.requestedQty += item.quantity;
        } else {
          productMap.set(item.product_id, { product, requestedQty: item.quantity });
        }
      }

      // Atomic Stock Check
      for (const [product_id, entry] of productMap.entries()) {
        const { product, requestedQty } = entry;
        if (product.current_stock < requestedQty) {
          const err = new Error(
            `Insufficient stock for product '${product.product_name}' (SKU: ${product.sku}). Available: ${product.current_stock}, Required: ${requestedQty}`
          );
          (err as any).statusCode = 400;
          throw err;
        }
      }

      // Decrement stock & record OUT movements
      for (const [product_id, entry] of productMap.entries()) {
        const { product, requestedQty } = entry;
        const newStock = product.current_stock - requestedQty;

        await updateProductStock(product_id, newStock, client);

        await createStockMovement(
          {
            product_id,
            quantity_changed: requestedQty,
            movement_type: "OUT",
            reason: `Sales Challan ${existingChallan.challan_number}`,
            created_by,
          },
          client
        );
      }
    } else if (newStatus === "Cancelled" && existingChallan.status === "Confirmed") {
      // Restore stock for confirmed items if cancelled
      if (existingChallan.items) {
        for (const item of existingChallan.items) {
          const product = await findProductById(item.product_id, client);
          if (product) {
            const newStock = product.current_stock + item.quantity;
            await updateProductStock(item.product_id, newStock, client);
            await createStockMovement(
              {
                product_id: item.product_id,
                quantity_changed: item.quantity,
                movement_type: "IN",
                reason: `Sales Challan ${existingChallan.challan_number} Cancelled`,
                created_by,
              },
              client
            );
          }
        }
      }
    }

    await updateChallanStatus(id, newStatus, client);

    await client.query("COMMIT");

    return await findChallanById(id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getChallanByIdService = async (
  id: number
): Promise<ChallanWithDetails | null> => {
  return await findChallanById(id);
};

export const getChallansService = async (
  params: ChallanQueryParams
): Promise<{ challans: ChallanWithDetails[]; total: number; page: number; limit: number }> => {
  return await findChallans(params);
};
