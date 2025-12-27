/**
 * Request logging middleware
 */

import type { Request, Response, NextFunction } from "express";

/**
 * Simple request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  
  console.log(`[${timestamp}] ${method} ${path}`);
  
  // Log response status when finished
  res.on("finish", () => {
    const status = res.statusCode;
    const statusEmoji = status >= 200 && status < 300 ? "✅" : status >= 400 ? "❌" : "⚠️";
    console.log(`${statusEmoji} [${timestamp}] ${method} ${path} - ${status}`);
  });
  
  next();
}

