import { Request, Response } from "express";

export const sendUserOpHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  return "TX Success";
};
