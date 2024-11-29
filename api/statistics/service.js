const pool = require("../../config/database");

async function getBookingCountByStatus() {
  const query = `
    SELECT 
      status,
      COUNT(*) AS count
    FROM book_services
    GROUP BY status;
  `;
  const result = await pool.query(query);

  if (!Array.isArray(result) || result.length === 0) {
    return [];
  }

  const [rows] = result;
  return rows;
}

async function getStatisticsByMonth(year) {
  const query = `
    SELECT 
      MONTH(schedule_time) AS month,
      COUNT(DISTINCT book_id) AS booking_count,
      SUM(total_price) AS revenue,
      COUNT(DISTINCT expert_id) AS expert_count
    FROM book_services
    WHERE YEAR(schedule_time) = ?
    GROUP BY MONTH(schedule_time)
    ORDER BY month;
  `;
  const result = await pool.query(query);

  if (!Array.isArray(result) || result.length === 0) {
    return [];
  }

  const [rows] = result;
  return rows;
}

module.exports = {
  getBookingCountByStatus,
  getStatisticsByMonth,
};
