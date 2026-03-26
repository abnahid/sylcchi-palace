declare module "sslcommerz-lts" {
  class SSLCommerzPayment {
    constructor(storeId: string, storePassword: string, live?: boolean);
    init(data: Record<string, unknown>): Promise<{
      status?: string;
      GatewayPageURL?: string;
      failedreason?: string;
      [key: string]: unknown;
    }>;
    validate(data: { val_id: string }): Promise<{
      status?: string;
      tran_id?: string;
      [key: string]: unknown;
    }>;
  }

  export default SSLCommerzPayment;
}
