import { NextRequest, NextResponse } from "next/server";
import { LedgerService } from "@/services/ledgerService";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters = {
      account_id: searchParams.get("account_id") || undefined,
      start_date: searchParams.get("start_date") 
        ? new Date(searchParams.get("start_date")!) 
        : undefined,
      end_date: searchParams.get("end_date") 
        ? new Date(searchParams.get("end_date")!) 
        : undefined,
      page: searchParams.get("page") 
        ? parseInt(searchParams.get("page")!) 
        : 1,
      limit: searchParams.get("limit") 
        ? parseInt(searchParams.get("limit")!) 
        : 50,
    };

    const result = await LedgerService.getLedgerEntries(filters);
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
