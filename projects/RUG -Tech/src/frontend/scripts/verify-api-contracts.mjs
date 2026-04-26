import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, "..");
const backendRoot = path.resolve(frontendRoot, "../backend");

function read(relPath, root = frontendRoot) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function parsePythonEnumMembers(source, enumName) {
  const classMatch = source.match(
    new RegExp(`class\\s+${enumName}\\(str,\\s*Enum\\):([\\s\\S]*?)(?:\\nclass\\s+|$)`),
  );
  if (!classMatch) return [];
  return [...classMatch[1].matchAll(/=\s*"([^"]+)"/g)].map((m) => m[1]);
}

function parseTsStringUnion(source, typeName) {
  const inline = source.match(
    new RegExp(`type\\s+${typeName}\\s*=\\s*([^;]+);`, "m"),
  );
  if (inline) {
    return [...inline[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  }

  const block = source.match(
    new RegExp(`type\\s+${typeName}\\s*=([\\s\\S]*?);`, "m"),
  );
  if (!block) return [];
  return [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

function key(method, route) {
  return `${method.toUpperCase()} ${route}`;
}

const frontendContracts = [
  ["POST", "/auth/login"],
  ["GET", "/auth/me"],
  ["POST", "/auth/refresh"],
  ["POST", "/auth/logout"],
  ["GET", "/patients"],
  ["GET", "/patients/{id}"],
  ["POST", "/patients"],
  ["PUT", "/patients/{id}"],
  ["GET", "/cases"],
  ["GET", "/cases/{id}"],
  ["POST", "/cases/upload"],
  ["GET", "/cases/{id}/status"],
  ["PATCH", "/cases/{id}/approve"],
  ["PATCH", "/cases/{id}/reject"],
  ["GET", "/analysis/{id}"],
  ["GET", "/reports/{id}/doctor"],
  ["GET", "/reports/{id}/patient"],
  ["GET", "/reports/{id}/general"],
  ["GET", "/reports/{id}/pdf"],
  ["POST", "/reports/{id}/share"],
  ["GET", "/admin/clinics"],
  ["POST", "/admin/clinics"],
  ["GET", "/admin/users"],
  ["POST", "/admin/users"],
  ["POST", "/admin/users/{id}/status"],
  ["GET", "/admin/stats"],
].map(([m, r]) => key(m, r));

const backendContracts = [
  ["GET", "/health"],
  ["GET", "/health/ready"],
  ["POST", "/auth/login"],
  ["GET", "/auth/me"],
  ["POST", "/auth/refresh"],
  ["POST", "/auth/logout"],
  ["POST", "/patients"],
  ["GET", "/patients"],
  ["GET", "/patients/{id}"],
  ["PUT", "/patients/{id}"],
  ["POST", "/cases/upload"],
  ["GET", "/cases"],
  ["GET", "/cases/{id}"],
  ["GET", "/cases/{id}/status"],
  ["PATCH", "/cases/{id}/approve"],
  ["PATCH", "/cases/{id}/reject"],
  ["GET", "/analysis/{id}"],
  ["POST", "/reports/generate"],
  ["GET", "/reports"],
  ["GET", "/reports/{id}"],
  ["GET", "/reports/{id}/doctor"],
  ["GET", "/reports/{id}/patient"],
  ["GET", "/reports/{id}/pdf"],
  ["GET", "/reports/{id}/general"],
  ["POST", "/reports/{id}/share"],
  ["GET", "/admin/clinics"],
  ["POST", "/admin/clinics"],
  ["GET", "/admin/users"],
  ["POST", "/admin/users"],
  ["POST", "/admin/users/{id}/status"],
  ["GET", "/admin/stats"],
].map(([m, r]) => key(m, r));

const missingInBackend = frontendContracts.filter((c) => !backendContracts.includes(c));
const apiClientSource = read("services/api.client.ts");
const caseTypesSource = read("types/case.types.ts");
const backendEnumsSource = read("app/schemas/enums.py", backendRoot);

const backendImageQuality = parsePythonEnumMembers(backendEnumsSource, "ImageQuality");
const frontendImageQuality = parseTsStringUnion(caseTypesSource, "ImageQuality");
const missingImageQuality = backendImageQuality.filter(
  (value) => !frontendImageQuality.includes(value),
);

const hardFailures = [];
const warnings = [];

if (!apiClientSource.includes('const API_PREFIX = "/api/v1";')) {
  hardFailures.push("Frontend API prefix is not '/api/v1' in services/api.client.ts");
}

if (missingInBackend.length > 0) {
  hardFailures.push(
    `Frontend endpoints with no backend match: ${missingInBackend.join(", ")}`,
  );
}

if (missingImageQuality.length > 0) {
  hardFailures.push(
    `Frontend ImageQuality is missing backend values: ${missingImageQuality.join(", ")}`,
  );
}

warnings.push(
  "Note: clinicId is conditionally required by backend for some super_admin patient creation flows.",
);
warnings.push(
  "Note: reports general payload uses loose nested analysis fields from backend; keep frontend types tolerant.",
);

if (hardFailures.length > 0) {
  console.error("API contract verification failed.");
  for (const failure of hardFailures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("API contract verification passed.");
for (const warning of warnings) {
  console.log(`- ${warning}`);
}
