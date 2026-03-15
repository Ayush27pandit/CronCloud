// test-webhook.js
import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

app.all("*", (req, res) => {
  const signature = req.headers["x-signature"];
  const timestamp = req.headers["x-timestamp"];
  const secret = "mysecret123";

  // The body contains the signed payload
  const signedPayload = req.body;
  
  // Re-sign to verify
  const payloadString = JSON.stringify(signedPayload);
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadString)
    .digest("hex");

  const isValid = signature === expectedSignature;

  console.log("\n=== WEBHOOK RECEIVED ===");
  console.log("X-Signature:", signature);
  console.log("X-Timestamp:", timestamp);
  console.log("Expected:", expectedSignature);
  console.log("Body (signed payload):", signedPayload);
  console.log("Signature valid:", isValid);
  console.log("========================\n");

  res.json({ received: true, signatureValid: isValid });
});

app.listen(4000, () => console.log("Test webhook server on port 4000"));
