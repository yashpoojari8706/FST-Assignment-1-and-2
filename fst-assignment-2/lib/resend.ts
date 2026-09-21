import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY || "re_mock_test_key_secureops";

export const resend = new Resend(apiKey);

export default resend;
