function createReferenceCode(lc = "NAMS") {
  const prefix = lc.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 4) || "NAMS";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `NAMS-${prefix}-${timestamp}-${random}`;
}

function toIsoTimestamp(date) {
  return new Date(date).toISOString();
}

module.exports = {
  createReferenceCode,
  toIsoTimestamp
};
