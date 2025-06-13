"use server";
import { db } from "@/lib/db";

export const getCompanies = async () => {
  const companies = await db.company.findMany();
  return companies;
};
