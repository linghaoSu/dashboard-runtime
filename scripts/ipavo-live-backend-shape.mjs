export function isVersionInfo(body) {
  if (!isPlainObject(body)) {
    return false;
  }

  return [
    "gitVersion",
    "gitCommit",
    "buildDate",
    "goVersion",
    "compiler",
    "platform"
  ].some((key) => typeof body[key] === "string" && body[key].trim());
}

export function isResourceSummary(body) {
  if (!isPlainObject(body)) {
    return false;
  }

  return ["clusterCount", "nodeCount", "podCount"].every((key) =>
    isResourceCount(body[key])
  );
}

function isResourceCount(value) {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    isNonNegativeFiniteNumber(value.healthy) &&
    isNonNegativeFiniteNumber(value.total) &&
    value.healthy <= value.total
  );
}

function isNonNegativeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
