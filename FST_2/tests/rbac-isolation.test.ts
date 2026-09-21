import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ROLE_PERMISSIONS, hasPermission } from "../lib/authorization/permissions";
import { CreateTransactionSchema } from "../lib/validation";

describe("SecureOps Unit & RBAC Test Suite", () => {
  describe("Role-Based Access Control (RBAC) Matrix", () => {
    it("ADMIN role should possess all required capabilities", () => {
      expect(hasPermission("ADMIN", "transaction:create")).toBe(true);
      expect(hasPermission("ADMIN", "transaction:read")).toBe(true);
      expect(hasPermission("ADMIN", "transaction:update")).toBe(true);
      expect(hasPermission("ADMIN", "audit:read")).toBe(true);
      expect(hasPermission("ADMIN", "tenant:manage")).toBe(true);
    });

    it("MEMBER role should create/read transactions but NOT access audit logs", () => {
      expect(hasPermission("MEMBER", "transaction:create")).toBe(true);
      expect(hasPermission("MEMBER", "transaction:read")).toBe(true);
      expect(hasPermission("MEMBER", "audit:read")).toBe(false);
      expect(hasPermission("MEMBER", "tenant:manage")).toBe(false);
    });

    it("GUEST role should have strictly read-only access and NO mutation rights", () => {
      expect(hasPermission("GUEST", "transaction:read")).toBe(true);
      expect(hasPermission("GUEST", "transaction:create")).toBe(false);
      expect(hasPermission("GUEST", "transaction:update")).toBe(false);
      expect(hasPermission("GUEST", "audit:read")).toBe(false);
    });
  });

  describe("Transaction Validation & Payload Rules", () => {
    it("should accept valid transaction payload", () => {
      const validData = {
        tenantId: "tenant-apex-123",
        amount: 2500.5,
        currency: "USD",
        description: "Quarterly Audit Payment",
        recipientEmail: "audit@secureops.dev",
      };

      const parsed = CreateTransactionSchema.parse(validData);
      expect(parsed.amount).toBe(2500.5);
      expect(parsed.currency).toBe("USD");
    });

    it("should reject negative or zero amounts", () => {
      expect(() => {
        CreateTransactionSchema.parse({
          tenantId: "tenant-apex-123",
          amount: -50,
          description: "Invalid negative amount",
        });
      }).toThrow();
    });

    it("should reject invalid notification emails", () => {
      expect(() => {
        CreateTransactionSchema.parse({
          tenantId: "tenant-apex-123",
          amount: 100,
          description: "Testing invalid email",
          recipientEmail: "not-an-email",
        });
      }).toThrow();
    });
  });
});
