import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";

// POST /orders/order/{order_id}/confirm-delivery/token={confirmation_token}
const tempReqName = async (
  data?: any,
  params?: Record<string, string>,
  token?: string
) => {
  const config = getConfig(`api url path`, "POST", token, data, params);
  return bookiesAxiosInstance(config);
};

export { tempReqName };
