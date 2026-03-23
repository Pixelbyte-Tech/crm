import { QueryRunner, MigrationInterface } from 'typeorm';

export class Sql1774300477153 implements MigrationInterface {
  name = 'Sql1774300477153';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "trading_account_type_leverage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "leverages" integer array NOT NULL, "countries" character varying(3) array NOT NULL, "tradingAccountTypeId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_debf2553a55dba41fef779c8efa" UNIQUE ("tradingAccountTypeId", "leverages", "countries"), CONSTRAINT "PK_b1adc4cadcc63e5bd2d14c52fd4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b2b1d5983b107b64a91bf88f83" ON "trading_account_type_leverage" ("tradingAccountTypeId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "trading_account_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "description" text, "isEnabled" boolean NOT NULL DEFAULT false, "isKycRequired" boolean NOT NULL DEFAULT false, "allowedLeverages" integer array, "allowedCurrencies" character varying(3) array, "allowedCountries" character varying(3) array, "excludedCountries" character varying(3) array, "minDepositAmountUsd" numeric, "maxDepositAmountUsd" numeric, "maxAccountsPerUser" integer, "userGroupName" text, "platformUserGroupId" text NOT NULL, "serverId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d2526f8f85282a9ccd2cc26b747" UNIQUE ("name"), CONSTRAINT "PK_56e2e7d0077e776c5d875124f96" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_57189f0be2fc7943a94f217d47" ON "trading_account_type" ("serverId") `);
    await queryRunner.query(
      `CREATE TYPE "public"."server_platform_enum" AS ENUM('mt5', 'ctrader', 'tradelocker', 'dxtrade')`,
    );
    await queryRunner.query(`CREATE TYPE "public"."server_monetization_enum" AS ENUM('real', 'demo')`);
    await queryRunner.query(
      `CREATE TABLE "server" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "platform" "public"."server_platform_enum" NOT NULL, "monetization" "public"."server_monetization_enum" NOT NULL, "isEnabled" boolean NOT NULL DEFAULT false, "settings" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e16254733ff2264f94f856316ee" UNIQUE ("name"), CONSTRAINT "PK_f8b8af38bdc23b447c0a57c7937" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_902704dee723d735fa0af911f4" ON "server" ("platform") `);
    await queryRunner.query(`CREATE INDEX "IDX_52e1ed2ce967ea8db8993eb74e" ON "server" ("monetization") `);
    await queryRunner.query(
      `CREATE TABLE "tag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b" UNIQUE ("name"), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "trading_account_tag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tagId" uuid NOT NULL, "tradingAccountId" uuid NOT NULL, "taggedByUserId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d4be9fd08a316d25d594ca0c473" UNIQUE ("tagId", "tradingAccountId"), CONSTRAINT "PK_4269e577cfd0a145a1357d4e8c7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_d44e3bfca46203999446a556fa" ON "trading_account_tag" ("tagId") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_6242ad1311294b229ee78dc71e" ON "trading_account_tag" ("tradingAccountId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1bcf082f7eae195b16dd4b35e1" ON "trading_account_tag" ("taggedByUserId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "trading_account_note" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "summary" text, "body" text NOT NULL, "isPinned" boolean NOT NULL DEFAULT false, "authorId" uuid NOT NULL, "tradingAccountId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b2969e0524ee5e0f22f079de39f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_1a124cb89d5f68383e8b7bcdfb" ON "trading_account_note" ("isPinned") `);
    await queryRunner.query(`CREATE INDEX "IDX_f7cea51933658d5b6faea45c73" ON "trading_account_note" ("authorId") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_9b8d6fe43113dad71c5275c9c3" ON "trading_account_note" ("tradingAccountId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."wallet_transaction_history_status_enum" AS ENUM('open', 'rejected', 'processing', 'completed', 'failed', 'canceled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "wallet_transaction_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."wallet_transaction_history_status_enum" NOT NULL, "comment" text, "occurredAt" TIMESTAMP NOT NULL, "tradingAccountId" uuid, "userId" uuid NOT NULL, "walletId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_98b95e87a53f283021718a150d6" PRIMARY KEY ("id", "createdAt")) PARTITION BY RANGE ("createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4e343762e1fab760d9248dda1d" ON "wallet_transaction_history" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_964e7e809f04289fba17efa595" ON "wallet_transaction_history" ("occurredAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a5e230a983916c53f15b7b6464" ON "wallet_transaction_history" ("tradingAccountId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f80db91119dbacc5f6ed1f62bc" ON "wallet_transaction_history" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5a8241c79ab3ecbaa438605195" ON "wallet_transaction_history" ("walletId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."trading_account_platform_enum" AS ENUM('mt5', 'ctrader', 'tradelocker', 'dxtrade')`,
    );
    await queryRunner.query(`CREATE TYPE "public"."trading_account_monetization_enum" AS ENUM('real', 'demo')`);
    await queryRunner.query(`CREATE TYPE "public"."trading_account_status_enum" AS ENUM('active', 'suspended')`);
    await queryRunner.query(
      `CREATE TABLE "trading_account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "platformId" text NOT NULL, "platformUserId" text, "platformAccountName" text, "friendlyName" text, "platform" "public"."trading_account_platform_enum" NOT NULL, "monetization" "public"."trading_account_monetization_enum" NOT NULL, "status" "public"."trading_account_status_enum" NOT NULL, "registeredAt" TIMESTAMP NOT NULL, "login" text NOT NULL, "password" text NOT NULL, "serverId" uuid NOT NULL, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_228ac2effbc4deb31cad77f7b2a" UNIQUE ("serverId", "platformId"), CONSTRAINT "PK_25bd7be8455e74a8a1ea478203f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_c7fc44c34f7727c055541a3be6" ON "trading_account" ("serverId") `);
    await queryRunner.query(`CREATE INDEX "IDX_6e4e317edbe690900ebad00b98" ON "trading_account" ("userId") `);
    await queryRunner.query(
      `CREATE TYPE "public"."wallet_transaction_type_enum" AS ENUM('deposit', 'withdrawal', 'transfer', 'fee')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."wallet_transaction_status_enum" AS ENUM('open', 'rejected', 'processing', 'completed', 'failed', 'canceled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "wallet_transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "externalId" character varying, "type" "public"."wallet_transaction_type_enum" NOT NULL, "status" "public"."wallet_transaction_status_enum" NOT NULL, "amount" numeric NOT NULL, "balanceBefore" numeric NOT NULL, "balanceAfter" numeric NOT NULL, "ipAddress" character varying, "comment" text, "tradingAccountId" uuid, "userId" uuid NOT NULL, "walletId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b0aeefba240d7685fe37832df67" PRIMARY KEY ("id", "createdAt")) PARTITION BY RANGE ("createdAt")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_060e96e8f43c47d27653d757fc" ON "wallet_transaction" ("type") `);
    await queryRunner.query(`CREATE INDEX "IDX_c73c76a0e033bed04036835fce" ON "wallet_transaction" ("status") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_01fd2ad964a28e540fd26c855c" ON "wallet_transaction" ("tradingAccountId") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_9071d3c9266c4521bdafe29307" ON "wallet_transaction" ("userId") `);
    await queryRunner.query(`CREATE INDEX "IDX_07de5136ba8e92bb97d45b9a7a" ON "wallet_transaction" ("walletId") `);
    await queryRunner.query(`CREATE TYPE "public"."wallet_assettype_enum" AS ENUM('fiat', 'crypto', 'commission')`);
    await queryRunner.query(
      `CREATE TABLE "wallet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "friendlyName" character varying, "assetType" "public"."wallet_assettype_enum" NOT NULL, "balance" numeric NOT NULL, "currency" character varying(3) NOT NULL, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c8d0130b44210fe9bb058e30c49" UNIQUE ("userId", "currency"), CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_f91dbefa771fbcbde7dc44ea08" ON "wallet" ("assetType") `);
    await queryRunner.query(`CREATE INDEX "IDX_852bd836234c8f7777ec35957f" ON "wallet" ("currency") `);
    await queryRunner.query(`CREATE INDEX "IDX_35472b1fe48b6330cd34970956" ON "wallet" ("userId") `);
    await queryRunner.query(
      `CREATE TYPE "public"."loyalty_history_source_enum" AS ENUM('login', 'mystery_box', 'daily_trading', 'weekly_trading', 'risk_mastery', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "loyalty_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "points" integer NOT NULL, "source" "public"."loyalty_history_source_enum" NOT NULL, "reason" text NOT NULL, "loyaltyId" uuid NOT NULL, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_29335f4440bf09731465c7134cc" UNIQUE ("userId", "points", "createdAt"), CONSTRAINT "PK_02550f0cb8fc916498f38ecb916" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_3d0094ee38350ffdcb38f1282e" ON "loyalty_history" ("loyaltyId") `);
    await queryRunner.query(`CREATE INDEX "IDX_c1aa0a0f83df296557b410f5b9" ON "loyalty_history" ("userId") `);
    await queryRunner.query(
      `CREATE TYPE "public"."loyalty_program_enum" AS ENUM('standard', 'silver', 'gold', 'platinum')`,
    );
    await queryRunner.query(
      `CREATE TABLE "loyalty" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "points" integer NOT NULL DEFAULT '0', "spins" integer NOT NULL DEFAULT '0', "program" "public"."loyalty_program_enum" NOT NULL DEFAULT 'standard', "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a7e5fcf9e75f61d7a58c84046e1" UNIQUE ("userId"), CONSTRAINT "REL_a7e5fcf9e75f61d7a58c84046e" UNIQUE ("userId"), CONSTRAINT "PK_327d399b9ca75dd638ccbd4b991" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_a7e5fcf9e75f61d7a58c84046e" ON "loyalty" ("userId") `);
    await queryRunner.query(
      `CREATE TABLE "user_note" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "summary" text, "body" text NOT NULL, "isPinned" boolean NOT NULL DEFAULT false, "authorId" uuid NOT NULL, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_de9eca07e8faa7006abc18152c6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_f41080bfa60a302640e365e552" ON "user_note" ("isPinned") `);
    await queryRunner.query(`CREATE INDEX "IDX_071db9921110b2fe5d57cb70f9" ON "user_note" ("authorId") `);
    await queryRunner.query(`CREATE INDEX "IDX_236dbd155cee61376a01591357" ON "user_note" ("userId") `);
    await queryRunner.query(`CREATE TYPE "public"."audit_log_actor_enum" AS ENUM('user', 'system')`);
    await queryRunner.query(
      `CREATE TYPE "public"."audit_log_targetaction_enum" AS ENUM('created', 'updated', 'deleted')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."audit_log_targettype_enum" AS ENUM('user', 'document', 'note', 'wallet', 'trading_account', 'session', 'setting', 'integration', 'server', 'other')`,
    );
    await queryRunner.query(`CREATE TYPE "public"."audit_log_result_enum" AS ENUM('success', 'failure')`);
    await queryRunner.query(
      `CREATE TABLE "audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actor" "public"."audit_log_actor_enum" NOT NULL, "targetAction" "public"."audit_log_targetaction_enum" NOT NULL, "targetType" "public"."audit_log_targettype_enum" NOT NULL DEFAULT 'other', "targetId" uuid NOT NULL, "result" "public"."audit_log_result_enum" NOT NULL DEFAULT 'success', "failureReason" text, "ipAddress" inet NOT NULL, "userAgent" text, "requestId" text, "metadata" jsonb, "userId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0a5cdb588008e852bb876b8810c" PRIMARY KEY ("id", "createdAt")) PARTITION BY RANGE ("createdAt")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_0d76b9269d1a17f43c0f38a4fa" ON "audit_log" ("targetAction") `);
    await queryRunner.query(`CREATE INDEX "IDX_8ae954f53cbae392e68fe3181e" ON "audit_log" ("targetType") `);
    await queryRunner.query(`CREATE INDEX "IDX_6bf30b22728b8da796a0318354" ON "audit_log" ("targetId") `);
    await queryRunner.query(`CREATE INDEX "IDX_2621409ebc295c5da7ff3e4139" ON "audit_log" ("userId") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_789c93161549f4a123834e2ef2" ON "audit_log" ("userId", "targetType", "targetId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."invitation_status_enum" AS ENUM('pending', 'resend_Pending', 'accepted', 'rejected', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."invitation_roles_enum" AS ENUM('admin', 'trade_support', 'cs_agent', 'compliance', 'user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "invitation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" text NOT NULL, "status" "public"."invitation_status_enum" NOT NULL, "token" text NOT NULL, "roles" "public"."invitation_roles_enum" array NOT NULL, "firstSentAt" TIMESTAMP, "lastSentAt" TIMESTAMP, "expiresInDays" integer NOT NULL DEFAULT '30', "sentByUserId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_10d7b44ad5982f39947236cbcba" UNIQUE ("email", "status"), CONSTRAINT "PK_beb994737756c0f18a1c1f8669c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_a821ee4020f454d776e2d27da2" ON "invitation" ("sentByUserId") `);
    await queryRunner.query(
      `CREATE TABLE "user_avatar" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "originalFilename" text NOT NULL, "contentType" text, "fileExtension" text, "storageBucket" text NOT NULL, "storageKey" text NOT NULL, "uploadedAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b777e56620c3f1ac0308514fc4c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_detail_employmentstatus_enum" AS ENUM('employed', 'retired', 'un_employed', 'self_employed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_detail_experience_enum" AS ENUM('cfds', 'derivatives', 'securities', 'cryptos')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_detail" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "birthday" date, "phone" text, "addressLine1" text, "addressLine2" text, "city" text, "postcode" text, "state" text, "country" character varying(3), "taxId" text, "isPoaVerified" boolean NOT NULL DEFAULT false, "isPoiVerified" boolean NOT NULL DEFAULT false, "isPowVerified" boolean NOT NULL DEFAULT false, "isPoliticallyExposed" boolean NOT NULL DEFAULT false, "netCapitalUsd" double precision, "annualIncomeUsd" double precision, "approxAnnualInvestmentVolumeUsd" double precision, "occupation" text, "employmentStatus" "public"."user_detail_employmentstatus_enum", "sourceOfFunds" text, "experience" "public"."user_detail_experience_enum" array, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_673613c95633d9058a44041794d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_bc453b92c48945a858b75520ca" ON "user_detail" ("country") `);
    await queryRunner.query(`CREATE INDEX "IDX_dc36ec4a3b5edeffd1a34c71e3" ON "user_detail" ("isPoaVerified") `);
    await queryRunner.query(`CREATE INDEX "IDX_7ab044522dbc7c165e586cb0b0" ON "user_detail" ("isPoiVerified") `);
    await queryRunner.query(`CREATE INDEX "IDX_61ce5cc6c4e470292d2a5931c8" ON "user_detail" ("isPowVerified") `);
    await queryRunner.query(`CREATE INDEX "IDX_dc34f6987501fb5e9fd0c670cb" ON "user_detail" ("isPoliticallyExposed") `);
    await queryRunner.query(
      `CREATE TABLE "user_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "canDeposit" boolean NOT NULL DEFAULT true, "canWithdraw" boolean NOT NULL DEFAULT true, "canAutoWithdraw" boolean NOT NULL DEFAULT true, "maxAutoWithdrawAmount" numeric, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f3791d237cf4cc8e4524f22a535" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_316fd7ae613909398cdad41d0e" ON "user_setting" ("canDeposit") `);
    await queryRunner.query(`CREATE INDEX "IDX_5d819472349f207d3f522661a2" ON "user_setting" ("canWithdraw") `);
    await queryRunner.query(`CREATE INDEX "IDX_b710971210aa0da6aca909fa24" ON "user_setting" ("canAutoWithdraw") `);
    await queryRunner.query(
      `CREATE TYPE "public"."user_document_type_enum" AS ENUM('id_card', 'passport', 'utility_bill', 'bank_statement', 'other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_document_status_enum" AS ENUM('pending', 'verified', 'rejected', 'processing')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_document" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."user_document_type_enum" NOT NULL, "status" "public"."user_document_status_enum" NOT NULL, "originalFilename" text NOT NULL, "contentType" text, "fileExtension" text, "description" text, "storageBucket" text NOT NULL, "storageKey" text NOT NULL, "uploadedAt" TIMESTAMP NOT NULL, "actionedAt" TIMESTAMP, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18a41ed5aafb9732cfa62c8debd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_8e09c3c2412dc12d088c1e8ade" ON "user_document" ("type") `);
    await queryRunner.query(`CREATE INDEX "IDX_2e2937efbb8460104254560a6b" ON "user_document" ("status") `);
    await queryRunner.query(`CREATE INDEX "IDX_bea6ff5b6ea0d461a438a2e837" ON "user_document" ("userId") `);
    await queryRunner.query(`CREATE TYPE "public"."user_auth_session_status_enum" AS ENUM('attempted', 'complete')`);
    await queryRunner.query(
      `CREATE TABLE "user_auth_session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "hash" text NOT NULL, "ipAddress" text, "userAgent" text, "status" "public"."user_auth_session_status_enum" NOT NULL DEFAULT 'attempted', "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9305f2fa3d30c97cbe46de91477" UNIQUE ("userId", "createdAt"), CONSTRAINT "PK_be1faadd9b4398947aaa1972980" PRIMARY KEY ("id", "createdAt")) PARTITION BY RANGE ("createdAt")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_2ec50c79c575a4384ebc6ac9bf" ON "user_auth_session" ("ipAddress") `);
    await queryRunner.query(`CREATE INDEX "IDX_10c4d5bf21e3f34543db172bc0" ON "user_auth_session" ("userId") `);
    await queryRunner.query(
      `CREATE TYPE "public"."user_notification_template_enum" AS ENUM('user_welcome', 'user_confirm_email', 'user_forgot_password', 'user_password_reset', 'user_invite', 'deposit_complete', 'withdrawal_complete', 'kyc_approved', 'kyc_rejected')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_notification_status_enum" AS ENUM('pending', 'delivered', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "template" "public"."user_notification_template_enum" NOT NULL, "status" "public"."user_notification_status_enum" NOT NULL DEFAULT 'pending', "meta" json, "deliveryAttempts" integer NOT NULL DEFAULT '0', "scheduledAt" TIMESTAMP NOT NULL DEFAULT now(), "deliveredAt" TIMESTAMP, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7d84fcfff841cd6834f4f886be9" PRIMARY KEY ("id", "createdAt")) PARTITION BY RANGE ("createdAt")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_9b284a1bfb57fa200ac48a6ed3" ON "user_notification" ("template") `);
    await queryRunner.query(`CREATE INDEX "IDX_e5ddee7dd1efbea8827e445f2b" ON "user_notification" ("status") `);
    await queryRunner.query(`CREATE INDEX "IDX_dce2a8927967051c447ae10bc8" ON "user_notification" ("userId") `);
    await queryRunner.query(
      `CREATE TYPE "public"."integration_name_enum" AS ENUM('mt5', 'your_bourse', 'trade_locker', 'dx_trader', 'ctrader', 'sumsub', 'onfido', 'sendx', 'cryptochill', 'bridger_pay', 'helios')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."integration_type_enum" AS ENUM('trading_platform', 'marketing', 'kyc', 'payment')`,
    );
    await queryRunner.query(
      `CREATE TABLE "integration" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" "public"."integration_name_enum" NOT NULL, "type" "public"."integration_type_enum" NOT NULL, "isEnabled" boolean NOT NULL DEFAULT false, "settings" jsonb NOT NULL, "priority" integer NOT NULL DEFAULT '0', "allowedCountries" character varying(3) array, "excludedCountries" character varying(3) array, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_52d7fa32a7832b377fc2d7f6199" UNIQUE ("name"), CONSTRAINT "PK_f348d4694945d9dc4c7049a178a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_0f8042d2f9626359c87f3f0655" ON "integration" ("type") `);
    await queryRunner.query(`CREATE INDEX "IDX_e2780d4d78095ea3fd05e080bb" ON "integration" ("priority") `);
    await queryRunner.query(`CREATE TYPE "public"."payment_transaction_type_enum" AS ENUM('deposit', 'withdrawal')`);
    await queryRunner.query(
      `CREATE TYPE "public"."payment_transaction_status_enum" AS ENUM('open', 'rejected', 'processing', 'completed', 'failed', 'refunded')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment_transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "externalId" text, "amount" numeric NOT NULL, "paidAmount" numeric NOT NULL, "currency" character varying(3) NOT NULL, "type" "public"."payment_transaction_type_enum" NOT NULL, "status" "public"."payment_transaction_status_enum" NOT NULL, "comment" text, "metadata" jsonb, "processedAt" TIMESTAMP, "userId" uuid NOT NULL, "integrationId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e7b6f0a7f06d29d6ff522aa4a4c" UNIQUE ("externalId", "integrationId", "createdAt"), CONSTRAINT "PK_60f71bf3d278b326e8323b6d696" PRIMARY KEY ("id", "createdAt")) PARTITION BY RANGE ("createdAt")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_c30515be97af9ab6316b00ddeb" ON "payment_transaction" ("userId") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_23a1634ec0589f208f7577211a" ON "payment_transaction" ("integrationId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_in_app_notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject" text NOT NULL, "message" text NOT NULL, "openedAt" TIMESTAMP, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0dd8e6c9a1c6b6106a2e8e591c9" PRIMARY KEY ("id", "createdAt")) PARTITION BY RANGE ("createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_754568b2b741cc5901a8308d1f" ON "user_in_app_notification" ("openedAt") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_2067fd15dacc6a6dd53b7a92ca" ON "user_in_app_notification" ("userId") `);
    await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'suspended', 'deactivated')`);
    await queryRunner.query(
      `CREATE TYPE "public"."user_roles_enum" AS ENUM('admin', 'trade_support', 'cs_agent', 'compliance', 'user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" text NOT NULL, "middleName" text, "lastName" text NOT NULL, "email" text NOT NULL, "passwordHash" text NOT NULL, "securityPin" character varying NOT NULL, "status" "public"."user_status_enum" NOT NULL DEFAULT 'active', "roles" "public"."user_roles_enum" array NOT NULL, "isEmailVerified" boolean NOT NULL DEFAULT false, "emailVerifiedAt" TIMESTAMP, "isTermsAccepted" boolean NOT NULL DEFAULT false, "termsAcceptedAt" TIMESTAMP, "isPrivacyAccepted" boolean NOT NULL DEFAULT false, "privacyAcceptedAt" TIMESTAMP, "isCookiesAccepted" boolean NOT NULL DEFAULT false, "cookiesAcceptedAt" TIMESTAMP, "avatarId" uuid, "detailId" text, "settingsId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userDetailId" uuid, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_390395c3d8592e3e8d8422ce853" UNIQUE ("settingsId"), CONSTRAINT "UQ_f05fcc9b589876b45e82e17b313" UNIQUE ("detailId"), CONSTRAINT "REL_58f5c71eaab331645112cf8cfa" UNIQUE ("avatarId"), CONSTRAINT "REL_c515f2c59bd83b80cf07846a96" UNIQUE ("userDetailId"), CONSTRAINT "REL_390395c3d8592e3e8d8422ce85" UNIQUE ("settingsId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
    await queryRunner.query(`CREATE INDEX "IDX_58f5c71eaab331645112cf8cfa" ON "user" ("avatarId") `);
    await queryRunner.query(`CREATE INDEX "IDX_f05fcc9b589876b45e82e17b31" ON "user" ("detailId") `);
    await queryRunner.query(`CREATE INDEX "IDX_390395c3d8592e3e8d8422ce85" ON "user" ("settingsId") `);
    await queryRunner.query(
      `CREATE TABLE "wheel_spin" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isRespin" boolean NOT NULL DEFAULT false, "isClosed" boolean NOT NULL DEFAULT false, "sector" integer NOT NULL, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6399b3e8d7eaa97153bfebca76d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_0c29fe74363fb129ca1976554a" ON "wheel_spin" ("userId") `);
    await queryRunner.query(`CREATE TYPE "public"."trading_event_volatility_enum" AS ENUM('low', 'medium', 'high')`);
    await queryRunner.query(`CREATE TYPE "public"."trading_event_potency_enum" AS ENUM('zero', 'b', 'm', 'k', 't')`);
    await queryRunner.query(
      `CREATE TYPE "public"."trading_event_period_enum" AS ENUM('day', 'week', 'month', 'quarter', 'year')`,
    );
    await queryRunner.query(
      `CREATE TABLE "trading_event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "description" text, "volatility" "public"."trading_event_volatility_enum" NOT NULL, "potency" "public"."trading_event_potency_enum", "period" "public"."trading_event_period_enum", "startAt" date NOT NULL, "country" character varying(3), "currency" character varying(3), "consensus" double precision, "unit" character varying(3), "actual" double precision, "previous" double precision, "isReport" boolean NOT NULL DEFAULT false, "isSpeech" boolean NOT NULL DEFAULT false, "isPreliminary" boolean NOT NULL DEFAULT false, "isTradingAllowed" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c315c3a54d6b9447123c4cf9198" UNIQUE ("name", "startAt"), CONSTRAINT "PK_179a6aab8082530501a740bdad7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_af55ae940d854b7437bf79fc99" ON "trading_event" ("volatility") `);
    await queryRunner.query(`CREATE INDEX "IDX_beb6399ff1931cb49f2cd22a06" ON "trading_event" ("period") `);
    await queryRunner.query(`CREATE INDEX "IDX_f5ac67b765865549da1b3e6e13" ON "trading_event" ("startAt") `);
    await queryRunner.query(
      `CREATE TYPE "public"."platform_client_platform_enum" AS ENUM('mt5', 'ctrader', 'tradelocker', 'dxtrade')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."platform_client_type_enum" AS ENUM('windows', 'mac', 'linux', 'osx', 'android', 'web')`,
    );
    await queryRunner.query(
      `CREATE TABLE "platform_client" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "platform" "public"."platform_client_platform_enum" NOT NULL, "type" "public"."platform_client_type_enum" NOT NULL, "link" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4855805bfc5a9e538b410c4c5d9" UNIQUE ("platform", "type"), CONSTRAINT "PK_1b1eacd5b73803aef3bec878b8e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."global_setting_key_enum" AS ENUM('user_can_deposit', 'user_can_withdraw', 'user_can_auto_withdraw', 'user_max_auto_withdraw_amt')`,
    );
    await queryRunner.query(
      `CREATE TABLE "global_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" "public"."global_setting_key_enum" NOT NULL, "value" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_5d48351912deefef9e2211e771a" UNIQUE ("key"), CONSTRAINT "PK_927c9cc8b05b293568b6fccc029" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_5d48351912deefef9e2211e771" ON "global_setting" ("key") `);
    await queryRunner.query(`CREATE INDEX "IDX_ee6dede9d68f0a9f6a864558d0" ON "global_setting" ("value") `);
    await queryRunner.query(
      `CREATE TABLE "exchange_rate" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "from" character varying(3) NOT NULL, "to" character varying(3) NOT NULL, "rate" numeric NOT NULL, "date" date NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a4b3b0455c9af5059d64a0bda04" UNIQUE ("from", "to", "date"), CONSTRAINT "PK_5c5d27d2b900ef6cdeef0398472" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."alert_status_enum" AS ENUM('pending', 'delivered', 'failed')`);
    await queryRunner.query(`CREATE TYPE "public"."alert_level_enum" AS ENUM('warning', 'delivered', 'critical')`);
    await queryRunner.query(`CREATE TYPE "public"."alert_type_enum" AS ENUM('payments', 'kyc', 'other')`);
    await queryRunner.query(
      `CREATE TABLE "alert" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject" text NOT NULL, "message" text NOT NULL, "status" "public"."alert_status_enum" NOT NULL DEFAULT 'pending', "level" "public"."alert_level_enum" NOT NULL, "type" "public"."alert_type_enum" NOT NULL, "deliveryAttempts" integer NOT NULL DEFAULT '0', "scheduledAt" TIMESTAMP NOT NULL, "deliveredAt" TIMESTAMP, "channelId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e20fa49cf4f5f9a48ddfaefd5e8" PRIMARY KEY ("id", "createdAt")) PARTITION BY RANGE ("createdAt")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_0eaee3b3fe61eb74723fe719ce" ON "alert" ("status") `);
    await queryRunner.query(`CREATE INDEX "IDX_5a112a234c18bbd8df5f24d248" ON "alert" ("level") `);
    await queryRunner.query(`CREATE INDEX "IDX_976e67503908a38e535d3d6377" ON "alert" ("type") `);
    await queryRunner.query(`CREATE INDEX "IDX_5b4173bbde31cc348ea217c8a1" ON "alert" ("channelId") `);
    await queryRunner.query(`CREATE TYPE "public"."channel_type_enum" AS ENUM('email', 'slack', 'sms', 'telegram')`);
    await queryRunner.query(
      `CREATE TABLE "channel" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."channel_type_enum" NOT NULL, "isEnabled" boolean NOT NULL DEFAULT false, "settings" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_071b77ed6f24d28b08431d7c0da" UNIQUE ("type"), CONSTRAINT "PK_590f33ee6ee7d76437acf362e39" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_d3df7cfab121e44694bc9b744e" ON "channel" ("isEnabled") `);
    await queryRunner.query(
      `ALTER TABLE "trading_account_type_leverage" ADD CONSTRAINT "FK_b2b1d5983b107b64a91bf88f839" FOREIGN KEY ("tradingAccountTypeId") REFERENCES "trading_account_type"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "trading_account_type" ADD CONSTRAINT "FK_57189f0be2fc7943a94f217d47b" FOREIGN KEY ("serverId") REFERENCES "server"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "trading_account_tag" ADD CONSTRAINT "FK_d44e3bfca46203999446a556fa7" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "trading_account_tag" ADD CONSTRAINT "FK_6242ad1311294b229ee78dc71e7" FOREIGN KEY ("tradingAccountId") REFERENCES "trading_account"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "trading_account_tag" ADD CONSTRAINT "FK_1bcf082f7eae195b16dd4b35e1e" FOREIGN KEY ("taggedByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "trading_account_note" ADD CONSTRAINT "FK_f7cea51933658d5b6faea45c735" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "trading_account_note" ADD CONSTRAINT "FK_9b8d6fe43113dad71c5275c9c30" FOREIGN KEY ("tradingAccountId") REFERENCES "trading_account"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction_history" ADD CONSTRAINT "FK_a5e230a983916c53f15b7b64645" FOREIGN KEY ("tradingAccountId") REFERENCES "trading_account"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction_history" ADD CONSTRAINT "FK_f80db91119dbacc5f6ed1f62bcb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction_history" ADD CONSTRAINT "FK_5a8241c79ab3ecbaa4386051955" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "trading_account" ADD CONSTRAINT "FK_c7fc44c34f7727c055541a3be6f" FOREIGN KEY ("serverId") REFERENCES "server"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "trading_account" ADD CONSTRAINT "FK_6e4e317edbe690900ebad00b98c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_01fd2ad964a28e540fd26c855c4" FOREIGN KEY ("tradingAccountId") REFERENCES "trading_account"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_9071d3c9266c4521bdafe29307a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_07de5136ba8e92bb97d45b9a7af" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" ADD CONSTRAINT "FK_35472b1fe48b6330cd349709564" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_history" ADD CONSTRAINT "FK_3d0094ee38350ffdcb38f1282e2" FOREIGN KEY ("loyaltyId") REFERENCES "loyalty"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_history" ADD CONSTRAINT "FK_c1aa0a0f83df296557b410f5b93" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty" ADD CONSTRAINT "FK_a7e5fcf9e75f61d7a58c84046e1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_note" ADD CONSTRAINT "FK_071db9921110b2fe5d57cb70f9d" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_note" ADD CONSTRAINT "FK_236dbd155cee61376a015913576" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_log" ADD CONSTRAINT "FK_2621409ebc295c5da7ff3e41396" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" ADD CONSTRAINT "FK_a821ee4020f454d776e2d27da24" FOREIGN KEY ("sentByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_document" ADD CONSTRAINT "FK_bea6ff5b6ea0d461a438a2e837c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth_session" ADD CONSTRAINT "FK_10c4d5bf21e3f34543db172bc00" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification" ADD CONSTRAINT "FK_dce2a8927967051c447ae10bc8b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_transaction" ADD CONSTRAINT "FK_c30515be97af9ab6316b00ddeb1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_transaction" ADD CONSTRAINT "FK_23a1634ec0589f208f7577211a3" FOREIGN KEY ("integrationId") REFERENCES "integration"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_in_app_notification" ADD CONSTRAINT "FK_2067fd15dacc6a6dd53b7a92cae" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_58f5c71eaab331645112cf8cfa5" FOREIGN KEY ("avatarId") REFERENCES "user_avatar"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_c515f2c59bd83b80cf07846a968" FOREIGN KEY ("userDetailId") REFERENCES "user_detail"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_390395c3d8592e3e8d8422ce853" FOREIGN KEY ("settingsId") REFERENCES "user_setting"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "wheel_spin" ADD CONSTRAINT "FK_0c29fe74363fb129ca1976554a7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert" ADD CONSTRAINT "FK_5b4173bbde31cc348ea217c8a1d" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "alert" DROP CONSTRAINT "FK_5b4173bbde31cc348ea217c8a1d"`);
    await queryRunner.query(`ALTER TABLE "wheel_spin" DROP CONSTRAINT "FK_0c29fe74363fb129ca1976554a7"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_390395c3d8592e3e8d8422ce853"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c515f2c59bd83b80cf07846a968"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_58f5c71eaab331645112cf8cfa5"`);
    await queryRunner.query(`ALTER TABLE "user_in_app_notification" DROP CONSTRAINT "FK_2067fd15dacc6a6dd53b7a92cae"`);
    await queryRunner.query(`ALTER TABLE "payment_transaction" DROP CONSTRAINT "FK_23a1634ec0589f208f7577211a3"`);
    await queryRunner.query(`ALTER TABLE "payment_transaction" DROP CONSTRAINT "FK_c30515be97af9ab6316b00ddeb1"`);
    await queryRunner.query(`ALTER TABLE "user_notification" DROP CONSTRAINT "FK_dce2a8927967051c447ae10bc8b"`);
    await queryRunner.query(`ALTER TABLE "user_auth_session" DROP CONSTRAINT "FK_10c4d5bf21e3f34543db172bc00"`);
    await queryRunner.query(`ALTER TABLE "user_document" DROP CONSTRAINT "FK_bea6ff5b6ea0d461a438a2e837c"`);
    await queryRunner.query(`ALTER TABLE "invitation" DROP CONSTRAINT "FK_a821ee4020f454d776e2d27da24"`);
    await queryRunner.query(`ALTER TABLE "audit_log" DROP CONSTRAINT "FK_2621409ebc295c5da7ff3e41396"`);
    await queryRunner.query(`ALTER TABLE "user_note" DROP CONSTRAINT "FK_236dbd155cee61376a015913576"`);
    await queryRunner.query(`ALTER TABLE "user_note" DROP CONSTRAINT "FK_071db9921110b2fe5d57cb70f9d"`);
    await queryRunner.query(`ALTER TABLE "loyalty" DROP CONSTRAINT "FK_a7e5fcf9e75f61d7a58c84046e1"`);
    await queryRunner.query(`ALTER TABLE "loyalty_history" DROP CONSTRAINT "FK_c1aa0a0f83df296557b410f5b93"`);
    await queryRunner.query(`ALTER TABLE "loyalty_history" DROP CONSTRAINT "FK_3d0094ee38350ffdcb38f1282e2"`);
    await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "FK_35472b1fe48b6330cd349709564"`);
    await queryRunner.query(`ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_07de5136ba8e92bb97d45b9a7af"`);
    await queryRunner.query(`ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_9071d3c9266c4521bdafe29307a"`);
    await queryRunner.query(`ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_01fd2ad964a28e540fd26c855c4"`);
    await queryRunner.query(`ALTER TABLE "trading_account" DROP CONSTRAINT "FK_6e4e317edbe690900ebad00b98c"`);
    await queryRunner.query(`ALTER TABLE "trading_account" DROP CONSTRAINT "FK_c7fc44c34f7727c055541a3be6f"`);
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction_history" DROP CONSTRAINT "FK_5a8241c79ab3ecbaa4386051955"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction_history" DROP CONSTRAINT "FK_f80db91119dbacc5f6ed1f62bcb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction_history" DROP CONSTRAINT "FK_a5e230a983916c53f15b7b64645"`,
    );
    await queryRunner.query(`ALTER TABLE "trading_account_note" DROP CONSTRAINT "FK_9b8d6fe43113dad71c5275c9c30"`);
    await queryRunner.query(`ALTER TABLE "trading_account_note" DROP CONSTRAINT "FK_f7cea51933658d5b6faea45c735"`);
    await queryRunner.query(`ALTER TABLE "trading_account_tag" DROP CONSTRAINT "FK_1bcf082f7eae195b16dd4b35e1e"`);
    await queryRunner.query(`ALTER TABLE "trading_account_tag" DROP CONSTRAINT "FK_6242ad1311294b229ee78dc71e7"`);
    await queryRunner.query(`ALTER TABLE "trading_account_tag" DROP CONSTRAINT "FK_d44e3bfca46203999446a556fa7"`);
    await queryRunner.query(`ALTER TABLE "trading_account_type" DROP CONSTRAINT "FK_57189f0be2fc7943a94f217d47b"`);
    await queryRunner.query(
      `ALTER TABLE "trading_account_type_leverage" DROP CONSTRAINT "FK_b2b1d5983b107b64a91bf88f839"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_d3df7cfab121e44694bc9b744e"`);
    await queryRunner.query(`DROP TABLE "channel"`);
    await queryRunner.query(`DROP TYPE "public"."channel_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5b4173bbde31cc348ea217c8a1"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_976e67503908a38e535d3d6377"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5a112a234c18bbd8df5f24d248"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0eaee3b3fe61eb74723fe719ce"`);
    await queryRunner.query(`DROP TABLE "alert"`);
    await queryRunner.query(`DROP TYPE "public"."alert_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."alert_level_enum"`);
    await queryRunner.query(`DROP TYPE "public"."alert_status_enum"`);
    await queryRunner.query(`DROP TABLE "exchange_rate"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ee6dede9d68f0a9f6a864558d0"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5d48351912deefef9e2211e771"`);
    await queryRunner.query(`DROP TABLE "global_setting"`);
    await queryRunner.query(`DROP TYPE "public"."global_setting_key_enum"`);
    await queryRunner.query(`DROP TABLE "platform_client"`);
    await queryRunner.query(`DROP TYPE "public"."platform_client_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."platform_client_platform_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f5ac67b765865549da1b3e6e13"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_beb6399ff1931cb49f2cd22a06"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_af55ae940d854b7437bf79fc99"`);
    await queryRunner.query(`DROP TABLE "trading_event"`);
    await queryRunner.query(`DROP TYPE "public"."trading_event_period_enum"`);
    await queryRunner.query(`DROP TYPE "public"."trading_event_potency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."trading_event_volatility_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0c29fe74363fb129ca1976554a"`);
    await queryRunner.query(`DROP TABLE "wheel_spin"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_390395c3d8592e3e8d8422ce85"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f05fcc9b589876b45e82e17b31"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_58f5c71eaab331645112cf8cfa"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "public"."user_roles_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2067fd15dacc6a6dd53b7a92ca"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_754568b2b741cc5901a8308d1f"`);
    await queryRunner.query(`DROP TABLE "user_in_app_notification"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_23a1634ec0589f208f7577211a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c30515be97af9ab6316b00ddeb"`);
    await queryRunner.query(`DROP TABLE "payment_transaction"`);
    await queryRunner.query(`DROP TYPE "public"."payment_transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payment_transaction_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e2780d4d78095ea3fd05e080bb"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0f8042d2f9626359c87f3f0655"`);
    await queryRunner.query(`DROP TABLE "integration"`);
    await queryRunner.query(`DROP TYPE "public"."integration_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."integration_name_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_dce2a8927967051c447ae10bc8"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e5ddee7dd1efbea8827e445f2b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9b284a1bfb57fa200ac48a6ed3"`);
    await queryRunner.query(`DROP TABLE "user_notification"`);
    await queryRunner.query(`DROP TYPE "public"."user_notification_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_notification_template_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_10c4d5bf21e3f34543db172bc0"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2ec50c79c575a4384ebc6ac9bf"`);
    await queryRunner.query(`DROP TABLE "user_auth_session"`);
    await queryRunner.query(`DROP TYPE "public"."user_auth_session_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bea6ff5b6ea0d461a438a2e837"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2e2937efbb8460104254560a6b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8e09c3c2412dc12d088c1e8ade"`);
    await queryRunner.query(`DROP TABLE "user_document"`);
    await queryRunner.query(`DROP TYPE "public"."user_document_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_document_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b710971210aa0da6aca909fa24"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5d819472349f207d3f522661a2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_316fd7ae613909398cdad41d0e"`);
    await queryRunner.query(`DROP TABLE "user_setting"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_dc34f6987501fb5e9fd0c670cb"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_61ce5cc6c4e470292d2a5931c8"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7ab044522dbc7c165e586cb0b0"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_dc36ec4a3b5edeffd1a34c71e3"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bc453b92c48945a858b75520ca"`);
    await queryRunner.query(`DROP TABLE "user_detail"`);
    await queryRunner.query(`DROP TYPE "public"."user_detail_experience_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_detail_employmentstatus_enum"`);
    await queryRunner.query(`DROP TABLE "user_avatar"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a821ee4020f454d776e2d27da2"`);
    await queryRunner.query(`DROP TABLE "invitation"`);
    await queryRunner.query(`DROP TYPE "public"."invitation_roles_enum"`);
    await queryRunner.query(`DROP TYPE "public"."invitation_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_789c93161549f4a123834e2ef2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2621409ebc295c5da7ff3e4139"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6bf30b22728b8da796a0318354"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8ae954f53cbae392e68fe3181e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0d76b9269d1a17f43c0f38a4fa"`);
    await queryRunner.query(`DROP TABLE "audit_log"`);
    await queryRunner.query(`DROP TYPE "public"."audit_log_result_enum"`);
    await queryRunner.query(`DROP TYPE "public"."audit_log_targettype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."audit_log_targetaction_enum"`);
    await queryRunner.query(`DROP TYPE "public"."audit_log_actor_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_236dbd155cee61376a01591357"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_071db9921110b2fe5d57cb70f9"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f41080bfa60a302640e365e552"`);
    await queryRunner.query(`DROP TABLE "user_note"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a7e5fcf9e75f61d7a58c84046e"`);
    await queryRunner.query(`DROP TABLE "loyalty"`);
    await queryRunner.query(`DROP TYPE "public"."loyalty_program_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c1aa0a0f83df296557b410f5b9"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3d0094ee38350ffdcb38f1282e"`);
    await queryRunner.query(`DROP TABLE "loyalty_history"`);
    await queryRunner.query(`DROP TYPE "public"."loyalty_history_source_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_35472b1fe48b6330cd34970956"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_852bd836234c8f7777ec35957f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f91dbefa771fbcbde7dc44ea08"`);
    await queryRunner.query(`DROP TABLE "wallet"`);
    await queryRunner.query(`DROP TYPE "public"."wallet_assettype_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_07de5136ba8e92bb97d45b9a7a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9071d3c9266c4521bdafe29307"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_01fd2ad964a28e540fd26c855c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c73c76a0e033bed04036835fce"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_060e96e8f43c47d27653d757fc"`);
    await queryRunner.query(`DROP TABLE "wallet_transaction"`);
    await queryRunner.query(`DROP TYPE "public"."wallet_transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."wallet_transaction_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6e4e317edbe690900ebad00b98"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c7fc44c34f7727c055541a3be6"`);
    await queryRunner.query(`DROP TABLE "trading_account"`);
    await queryRunner.query(`DROP TYPE "public"."trading_account_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."trading_account_monetization_enum"`);
    await queryRunner.query(`DROP TYPE "public"."trading_account_platform_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5a8241c79ab3ecbaa438605195"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f80db91119dbacc5f6ed1f62bc"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a5e230a983916c53f15b7b6464"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_964e7e809f04289fba17efa595"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4e343762e1fab760d9248dda1d"`);
    await queryRunner.query(`DROP TABLE "wallet_transaction_history"`);
    await queryRunner.query(`DROP TYPE "public"."wallet_transaction_history_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9b8d6fe43113dad71c5275c9c3"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f7cea51933658d5b6faea45c73"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1a124cb89d5f68383e8b7bcdfb"`);
    await queryRunner.query(`DROP TABLE "trading_account_note"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1bcf082f7eae195b16dd4b35e1"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6242ad1311294b229ee78dc71e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d44e3bfca46203999446a556fa"`);
    await queryRunner.query(`DROP TABLE "trading_account_tag"`);
    await queryRunner.query(`DROP TABLE "tag"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_52e1ed2ce967ea8db8993eb74e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_902704dee723d735fa0af911f4"`);
    await queryRunner.query(`DROP TABLE "server"`);
    await queryRunner.query(`DROP TYPE "public"."server_monetization_enum"`);
    await queryRunner.query(`DROP TYPE "public"."server_platform_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_57189f0be2fc7943a94f217d47"`);
    await queryRunner.query(`DROP TABLE "trading_account_type"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b2b1d5983b107b64a91bf88f83"`);
    await queryRunner.query(`DROP TABLE "trading_account_type_leverage"`);
  }
}
