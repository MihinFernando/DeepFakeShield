/**
 * @typedef {Object} ScanResult
 * @property {"fake" | "real" | "unknown"} label
 * @property {number} confidence  // 0..1
 * @property {"fake" | "real"} decision
 * @property {boolean} is_confident
 * @property {number} threshold  // e.g., 0.8
 * @property {string} timestamp  // human readable
 */

/**
 * @typedef {Object} ScanHistoryItem
 * @property {string} filename
 * @property {"fake" | "real"} decision
 * @property {number|null} confidence
 * @property {number|null} threshold
 * @property {string} timestamp
 */
