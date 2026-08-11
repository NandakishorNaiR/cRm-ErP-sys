import { Request, Response } from "express";
import {
  recordStockMovementService,
  getStockMovementsService,
} from "../services/stock.service";

export const addStockMovement = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { product_id, quantity_changed, movement_type, reason } = req.body;
    const created_by = req.user.id;

    const result = await recordStockMovementService({
      product_id: Number(product_id),
      quantity_changed: Number(quantity_changed),
      movement_type,
      reason,
      created_by,
    });

    res.status(201).json({
      success: true,
      message: `Stock ${movement_type.toUpperCase()} recorded successfully`,
      data: result,
    });
  } catch (error: any) {
    if (error.statusCode === 400 || (error.message && error.message.includes("Insufficient stock"))) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }
    if (error.message === "Product not found") {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }
    console.error("addStockMovement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record stock movement",
    });
  }
};

export const getStockMovements = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product_id = req.query.product_id ? Number(req.query.product_id) : undefined;
    const movement_type = req.query.movement_type ? String(req.query.movement_type) : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await getStockMovementsService({
      product_id,
      movement_type,
      page,
      limit,
    });

    const totalPages = Math.ceil(result.total / result.limit) || 1;

    res.status(200).json({
      success: true,
      data: result.movements,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("getStockMovements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stock movements",
    });
  }
};
