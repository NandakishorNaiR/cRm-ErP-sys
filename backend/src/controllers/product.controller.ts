import { Request, Response } from "express";
import {
  addProductService,
  editProductService,
  getProductByIdService,
  getProductsService,
} from "../services/product.service";

export const addProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await addProductService(req.body);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error: any) {
    console.error("addProduct error:", error);
    if (error.message && error.message.includes("already exists")) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

export const editProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const product = await editProductService(id, req.body);
    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error: any) {
    console.error("editProduct error:", error);
    if (error.message && error.message.includes("already exists")) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const search = req.query.search ? String(req.query.search) : undefined;
    const category = req.query.category ? String(req.query.category) : undefined;
    const warehouse_location = req.query.warehouse_location
      ? String(req.query.warehouse_location)
      : undefined;
    const low_stock_only = req.query.low_stock_only === "true";
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await getProductsService({
      search,
      category,
      warehouse_location,
      low_stock_only,
      page,
      limit,
    });

    const totalPages = Math.ceil(result.total / result.limit) || 1;

    res.status(200).json({
      success: true,
      data: result.products,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const product = await getProductByIdService(id);
    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("getProductById error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};
